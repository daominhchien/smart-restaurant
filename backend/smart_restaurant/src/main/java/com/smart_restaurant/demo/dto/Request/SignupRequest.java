package com.smart_restaurant.demo.dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class SignupRequest {
    @Email(message = "Username must be a valid email address")
    String usename;
    @Size(min=6,message = "password must contain 6 keys")
    String password;
}
