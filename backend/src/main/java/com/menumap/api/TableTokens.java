package com.menumap.api;

import com.menumap.db.Database;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HexFormat;

/**
 * Table QR codes. Each code holds a random token, and anyone with it can order at that table without an account.
 * The database only stores the token's SHA-256 hash (authorization_token.token_hash),
 * so reading the database doesn't reveal working codes
 */
public final class TableTokens {

    // usable is false once the code expires or gets revoked, or if the table is switched off
    public record TableToken(String tokenId, long restaurantId, String tableCode, String expiresAt, boolean usable) {}

    // MySQL works out whether it is usable itself by comparing the token's dates with NOW()
    private static final String FIND_SQL =
            "SELECT t.token_id, t.restaurant_id, t.table_code, t.expires_at, "
            + "(rt.is_active = 1 AND t.revoked_at IS NULL AND t.issued_at <= NOW() AND NOW() < t.expires_at) AS usable "
            + "FROM authorization_token t, restaurant_table rt "
            + "WHERE t.restaurant_id = rt.restaurant_id AND t.table_code = rt.table_code AND t.token_hash = ?";

    private TableTokens() {}

    // looks up a QR code, or returns null if no table has it (expired codes still come back, with usable = false)
    public static TableToken find(Connection conn, String rawToken) throws SQLException {
        try (PreparedStatement ps = Database.prepare(conn, FIND_SQL, hash(rawToken));
             ResultSet rs = ps.executeQuery()) {

            if (!rs.next())
                return null;
            
            return new TableToken(rs.getString("token_id"), rs.getLong("restaurant_id"), rs.getString("table_code"),
                    rs.getTimestamp("expires_at").toInstant().toString(), rs.getBoolean("usable"));
        }
    }

    // SHA-256 of the token as 64 lowercase hex characters, the same format as token_hash
    public static String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Every JDK includes SHA-256", e);
        }
    }
}
