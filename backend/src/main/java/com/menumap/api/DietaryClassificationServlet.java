package com.menumap.api;

import com.menumap.db.Database;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * GET /api/dietary-classifications   uses the diets a customer can filter the map by
 */
@WebServlet("/api/dietary-classifications")
public class DietaryClassificationServlet extends HttpServlet {

    record DietaryClassification(int id, String name, String description) {}

    private static final String LIST_SQL =
            "SELECT classification_id, name, description FROM dietary_classification ORDER BY name";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try (Connection conn = Database.getConnection(); Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(LIST_SQL)) {

            List<DietaryClassification> diets = new ArrayList<>();
            
            while (rs.next())
                diets.add(new DietaryClassification(rs.getInt("classification_id"), rs.getString("name"),
                    rs.getString("description")));
            
            Json.write(resp, 200, diets); // the list goes out as a JSON array

        } catch (SQLException e) {
            log("Dietary classification query failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }
}
