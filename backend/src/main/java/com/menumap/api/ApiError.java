package com.menumap.api;

/**
 * Used to create more verbose error throws. Pass through the message and provided status code.
 */
public class ApiError extends Exception {

    public final int status;

    public ApiError(int status, String message) {
        super(message);
        this.status = status;
    }
}
