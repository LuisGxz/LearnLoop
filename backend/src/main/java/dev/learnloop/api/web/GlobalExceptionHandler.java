package dev.learnloop.api.web;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centralized error handling → RFC-7807 ProblemDetail with a `fields` map so the
 * client can show the reason next to each input (never a generic message).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail onValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(fe -> {
            if (!fields.containsKey(fe.getField())) {
                fields.put(fe.getField(), fe.getDefaultMessage());
            }
        });
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.UNPROCESSABLE_ENTITY, "Please fix the highlighted fields.");
        pd.setProperty("fields", fields);
        return pd;
    }

    @ExceptionHandler(ApiException.class)
    ProblemDetail onApi(ApiException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(ex.getStatus(), ex.getMessage());
        if (ex.getFields() != null) pd.setProperty("fields", ex.getFields());
        return pd;
    }

    @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class})
    ProblemDetail onBadCredentials(Exception ex) {
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.UNAUTHORIZED, "Incorrect email or password.");
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail onUnexpected(Exception ex) {
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Something went wrong on our end. Please try again.");
    }
}
