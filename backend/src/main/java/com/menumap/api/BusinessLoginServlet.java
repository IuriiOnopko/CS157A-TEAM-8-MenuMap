package com.menumap.api;

import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import org.mindrot.jbcrypt.BCrypt;

import com.menumap.db.Database;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/business/login")
public class BusinessLoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String email = req.getParameter("email");
        String pass = req.getParameter("pass");

        try {
            boolean businessExists = false;

            String querySql = "SELECT password_hash, user_id, account_type FROM user_account WHERE '" + email
                    + "' = email";
            Connection connection = Database.getConnection();
            Statement st = connection.createStatement();
            ResultSet rs = st.executeQuery(querySql);

            if (rs.next()) {
                String passStored = rs.getString("password_hash");
                String accountType = rs.getString("account_type");

                // BCrypt.checkpw(pass, passStored)

                if (pass.equals(passStored) && accountType.equals("BUSINESS_OWNER")) {
                    businessExists = true;
                    int id = rs.getInt("user_id");
                    req.getSession().setAttribute("userId", id);
                }
            }

            rs.close();
            st.close();
            connection.close();

            if (businessExists) {
                resp.setStatus(201);
                resp.getWriter().write("{\"ok\": true}");
            } else {
                resp.setStatus(401);
                resp.getWriter().write("{\"error\": \"Incorrect Login\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(500);
            resp.getWriter().write("{\"error\": \"Login did not work\"}");
        }

    }
}
