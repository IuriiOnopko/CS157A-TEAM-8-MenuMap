package com.menumap.api;

/**
 * Stops a request with an error. The servlet catches it and sends {"error": message} with this status
 */
public class ApiError extends Exception {

    public final int status;

    public ApiError(int status, String message) {
        super(message);
        this.status = status;
    }
}
