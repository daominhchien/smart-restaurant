package com.smart_restaurant.demo.exception;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {
    UNAUTHENTICATED ("1001","UNAUTHENTICATED", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("1002", "You do not have permission", HttpStatus.FORBIDDEN),
    ACCOUNT_NOT_EXITS("1003","user not exist", HttpStatus.BAD_REQUEST),
    TENANT_NOT_FOUND("1008", "User does not belong to any tenant", HttpStatus.FORBIDDEN),
    CATEGORY_ALREADY_EXISTS_FOR_TENANT("1009", "Category already exists for this tenant", HttpStatus.CONFLICT);

    ErrorCode(String code, String message, HttpStatus httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode= httpStatusCode;
    }
    private final String code;
    private  final String message;
    private HttpStatusCode httpStatusCode;
}
