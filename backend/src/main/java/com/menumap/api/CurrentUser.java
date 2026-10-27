package com.menumap.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

/**
 * Who is signed in. Every endpoint reads the user_id from the session attribute below.
 * 
 * Session key is temporarily userId
 */
public final class CurrentUser {

    public static final String SESSION_KEY = "userId";

    private CurrentUser() {}

    // the signed-in user's user_id, or null for a guest
    public static Long id(HttpServletRequest req) {
        HttpSession session = req.getSession(false); // false: don't start a new session just to check
        if (session == null) {
            return null;
        }
        
        Object value = session.getAttribute(SESSION_KEY);
        return value instanceof Number number ? number.longValue() : null;
    }
}
