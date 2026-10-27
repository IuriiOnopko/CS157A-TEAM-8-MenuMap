package com.menumap.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Opens JDBC connections to the MenuMap MySQL database.
 *
 * Credentials come from environment variables, if there aren't any use default
 * root:root combination
 */
public final class Database {

    private static final String URL = env("MENUMAP_DB_URL", "jdbc:mysql://localhost:3306/MenuMap");
    private static final String USER = env("MENUMAP_DB_USER", "root");
    private static final String PASS = env("MENUMAP_DB_PASS", "Eldartiawinnie21*");

    // JDBC auto-discovery doesn't see drivers in WEB-INF/lib,
    // so without this DriverManager throws "No suitable driver found"
    // Aparently modern JDBC drivers don't have this issue
    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("MySQL JDBC driver not on classpath", e);
        }
    }

    // default constructor is public, so we need to create one to remove it
    private Database() {
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }

    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        // only fall back when the variable is not set, so MENUMAP_DB_PASS="" means "no
        // password"
        return value == null ? fallback : value;
    }
}
