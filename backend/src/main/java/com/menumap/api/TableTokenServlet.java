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

/**
 * GET /api/table?token=...   which restaurant and table a QR code belongs to
 *
 * The QR code opens /menumap/table/{token}, refering to this before loading the menu
 */
@WebServlet("/api/table")
public class TableTokenServlet extends HttpServlet {

    record TableInfo(long restaurantId, String restaurantName, String tableCode, boolean isOpen, String expiresAt) {}

    // suspended restaurants (is_active = 0) don't come back
    private static final String RESTAURANT_SQL =
            "SELECT name, is_open FROM restaurant WHERE restaurant_id = ? AND is_active = 1";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String rawToken = req.getParameter("token");
        if (rawToken == null || rawToken.isBlank()) {
            Json.error(resp, 400, "This link is missing its table code.");
            return;
        }

        try (Connection conn = Database.getConnection()) {
            TableTokens.TableToken token = TableTokens.find(conn, rawToken);
            if (token == null) {
                Json.error(resp, 404, "This QR code isn't recognized. Ask the staff for help.");
                return;
            }
            if (!token.usable()) {
                Json.error(resp, 410, "This QR code has expired. Ask the staff for a new one.");
                return;
            }

            try (PreparedStatement ps = Database.prepare(conn, RESTAURANT_SQL, token.restaurantId());
                 ResultSet rs = ps.executeQuery()) {

                if (!rs.next()) {
                    Json.error(resp, 404, "This restaurant isn't taking orders through MenuMap.");
                    return;
                }
                Json.write(resp, 200, new TableInfo(token.restaurantId(), rs.getString("name"), token.tableCode(),
                        rs.getBoolean("is_open"), token.expiresAt()));
            }
        } catch (SQLException e) {
            log("Table lookup failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }
}
