package com.menumap.api;

import com.menumap.db.Database;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

/**
 * Restaurant-specific bans (restaurant_customer_restriction).
 * A restricted customer can still see the restaurant and why they're restricted, but can't order from it
 */
public final class Restrictions {

    public record Restriction(String reason, String endsAt) {}

    // the restriction has to be switched on, and right now has to fall between starts_at and ends_at
    private static final String ACTIVE_SQL =
            "SELECT reason, ends_at FROM restaurant_customer_restriction "
            + "WHERE restaurant_id = ? AND customer_id = ? AND is_active = 1 "
            + "AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at > NOW())";

    private Restrictions() {}

    // reutrns restriction if it is active right now, or null if the customer may order
    public static Restriction activeFor(Connection conn, long restaurantId, Long customerId) throws SQLException {
        if (customerId == null)
            return null; // guests can't be restricted

        try (PreparedStatement ps = Database.prepare(conn, ACTIVE_SQL, restaurantId, customerId);
             ResultSet rs = ps.executeQuery()) {

            if (!rs.next())
                return null;
            
            Timestamp endsAt = rs.getTimestamp("ends_at");
            return new Restriction(rs.getString("reason"), endsAt == null ? null : endsAt.toInstant().toString());
        }
    }
}
