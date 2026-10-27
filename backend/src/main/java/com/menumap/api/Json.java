package com.menumap.api;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParseException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;

/**
 * Reads and writes the JSON bodies of the /api endpoints.
 * Gson turns records into JSON objects (record field names become the JSON keys, 
 * really convinient for inmemory sql object representation)
 */
public final class Json {

    // serializeNulls keeps empty fields in the output as null, so the frontend always gets every key
    private static final Gson GSON = new GsonBuilder().serializeNulls().create();

    private Json() {} // no need for a constructor

    public static void write(HttpServletResponse resp, int status, Object body) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        GSON.toJson(body, resp.getWriter());
    }

    // sends {"error": message}, the frontend shows the message to the user as-is
    public static void error(HttpServletResponse resp, int status, String message) throws IOException {
        write(resp, status, Map.of("error", message));
    }

    // parses the request body, or returns null if it isn't valid JSON for that type
    public static <T> T read(HttpServletRequest req, Class<T> type) throws IOException {
        try {
            return GSON.fromJson(req.getReader(), type);
        } catch (JsonParseException e) {
            return null;
        }
    }
}
