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
 * GET  /api/test-customers            active customer accounts to pick from
 * POST /api/test-customers {userId}   sign in as that customer, no password needed
 *
 * TEMPORARY stand-in for real sign-in, so pickup orders and order history can be tried before login exists.
 */
@WebServlet("/api/test-customers")
public class TestCustomerServlet extends HttpServlet {

    record Choice(Long userId) {}

    private static final String CUSTOMERS_SQL =
            "SELECT u.user_id, u.name, u.email FROM user_account u, customer c "
            + "WHERE u.user_id = c.user_id AND u.account_status = 'ACTIVE'";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try (Connection conn = Database.getConnection();
             PreparedStatement ps = conn.prepareStatement(CUSTOMERS_SQL + " ORDER BY u.name");
             ResultSet rs = ps.executeQuery()) {

            List<SessionServlet.SessionUser> customers = new ArrayList<>();
            while (rs.next()) {
                customers.add(toUser(rs));
            }
            Json.write(resp, 200, customers);

        } catch (SQLException e) {
            log("Test customer list failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Choice choice = Json.read(req, Choice.class);
        if (choice == null || choice.userId() == null) {
            Json.error(resp, 400, "Pick a customer.");
            return;
        }

        try (Connection conn = Database.getConnection();
             PreparedStatement ps = Database.prepare(conn, CUSTOMERS_SQL + " AND u.user_id = ?", choice.userId());
             ResultSet rs = ps.executeQuery()) {

            if (!rs.next()) {
                Json.error(resp, 404, "That customer account doesn't exist or isn't active.");
                return;
            }
            // CurrentUser reads the id back on every later request
            req.getSession(true).setAttribute(CurrentUser.SESSION_KEY, choice.userId());
            Json.write(resp, 200, toUser(rs));

        } catch (SQLException e) {
            log("Test customer sign-in failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }

    private static SessionServlet.SessionUser toUser(ResultSet rs) throws SQLException {
        return new SessionServlet.SessionUser(rs.getLong("user_id"), rs.getString("name"), rs.getString("email"),
                "CUSTOMER");
    }
}
