package com.menumap.api;

import com.menumap.db.Database;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * GET  /api/allergens        every allergen
 * GET  /api/allergens/mine   the allergens the signed-in customer avoids (customer_allergen)
 * POST /api/allergens/mine   form field allergenId, once per allergen; replaces the customer's whole list
 */
@WebServlet({"/api/allergens", "/api/allergens/mine"})
public class AllergenServlet extends HttpServlet {

    record Allergen(int id, String name, String description) {}

    private static final String GET_CUST_ALLERGENS = "/api/allergens/mine";

    private static final String LIST_SQL = "SELECT allergen_id, name, description FROM allergen ORDER BY name";

    private static final String GET_CUST_ALLERGENS_SQL =
            "SELECT a.allergen_id, a.name, a.description FROM customer_allergen ca, allergen a "
            + "WHERE ca.allergen_id = a.allergen_id AND ca.customer_id = ? ORDER BY a.name";

    private static final String CLEAR_SQL = "DELETE FROM customer_allergen WHERE customer_id = ?";

    // IGNORE skips repeats, and anything the foreign keys reject (an id that isn't an allergen, a non-customer)
    private static final String ADD_SQL =
            "INSERT IGNORE INTO customer_allergen (customer_id, allergen_id) VALUES (?, ?)";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        boolean mine = GET_CUST_ALLERGENS.equals(req.getServletPath());
        Long userId = CurrentUser.id(req);

        if (mine && userId == null) {
            Json.error(resp, 401, "Sign in to see your allergens.");
            return;
        }

        try (Connection conn = Database.getConnection();
             PreparedStatement ps = mine ? Database.prepare(conn, GET_CUST_ALLERGENS_SQL, userId) : Database.prepare(conn, LIST_SQL);
             ResultSet rs = ps.executeQuery()) {

            List<Allergen> allergens = new ArrayList<>();
            while (rs.next())
                allergens.add(new Allergen(rs.getInt("allergen_id"), rs.getString("name"),
                        rs.getString("description")));

            Json.write(resp, 200, allergens);

        } catch (SQLException e) {
            log("Allergen query failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Long userId = CurrentUser.id(req);

        if (!GET_CUST_ALLERGENS.equals(req.getServletPath())) {
            Json.error(resp, 405, "Save allergens at /api/allergens/mine.");
            return;
        }

        if (userId == null) {
            Json.error(resp, 401, "Sign in to save your allergens.");
            return;
        }

        String[] allergenIds = req.getParameterValues("allergenId");

        // the old list is only replaced once the new one is in; closing without commit() rolls back
        try (Connection conn = Database.getConnection()) {
            conn.setAutoCommit(false);
            Database.update(conn, CLEAR_SQL, userId);

            if (allergenIds != null)
                for (String allergenId : allergenIds)
                    Database.update(conn, ADD_SQL, userId, allergenId);
            
            conn.commit();

            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);

        } catch (SQLException e) {
            log("Saving allergens failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }
}
