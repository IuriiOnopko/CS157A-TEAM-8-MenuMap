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

@WebServlet("/api/customers/register")
public class CustomerServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String email = req.getParameter("email");
        String pass = req.getParameter("pass");
        String phoneNum = req.getParameter("phoneNum");
        String name = req.getParameter("name");

        String passwordHash = BCrypt.hashpw(pass, BCrypt.gensalt());

        try {

            String querySql = "SELECT MAX(user_id) AS id FROM user_account";
            Connection connection = Database.getConnection();
            Statement st = connection.createStatement();
            ResultSet rs = st.executeQuery(querySql);

            rs.next();
            int idVal = rs.getInt("id");
            idVal = idVal + 1;

            rs.close();
            st.close();
            connection.close();

            java.util.Date now = new java.util.Date();
            java.sql.Date sqlDate = new java.sql.Date(now.getTime());

            String insertSql = "INSERT INTO user_account (user_id, email, password_hash, phone_number, name, account_type, account_status, created_at, updated_at) "
                    + "VALUES (" + idVal + " , '" + email + "', '" + passwordHash + "', '" + phoneNum + "', '" + name
                    + "', 'CUSTOMER', 'ACTIVE', '"
                    + sqlDate
                    + "', '" + sqlDate + "')";

            String insertSqlCustomer = "INSERT INTO customer (user_id) "
                    + "VALUES (" + idVal + ")";

            Connection conn = Database.getConnection();
            Statement stmt = conn.createStatement();
            stmt.execute(insertSql);
            stmt.execute(insertSqlCustomer);

            stmt.close();
            conn.close();

            resp.setStatus(201);
            resp.getWriter().write("{\"ok\": true}");

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(500);
            resp.getWriter().write("{\"error\": \"Account Could NOT be MADE\"}");
        }

    }
}
