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
 * Account settings for signed-in users
 *
 * GET  /api/account            {name, email, phone}
 * POST /api/account/profile    any of name, email, phone (only fields that need to be changed)
 * POST /api/account/password   currentPassword, newPassword
 * POST /api/account/delete     has to confirm password (closes the account and marks it for deletion)
 */
@WebServlet({"/api/account", "/api/account/*"})
public class UserSettings extends HttpServlet {

    // Profile basis
    record Profile(String name, String email, String phone) {}

    // gets user profile, and checks whether user requests a valid account
    private static final String GET_PROFILE_SQL =
            "SELECT name, email, phone_number, password_hash FROM user_account "
            + "WHERE user_id = ? AND account_type = 'CUSTOMER' AND account_status = 'ACTIVE'";

    // currently no unique constraint on email, so have to check
    private static final String EMAIL_TAKEN_SQL =
            "SELECT 1 FROM user_account WHERE email = ? AND user_id <> ?";

    private static final String UPDATE_PROFILE_SQL =
            "UPDATE user_account SET name = ?, email = ?, phone_number = ?, updated_at = NOW() WHERE user_id = ?";

    private static final String UPDATE_PASSWORD_SQL =
            "UPDATE user_account SET password_hash = ?, updated_at = NOW() WHERE user_id = ?";

    // The account can't log in anymore, but nothing is erased, since data might be needed for audit.
    // Just marking it with DELETED for removal later
    private static final String DELETE_SQL =
            "UPDATE user_account SET account_status = 'DELETED', updated_at = NOW() WHERE user_id = ?";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Long userId = CurrentUser.id(req);
        if (userId == null) {
            Json.error(resp, 401, "Sign in to manage your account.");
            return;
        }

        try (Connection conn = Database.getConnection();
             PreparedStatement ps = Database.prepare(conn, GET_PROFILE_SQL, userId);
             ResultSet rs = ps.executeQuery()) {

            if (rs.next())
                Json.write(resp, 200, new Profile(rs.getString("name"), rs.getString("email"),
                        rs.getString("phone_number")));
            else
                Json.error(resp, 403, "Only active customer accounts have these settings.");

        } catch (SQLException e) {
            log("Account lookup failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Long userId = CurrentUser.id(req);
        if (userId == null) {
            Json.error(resp, 401, "Sign in to manage your account.");
            return;
        }

        try (Connection conn = Database.getConnection()) {
            String name, email, phone, password;

            try (PreparedStatement ps = Database.prepare(conn, GET_PROFILE_SQL, userId);
                 ResultSet rs = ps.executeQuery()) {
                if (!rs.next())
                    throw new ApiError(403, "Only active customer accounts have these settings.");

                name = rs.getString("name");
                email = rs.getString("email");
                phone = rs.getString("phone_number");
                password = rs.getString("password_hash");
            }

            switch (String.valueOf(req.getPathInfo())) {
                case "/profile" -> {
                    String newName = req.getParameter("name");
                    String newEmail = req.getParameter("email");
                    String newPhone = req.getParameter("phone");

                    // a field that wasn't sent keeps its current value
                    if (newName != null)
                        name = newName;
                    if (newEmail != null)
                        email = newEmail;
                    // if phone is blank, clear the phone (it was optional)
                    if (newPhone != null)
                        phone = newPhone.isBlank() ? null : newPhone; 

                    if (name.isBlank() || email.isBlank())
                        throw new ApiError(400, "Name and email can't be empty.");

                    if (checkTaken(conn, EMAIL_TAKEN_SQL, email, userId))
                        throw new ApiError(409, "Another account already uses this email.");

                    Database.update(conn, UPDATE_PROFILE_SQL, name, email, phone, userId);
                }

                case "/password" -> {
                    String newPassword = req.getParameter("newPassword");
                    if (newPassword == null || newPassword.length() < 8)
                        throw new ApiError(400, "Use at least 8 characters for your new password.");
                    
                    // TODO: copies login servlet, has to be changed once sessions and hashing are implemented
                    if (!password.equals(req.getParameter("currentPassword")))
                        throw new ApiError(403, "Your current password is incorrect.");

                    Database.update(conn, UPDATE_PASSWORD_SQL, newPassword, userId);
                }

                case "/delete" -> {
                    if (!password.equals(req.getParameter("password")))
                        throw new ApiError(403, "That password is incorrect.");

                    Database.update(conn, DELETE_SQL, userId);
                    req.getSession().invalidate(); // signs this browser out
                }

                default -> throw new ApiError(404, "Not found.");
            }
            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);

        } catch (ApiError e) {
            Json.error(resp, e.status, e.getMessage());
        } catch (SQLException e) {
            log("Account settings request failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }

    private static boolean checkTaken(Connection conn, String sql, Object... params) throws SQLException {
        try (PreparedStatement ps = Database.prepare(conn, sql, params); ResultSet rs = ps.executeQuery()) {
            return rs.next();
        }
    }
}
