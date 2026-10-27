package com.menumap.api;

import com.menumap.db.Database;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * GET    /api/session   who is signed in: {"user": {...}} or {"user": null}
 * DELETE /api/session   sign out
 */
@WebServlet("/api/session")
public class SessionServlet extends HttpServlet {

    record SessionUser(long id, String name, String email, String accountType) {}

    record SessionInfo(SessionUser user) {}

    private static final String USER_SQL =
            "SELECT name, email, account_type, account_status FROM user_account WHERE user_id = ?";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Long userId = CurrentUser.id(req);
        if (userId == null) {
            Json.write(resp, 200, new SessionInfo(null));
            return;
        }

        try (Connection conn = Database.getConnection();
             PreparedStatement ps = Database.prepare(conn, USER_SQL, userId);
             ResultSet rs = ps.executeQuery()) {

            // a suspended or deleted account gets signed out on its next request
            if (!rs.next() || !"ACTIVE".equals(rs.getString("account_status"))) {
                req.getSession().invalidate();
                Json.write(resp, 200, new SessionInfo(null));
                return;
            }
            Json.write(resp, 200, new SessionInfo(new SessionUser(userId, rs.getString("name"),
                    rs.getString("email"), rs.getString("account_type"))));

        } catch (SQLException e) {
            log("Session lookup failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        resp.setStatus(HttpServletResponse.SC_NO_CONTENT); // 204: signed out, nothing to send back
    }
}
