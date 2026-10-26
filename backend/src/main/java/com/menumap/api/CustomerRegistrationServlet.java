package com.menumap.api;

import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import com.menumap.db.Database;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CustomerRegistrationServlet extends HttpServlet {

  private static final String createUserString = "";
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
      resp.setContentType("application/json");
      resp.setCharacterEncoding("UTF-8");

      // Used try-with-resources structure, since it closes connection automatically after use
      try (
          Connection conn = Database.getConnection();
          Statement stmt = conn.createStatement();
          ResultSet rs = stmt.executeQuery(createUserString)) {

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
