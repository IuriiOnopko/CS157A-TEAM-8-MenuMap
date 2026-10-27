package com.menumap.api;

import com.menumap.db.Database;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * GET /api/restaurants?q=&diet=&maxCalories=&open=1   search (no sign-in needed)
 * GET /api/restaurants/{id}                           one restaurant with its hours and menu
 *
 * Every word of q has to match the restaurant (name, city, description, cuisine) or one of its dishes
 * (name, description, dietary label). diet and maxCalories keep restaurants that have at least one
 * available dish meeting both. Suspended restaurants (is_active = 0) never show up
 */
@WebServlet({"/api/restaurants", "/api/restaurants/*"})
public class RestaurantServlet extends HttpServlet {

    record RestaurantSummary(long id, String name, String description, String phone, String streetAddress, 
                                String city, String state, String postalCode, double lat, double lng, Integer priceLevel, 
                                    boolean isOpen, List<String> cuisines, List<String> matchingItems) {}

    record OpeningHours(String weekday, String opensAt, String closesAt, boolean isClosed) {}

    record Nutrition(String servingSize, BigDecimal calories, BigDecimal proteinG, BigDecimal carbohydratesG,
                     BigDecimal fatG, BigDecimal sodiumMg) {}

    record MenuItem(int categoryId, int itemId, String name, String description, BigDecimal price,
                    boolean isAvailable, Nutrition nutrition, List<String> dietary, List<String> allergens) {}

    record MenuCategory(int id, String name, String description, List<MenuItem> items) {}

    // restriction is set when the signed-in customer isn't allowed to order here
    record RestaurantDetail(RestaurantSummary restaurant, List<OpeningHours> hours, List<MenuCategory> menu,
                            Restrictions.Restriction restriction) {}

    private static final int MAX_WORDS = 8;
    private static final int MAX_MATCHES_SHOWN = 3;

    // coordinates is stored as POINT(longitude, latitude), 
    // so breaking them apart as ST_X - the longitude and ST_Y - latitude.
    // GROUP_CONCAT glues the cuisine names into one "Seafood|Asian" string, primary cuisine first
    private static final String RESTAURANT_SQL =
            "SELECT r.restaurant_id, r.name, r.description, r.phone, r.street_address, r.city, r.state, "
            + "r.postal_code, ST_Y(r.coordinates) AS lat, ST_X(r.coordinates) AS lng, r.price_level, r.is_open, "
            + "(SELECT GROUP_CONCAT(c.name ORDER BY rc.is_primary DESC, c.name SEPARATOR '|') "
            + "FROM restaurant_cuisine rc, cuisine c "
            + "WHERE rc.restaurant_id = r.restaurant_id AND rc.cuisine_id = c.cuisine_id) AS cuisines "
            + "FROM restaurant r WHERE r.is_active = 1";

    // one search word compared against menu item: its name, description or a dietary label (3 params)
    private static final String WORD_MATCHES_DISH =
            "(mi.name LIKE ? OR mi.description LIKE ?"
            + " OR EXISTS (SELECT * FROM item_dietary_classification idc, dietary_classification dc"
            + " WHERE idc.restaurant_id = mi.restaurant_id AND idc.category_id = mi.category_id"
            + " AND idc.item_id = mi.item_id AND idc.classification_id = dc.classification_id AND dc.name LIKE ?))";

    // one search word compared across restaurant's name, city, description, a cuisine, or any of its menu items (7 params)
    private static final String WORD_MATCHES_RESTAURANT =
            " AND (r.name LIKE ? OR r.city LIKE ? OR r.description LIKE ?"
            + " OR EXISTS (SELECT * FROM restaurant_cuisine rc, cuisine c"
            + " WHERE rc.restaurant_id = r.restaurant_id AND rc.cuisine_id = c.cuisine_id AND c.name LIKE ?)"
            + " OR EXISTS (SELECT * FROM menu_item mi WHERE mi.restaurant_id = r.restaurant_id AND "
            + WORD_MATCHES_DISH + "))";

    // the diet and calorie filters for dish AKA menu item 
    private static final String DISH_HAS_DIET =
            " AND EXISTS (SELECT * FROM item_dietary_classification idc"
            + " WHERE idc.restaurant_id = mi.restaurant_id AND idc.category_id = mi.category_id"
            + " AND idc.item_id = mi.item_id AND idc.classification_id = ?)";

    // none of those are unique, so need full scope
    private static final String DISH_MAX_CALORIES =
            " AND EXISTS (SELECT * FROM nutrition_fact nf"
            + " WHERE nf.restaurant_id = mi.restaurant_id AND nf.category_id = mi.category_id"
            + " AND nf.item_id = mi.item_id AND nf.calories <= ?)";

    // weekday is an ENUM, so ORDER BY sorts it MONDAY..SUNDAY. TIME_FORMAT turns "11:00:00" into "11:00"
    private static final String HOURS_SQL =
            "SELECT weekday, TIME_FORMAT(opens_at, '%H:%i') AS opens_at, TIME_FORMAT(closes_at, '%H:%i') AS closes_at, "
            + "is_closed FROM restaurant_hours WHERE restaurant_id = ? ORDER BY weekday";

    // ignores inactive categories
    private static final String CATEGORY_SQL =
            "SELECT category_id, name, description FROM menu_category "
            + "WHERE restaurant_id = ? AND is_active = 1 ORDER BY display_order, name";

    // every dish with its nutrition facts, dietary labels and allergens (a dish has an allergen if any of its ingredients does)
    // LEFT JOIN keeps dishes with no nutrition fact row, using NULL for the missing columns 
    private static final String ITEM_SQL =
            "SELECT mi.category_id, mi.item_id, mi.name, mi.description, mi.price, mi.is_available, "

            // nutrition
            + "nf.serving_size, nf.calories, nf.protein_g, nf.carbohydrates_g, nf.fat_g, nf.sodium_mg, "
            // dietary classifications
            + "(SELECT GROUP_CONCAT(dc.name ORDER BY dc.name SEPARATOR '|') "
            + "FROM item_dietary_classification idc, dietary_classification dc "
            + "WHERE idc.restaurant_id = mi.restaurant_id AND idc.category_id = mi.category_id "
            + "AND idc.item_id = mi.item_id AND idc.classification_id = dc.classification_id) AS dietary, "
            // allergens
            + "(SELECT GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR '|') "
            + "FROM menu_item_ingredient mii, ingredient_allergen ia, allergen a "
            + "WHERE mii.restaurant_id = mi.restaurant_id AND mii.category_id = mi.category_id "
            + "AND mii.item_id = mi.item_id AND mii.ingredient_id = ia.ingredient_id "
            + "AND ia.allergen_id = a.allergen_id) AS allergens "

            + "FROM menu_item mi LEFT JOIN nutrition_fact nf ON nf.restaurant_id = mi.restaurant_id "
            + "AND nf.category_id = mi.category_id AND nf.item_id = mi.item_id "
            + "WHERE mi.restaurant_id = ? ORDER BY mi.name";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        try (Connection conn = Database.getConnection()) {
            if (path == null || path.equals("/")) {
                Json.write(resp, 200, search(conn, req));
            } else {
                Json.write(resp, 200, detail(conn, path, CurrentUser.id(req)));
            }
        } catch (ApiError e) {
            Json.error(resp, e.status, e.getMessage());
        } catch (SQLException e) {
            log("Restaurant query failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }


    private static List<RestaurantSummary> search(Connection conn, HttpServletRequest req) throws SQLException, ApiError {
        // unpackages query params
        // capped at MAX_WORDS, so a huge search won't result in a large SQL statement
        String q = req.getParameter("q");
        List<String> words = q == null || q.isBlank() ? 
            List.of() : Arrays.stream(q.trim().split("\\s+")).limit(MAX_WORDS).toList();
        
        Integer dietId = intParam(req, "diet");
        Integer maxCalories = intParam(req, "maxCalories");

        // create query based on dietary filters and max calories
        String dishFilters = "mi.is_available = 1";
        List<Object> dishParams = new ArrayList<>();
        if (dietId != null) {
            dishFilters += DISH_HAS_DIET;
            dishParams.add(dietId);
        }
        if (maxCalories != null) {
            dishFilters += DISH_MAX_CALORIES;
            dishParams.add(maxCalories);
        }

        // every word has to match (uses AND). If there are filters, 
        // at least one dish has to pass them for restaurant to be eligible
        String sql = RESTAURANT_SQL;
        List<Object> params = new ArrayList<>();
        for (String word : words) {
            sql += WORD_MATCHES_RESTAURANT;
            String p = like(word); // convert into "%word%" form
            params.addAll(List.of(p, p, p, p, p, p, p)); // 7 params needed
        }
        if (!dishParams.isEmpty()) {
            sql += " AND EXISTS (SELECT * FROM menu_item mi WHERE mi.restaurant_id = r.restaurant_id AND "
                    + dishFilters + ")";
            params.addAll(dishParams);
        }

        if ("1".equals(req.getParameter("open")))
            sql += " AND r.is_open = 1";
        
        sql += " ORDER BY r.name";

        Map<Long, List<String>> matches = matchingDishes(conn, words, dishFilters, dishParams);
        List<RestaurantSummary> result = new ArrayList<>();
        try (PreparedStatement ps = Database.prepare(conn, sql, params.toArray());
                ResultSet rs = ps.executeQuery()) {
            while (rs.next())
                result.add(summary(rs, matches.getOrDefault(rs.getLong("restaurant_id"), List.of())));
            
        }
        return result;
    }

    // names of the dishes that explain each result (match in dishes)
    private static Map<Long, List<String>> matchingDishes(Connection conn, List<String> words, String dishFilters,
                                                            List<Object> dishParams) throws SQLException {
        Map<Long, List<String>> matches = new HashMap<>();
        if (words.isEmpty() && dishParams.isEmpty())
            return matches;

        // a dish counts if it passes the filters and matches at least one of the words.
        // used FALSE in the beginning to init OR compare 
        String sql = "SELECT mi.restaurant_id, mi.name FROM menu_item mi WHERE " + dishFilters;
        List<Object> params = new ArrayList<>(dishParams);
        if (!words.isEmpty()) {
            sql += " AND (FALSE";
            for (String word : words) {
                sql += " OR " + WORD_MATCHES_DISH;
                String p = like(word);
                params.addAll(List.of(p, p, p)); // 3 params
            }
            sql += ")";
        }
        sql += " ORDER BY mi.name";

        // creates the map of rest_id and matching dishes
        try (PreparedStatement ps = Database.prepare(conn, sql, params.toArray());
                ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                long id = rs.getLong("restaurant_id");
                if (!matches.containsKey(id))
                    matches.put(id, new ArrayList<>());

                List<String> names = matches.get(id);
                if (names.size() < MAX_MATCHES_SHOWN)
                    names.add(rs.getString("name"));
            }
        }

        return matches;
    }

    // returns null if missing or blank, throws 400 if invalid
    private static Integer intParam(HttpServletRequest req, String name) throws ApiError {
        String value = req.getParameter(name);
        if (value == null || value.isBlank())
            return null;
        
        try {
            return Integer.valueOf(value.trim());
        } catch (NumberFormatException e) {
            throw new ApiError(400, "diet and maxCalories must be whole numbers.");
        }
    }

    // surrounds word with "%" for any search direction, and updates the signs to actual meaning.
    // users \ is replaced with \\ to actually process the symbol. Similarly % -> \% and _ -> \_
    private static String like(String word) {
        return "%" + word.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
    }


    private static RestaurantDetail detail(Connection conn, String path, Long customerId) throws SQLException, ApiError {
        long id;
        try {
            id = Long.parseLong(path.substring(1)); // path is "/{id}"
        } catch (NumberFormatException e) {
            throw new ApiError(404, "Restaurant not found.");
        }

        RestaurantSummary restaurant;
        try (PreparedStatement ps = Database.prepare(conn, RESTAURANT_SQL + " AND r.restaurant_id = ?", id);
                ResultSet rs = ps.executeQuery()) {
            if (!rs.next())
                throw new ApiError(404, "Restaurant not found.");

            restaurant = summary(rs, List.of());
        }

        return new RestaurantDetail(restaurant, hours(conn, id), menu(conn, id), Restrictions.activeFor(conn, id, customerId));
    }

    // TODO: does not take into account exceptions, need to consider them in the future
    private static List<OpeningHours> hours(Connection conn, long restaurantId) throws SQLException {
        List<OpeningHours> hours = new ArrayList<>();
        try (PreparedStatement ps = Database.prepare(conn, HOURS_SQL, restaurantId);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next())
                hours.add(new OpeningHours(rs.getString("weekday"), rs.getString("opens_at"),
                        rs.getString("closes_at"), rs.getBoolean("is_closed")));
        }

        return hours;
    }

    private static List<MenuCategory> menu(Connection conn, long restaurantId) throws SQLException {
        // query returns categories in dsiplay order. Couldn't use simple HashMap, since would be ordered by category_id
        Map<Integer, MenuCategory> categories = new LinkedHashMap<>();
        try (PreparedStatement ps = Database.prepare(conn, CATEGORY_SQL, restaurantId);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                int id = rs.getInt("category_id");
                categories.put(id, new MenuCategory(id, rs.getString("name"),
                    rs.getString("description"), new ArrayList<>()));
            }
        }

        try (PreparedStatement ps = Database.prepare(conn, ITEM_SQL, restaurantId);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                MenuCategory category = categories.get(rs.getInt("category_id"));
                if (category == null)
                    continue; // its category is inactive (ITEM_SQL loads all)
                
                // used in menuitem
                Nutrition nutrition = rs.getString("serving_size") == null ? null : new Nutrition(
                        rs.getString("serving_size"), rs.getBigDecimal("calories"), rs.getBigDecimal("protein_g"),
                        rs.getBigDecimal("carbohydrates_g"), rs.getBigDecimal("fat_g"), rs.getBigDecimal("sodium_mg"));
                
                category.items().add(new MenuItem(category.id(), rs.getInt("item_id"), rs.getString("name"),
                    rs.getString("description"), rs.getBigDecimal("price"), rs.getBoolean("is_available"),
                    nutrition, list(rs.getString("dietary")), list(rs.getString("allergens"))));
            }
        }

        return new ArrayList<>(categories.values());
    }



    private static RestaurantSummary summary(ResultSet rs, List<String> matchingItems) throws SQLException {
        return new RestaurantSummary(rs.getLong("restaurant_id"), rs.getString("name"), rs.getString("description"),
                rs.getString("phone"), rs.getString("street_address"), rs.getString("city"), rs.getString("state"),
                rs.getString("postal_code"), rs.getDouble("lat"), rs.getDouble("lng"),
                rs.getObject("price_level", Integer.class), rs.getBoolean("is_open"),
                list(rs.getString("cuisines")), matchingItems);
    }

    // undoes GROUP_CONCAT, returns empty array when joined is null
    private static List<String> list(String joined) {
        return joined == null ? List.of() : List.of(joined.split("\\|"));
    }
}
