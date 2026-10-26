package com.menumap.api;

import com.menumap.db.Database;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.Statement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * GET /api/restaurants/count 
 */
@WebServlet("/api/restaurants/count")
public class RestaurantCountServlet extends HttpServlet {

    // basic count_sql request
    private static final String COUNT_SQL = "SELECT COUNT(*) FROM restaurant WHERE is_active = 1";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        // Used try-with-resources structure, since it closes connection automatically after use
        try (
            Connection conn = Database.getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(COUNT_SQL)) {

            rs.next();
            // writing JSON styled response
            resp.getWriter().write("{\"count\": " + rs.getInt(1) + "}");

        } catch (SQLException e) {
            log("Restaurant count query failed", e);
            resp.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE); // valid status code return

            // writing JSON styled response
            resp.getWriter().write("{\"error\": \"Database unavailable\"}");
        }
    }
}
