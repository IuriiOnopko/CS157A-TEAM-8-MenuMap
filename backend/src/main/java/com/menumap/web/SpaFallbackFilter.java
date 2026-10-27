package com.menumap.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * Gives the React pages real URLs (/menumap/restaurants, /menumap/orders/12,
 * the /menumap/table/... links in table QR codes).
 *
 * Those paths only exist in the browser's router, so Tomcat would answer 404.
 * This filter serves index.html for them instead and lets React pick the page.
 * API calls and files (anything with a dot, like main.js or logo192.png) pass
 * through untouched.
 */
@WebFilter("/*")
public class SpaFallbackFilter extends HttpFilter {

    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse resp, FilterChain chain)
            throws IOException, ServletException {
        String path = req.getRequestURI().substring(req.getContextPath().length());
        boolean pageRoute = "GET".equals(req.getMethod())
                && !path.startsWith("/api/")
                && !path.equals("/")
                && !path.contains(".");
        if (pageRoute) {
            req.getRequestDispatcher("/index.html").forward(req, resp);
            return;
        }
        chain.doFilter(req, resp);
    }
}
