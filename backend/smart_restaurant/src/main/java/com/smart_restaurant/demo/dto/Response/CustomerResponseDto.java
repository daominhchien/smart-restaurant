package com.smart_restaurant.demo.dto.Response;

import com.smart_restaurant.demo.entity.Account;
import com.smart_restaurant.demo.enums.Genders;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class CustomerResponseDto {
    Integer customerId;
    String name;
    String phone;
    String address;
    Genders gender;
    AccountResponse account;
}
