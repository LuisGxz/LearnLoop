package dev.learnloop.api.web;

import java.util.Map;
import org.springframework.http.HttpStatus;

/** Domain/app error carrying an HTTP status and optional per-field messages. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final transient Map<String, String> fields;

    public ApiException(HttpStatus status, String message) {
        this(status, message, null);
    }

    public ApiException(HttpStatus status, String message, Map<String, String> fields) {
        super(message);
        this.status = status;
        this.fields = fields;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public Map<String, String> getFields() {
        return fields;
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(HttpStatus.FORBIDDEN, message);
    }

    public static ApiException conflict(String message, Map<String, String> fields) {
        return new ApiException(HttpStatus.CONFLICT, message, fields);
    }
}
