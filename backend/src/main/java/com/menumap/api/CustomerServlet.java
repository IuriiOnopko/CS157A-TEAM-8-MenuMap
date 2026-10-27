package com.menumap.api;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;

import org.mindrot.jbcrypt.BCrypt;

import com.menumap.db.Database;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/api/customers/register")
public class CustomerServlet extends HttpServlet {

    private static final String CREATE_USER = "INSERT INTO user_account (user_id, email, password_hash, phone_number, name, "
                    + "account_type, account_status, created_at, updated_at) "
                    + "VALUES (?, ?, ?, ?, ?, 'CUSTOMER', 'ACTIVE', NOW(), NOW())";

    private static final String CREATE_CUSTOMER = "INSERT INTO customer (user_id) VALUES (?)";

    // user_account has no unique index on email, so check before creating the account
    private static final String EMAIL_TAKEN = "SELECT 1 FROM user_account WHERE email = ?";

    // temp, since user_id isn't AUTO_INCREMENT
    private static final String NEXT_USER_ID = "SELECT MAX(user_id) FROM user_account";

    private static final int INSERT_ATTEMPTS = 3;

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String email = req.getParameter("email");
        String pass = req.getParameter("pass");
        String phoneNum = req.getParameter("phoneNum");
        String name = req.getParameter("name");

        // ensures no null or empty value passes through
        if (email == null || email.isBlank() || name == null || name.isBlank() || pass == null || pass.isEmpty()) {
            resp.setStatus(400);
            resp.getWriter().write("{\"error\": \"Name, email and password are required.\"}");
            return;
        }

        String passwordHash = BCrypt.hashpw(pass, BCrypt.gensalt());

        try (Connection connection = Database.getConnection()) {

            if (emailTaken(connection, email)) {
                resp.setStatus(409);
                resp.getWriter().write("{\"error\": \"An account with this email already exists.\"}");
                return;
            }

            createCustomer(connection, email, passwordHash, phoneNum, name);

            resp.setStatus(201);
            resp.getWriter().write("{\"ok\": true}");

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(500);
            resp.getWriter().write("{\"error\": \"Account Could NOT be MADE\"}");
        }

    }

    private void createCustomer(Connection conn, String email, String passwordHash, String phoneNum, String name)
            throws SQLException {
        conn.setAutoCommit(false); // nothing is saved until commit(), rollback() undoes both inserts

        for (int attempt = 1; ; attempt++) {
            long userId = nextUserId(conn);
            try {
                Database.update(conn, CREATE_USER, userId, email, passwordHash, phoneNum, name);
                Database.update(conn, CREATE_CUSTOMER, userId);
                conn.commit();
                return;
            } catch (SQLIntegrityConstraintViolationException idTaken) {
                conn.rollback();
                if (attempt == INSERT_ATTEMPTS)
                    throw idTaken;
            }
        }
    }

    private boolean emailTaken(Connection conn, String email) throws SQLException {
        try (PreparedStatement ps = Database.prepare(conn, EMAIL_TAKEN, email); ResultSet rs = ps.executeQuery()) {
            return rs.next();
        }
    }

    private long nextUserId(Connection conn) throws SQLException {
        try (PreparedStatement ps = Database.prepare(conn, NEXT_USER_ID); ResultSet rs = ps.executeQuery()) {
            rs.next();
            return rs.getLong(1) + 1; // MAX of an empty table is NULL, which getLong reads as 0
        }
    }

}
