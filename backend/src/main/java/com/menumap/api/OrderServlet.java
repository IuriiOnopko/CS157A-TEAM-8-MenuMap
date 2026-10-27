package com.menumap.api;

import com.menumap.db.Database;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.ArrayList;
import java.util.List;

/**
 * POST /api/orders        place a dine-in order (with the table's QR code) or a pickup order
 * GET  /api/orders        the signed-in customer's order history, newest first
 * GET  /api/orders/{id}   one order, guests add ?token= (the QR code they ordered with)
 *
 * An order needs a signed-in customer or a table QR code, pickup always needs a signed-in customer.
 * Prices and totals are worked out here from the menu, never taken from the browser
 */
@WebServlet({"/api/orders", "/api/orders/*"})
public class OrderServlet extends HttpServlet {

    // sales tax added to every order (correct for Palo Alto, Mountain View, etc.)
    private static final BigDecimal TAX_RATE = new BigDecimal("0.0975");
    private static final int MAX_LINES = 50;
    private static final int MAX_QUANTITY = 99;
    private static final int INSERT_ATTEMPTS = 3;

    // post-parse body of POST /api/orders
    record NewOrderLine(Integer categoryId, Integer itemId, Integer quantity) {}

    record NewOrder(Long restaurantId, String method, String token, List<NewOrderLine> items) {}

    // what GET sends back
    record OrderLine(int lineNum, String name, BigDecimal unitPrice, int quantity) {}

    record Order(long id, long restaurantId, String restaurantName, String method, String tableCode, String status, 
                    String submittedAt, BigDecimal subtotal, BigDecimal tax, BigDecimal total,
                    String cancellationReason, List<OrderLine> items) {}

    // more expressive POST JSON response 
    record Created(long orderId) {}

    // one ordered item, with the name and price it has on the menu right now (locks price for item)
    private record PricedLine(int categoryId, int itemId, int quantity, String name, BigDecimal price) {}

    private static final String CUSTOMER_SQL =
            "SELECT user_id FROM user_account WHERE user_id = ? AND account_type = 'CUSTOMER' AND account_status = 'ACTIVE'";

    // avoids inactive restaurants in search
    private static final String RESTAURANT_SQL =
            "SELECT name, is_open FROM restaurant WHERE restaurant_id = ? AND is_active = 1";

    // items in a hidden (inactive) category don't come back either
    private static final String ITEM_SQL =
            "SELECT mi.name, mi.price, mi.is_available FROM menu_item mi, menu_category mc "
            + "WHERE mi.restaurant_id = mc.restaurant_id AND mi.category_id = mc.category_id AND mc.is_active = 1 "
            + "AND mi.restaurant_id = ? AND mi.category_id = ? AND mi.item_id = ?";

    // Expected order: order_id, restaurant_id, customer_id, token_id, table_code, order_method, 
    //  submitted_at, current_status, subtotal_amount, tax_amount, total_amount, cancellation_reason
    private static final String CREATE_ORDER_SQL =
            "INSERT INTO customer_order VALUES (?, ?, ?, ?, ?, ?, NOW(), 'SUBMITTED', ?, ?, ?, NULL)";
    
    // Expected order: order_id, line_num, restaurant_id, category_id, item_id, 
    //  item_name_at_order, unit_price_at_order, quantity
    private static final String INSERT_LINE_SQL =
            "INSERT INTO order_line  VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    // shared start of two queries
    private static final String ORDERS_SQL =
            "SELECT o.order_id, o.restaurant_id, r.name, o.order_method, o.table_code, o.current_status, "
            + "o.submitted_at, o.subtotal_amount, o.tax_amount, o.total_amount, o.cancellation_reason, "
            + "ol.line_num, ol.item_name_at_order, ol.unit_price_at_order, ol.quantity "
            + "FROM customer_order o, restaurant r, order_line ol "
            + "WHERE o.restaurant_id = r.restaurant_id AND o.order_id = ol.order_id AND ";

    // authorization check expansion for queries
    private static final String CAN_VIEW =
            " AND (o.customer_id = ? OR o.token_id IN (SELECT token_id FROM authorization_token WHERE token_hash = ?))";

    
    // Placing an order
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        NewOrder order = Json.read(req, NewOrder.class);
        Long customerId = CurrentUser.id(req);

        try (Connection conn = Database.getConnection()) {
            validate(order);
            if (customerId != null && !isActiveCustomer(conn, customerId))
                throw new ApiError(403, "Only active customer accounts can place orders.");
            

            // dine-in orders are tied to the table's QR code, pickup orders to the signed-in customer
            TableTokens.TableToken table = null;
            if (order.method().equals("DINE_IN")) {
                table = TableTokens.find(conn, order.token());

                if (table == null || table.restaurantId() != order.restaurantId())
                    throw new ApiError(403, "This table's QR code isn't valid for this restaurant.");
                
                if (!table.usable())
                    throw new ApiError(403, "This table's QR code has expired. Ask the staff for a new one.");
                
            } else if (customerId == null) {
                throw new ApiError(401, "Sign in to order for pickup.");
            }
            
            // checks for restaurant open and customer restrictions
            String restaurantName = openRestaurantName(conn, order.restaurantId());
            Restrictions.Restriction restriction = Restrictions.activeFor(conn, order.restaurantId(), customerId);
            if (restriction != null)
                throw new ApiError(403, "You can't order from " + restaurantName + ": " + restriction.reason());
            

            long orderId = place(conn, order, customerId, table);
            Json.write(resp, 201, new Created(orderId));

        } catch (ApiError e) {
            Json.error(resp, e.status, e.getMessage());
        } catch (SQLException e) {
            log("Placing an order failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }

    // checks that request body has everything an order needs
    private static void validate(NewOrder order) throws ApiError {
        if (order == null || order.restaurantId() == null)
            throw new ApiError(400, "Invalid order.");
        
        if (!("DINE_IN".equals(order.method()) || "PICKUP".equals(order.method())))
            throw new ApiError(400, "method must be DINE_IN or PICKUP.");
        
        if (order.method().equals("DINE_IN") && (order.token() == null || order.token().isBlank()))
            throw new ApiError(400, "Dine-in orders need the table's QR code.");

        if (order.items() == null || order.items().isEmpty())
            throw new ApiError(400, "Your order is empty.");
        
        if (order.items().size() > MAX_LINES)
            throw new ApiError(400, "An order can have at most " + MAX_LINES + " different items.");


        for (NewOrderLine line : order.items()) {
            if (line == null || line.categoryId() == null || line.itemId() == null || line.quantity() == null
                    || line.quantity() < 1 || line.quantity() > MAX_QUANTITY) {
                throw new ApiError(400, "Each item needs a quantity from 1 to " + MAX_QUANTITY + ".");
            }
        }
    }

    private static boolean isActiveCustomer(Connection conn, long userId) throws SQLException {
        try (PreparedStatement ps = Database.prepare(conn, CUSTOMER_SQL, userId);
                ResultSet rs = ps.executeQuery()) {
            return rs.next();
        }
    }

    // returns restaurant's name, if exists and open
    private static String openRestaurantName(Connection conn, long restaurantId) throws SQLException, ApiError {
        try (PreparedStatement ps = Database.prepare(conn, RESTAURANT_SQL, restaurantId);
                ResultSet rs = ps.executeQuery()) {

            if (!rs.next())
                throw new ApiError(404, "This restaurant isn't on MenuMap.");
            
            if (!rs.getBoolean("is_open"))
                throw new ApiError(409, rs.getString("name") + " is closed right now.");

            return rs.getString("name");
        }
    }

    // prices every line from the menu, then saves the order with its lines and returns the new order_id
    private static long place(Connection conn, NewOrder order, Long customerId, TableTokens.TableToken table)
            throws SQLException, ApiError {
        List<PricedLine> lines = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (NewOrderLine line : order.items()) {
            PricedLine priced = price(conn, order.restaurantId(), line);
            lines.add(priced);
            subtotal = subtotal.add(priced.price().multiply(BigDecimal.valueOf(priced.quantity())));
        }

        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        String tokenId = table == null ? null : table.tokenId();
        String tableCode = table == null ? null : table.tableCode();

        // Keeps order and lines are one transaction. If fail, rollback and try again
        // If insert attmept limit is reached throws an erorr
        conn.setAutoCommit(false);
        for (int attempt = 1; ; attempt++) {
            long orderId = nextOrderId(conn);
            try {
                Database.update(conn, CREATE_ORDER_SQL, orderId, order.restaurantId(), customerId, tokenId, tableCode,
                                    order.method(), subtotal, tax, subtotal.add(tax));
                for (int i = 0; i < lines.size(); i++) {
                    PricedLine line = lines.get(i);
                    Database.update(conn, INSERT_LINE_SQL, orderId, i + 1, order.restaurantId(), line.categoryId(),
                                        line.itemId(), line.name(), line.price(), line.quantity());
                }
                conn.commit();
                return orderId;
            } catch (SQLIntegrityConstraintViolationException idTaken) {
                conn.rollback();
                if (attempt == INSERT_ATTEMPTS)
                    throw idTaken;
                
            }
        }
    }

    // looks up the item on the menu to get its current name and price and lock it
    private static PricedLine price(Connection conn, long restaurantId, NewOrderLine line) throws SQLException, ApiError {
        try (PreparedStatement ps = Database.prepare(conn, ITEM_SQL, restaurantId, line.categoryId(), line.itemId());
                ResultSet rs = ps.executeQuery()) {

            if (!rs.next())
                throw new ApiError(409, "An item in your order is no longer on the menu. Refresh and try again.");
            
            if (!rs.getBoolean("is_available"))
                throw new ApiError(409, rs.getString("name") + " is unavailable right now.");
            
            return new PricedLine(line.categoryId(), line.itemId(), line.quantity(), rs.getString("name"),
                    rs.getBigDecimal("price"));
        }
    }

    // TODO: if the AUTO_INCREMENT will be permitted, replace functionality with schema
    private static long nextOrderId(Connection conn) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement("SELECT MAX(order_id) FROM customer_order");
                ResultSet rs = ps.executeQuery()) {
            
            rs.next();
            return rs.getLong(1) + 1; // MAX of an empty table is NULL, which getLong reads as 0
        }
    }

    // Order retrieval for customers
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        Long customerId = CurrentUser.id(req);

        try (Connection conn = Database.getConnection()) {
            // GET /api/orders (no id specified)
            if (path == null || path.equals("/")) {
                if (customerId == null)
                    throw new ApiError(401, "Sign in to see your order history.");
                
                Json.write(resp, 200, orders(conn, "o.customer_id = ?", customerId));
                return;
            }

            // GET /api/orders/{id}
            long orderId;
            try {
                orderId = Long.parseLong(path.substring(1));
            } catch (NumberFormatException e) {
                throw new ApiError(404, "Order not found.");
            }
            String token = req.getParameter("token");
            String tokenHash = token == null ? null : TableTokens.hash(token);


            List<Order> found = orders(conn, "o.order_id = ?" + CAN_VIEW, orderId, customerId, tokenHash);
            // no need to be verbose about checks to customer
            if (found.isEmpty())
                throw new ApiError(404, "Order not found.");
            
            Json.write(resp, 200, found.get(0));

        } catch (ApiError e) {
            Json.error(resp, e.status, e.getMessage());
        } catch (SQLException e) {
            log("Order lookup failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }

    // orders matching ORDERS_SQL + any additional conditions (where), newest first, each with its lines
    private static List<Order> orders(Connection conn, String where, Object... params) throws SQLException {
        String sql = ORDERS_SQL + where + " ORDER BY o.submitted_at DESC, o.order_id DESC, ol.line_num";
        List<Order> orders = new ArrayList<>();

        try (PreparedStatement ps = Database.prepare(conn, sql, params);
                ResultSet rs = ps.executeQuery()) {

            Order order = null;
            while (rs.next()) {
                // rows are sorted by order_id DESC, so a different order_id means the next order has started
                if (order == null || order.id() != rs.getLong("order_id")) {
                    order = new Order(rs.getLong("order_id"), rs.getLong("restaurant_id"), rs.getString("name"),
                            rs.getString("order_method"), rs.getString("table_code"), rs.getString("current_status"),
                            rs.getTimestamp("submitted_at").toInstant().toString(), rs.getBigDecimal("subtotal_amount"),
                            rs.getBigDecimal("tax_amount"), rs.getBigDecimal("total_amount"),
                            rs.getString("cancellation_reason"), new ArrayList<>());
                    orders.add(order);
                }
                order.items().add(new OrderLine(rs.getInt("line_num"), rs.getString("item_name_at_order"),
                        rs.getBigDecimal("unit_price_at_order"), rs.getInt("quantity")));
            }
        }
        return orders;
    }
}
