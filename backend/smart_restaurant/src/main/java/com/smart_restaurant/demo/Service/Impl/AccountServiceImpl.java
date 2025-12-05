package com.smart_restaurant.demo.Service.Impl;


import com.smart_restaurant.demo.Repository.AccountRepository;
import com.smart_restaurant.demo.Service.AccountService;
import com.smart_restaurant.demo.exception.AppException;
import com.smart_restaurant.demo.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccountServiceImpl implements AccountService {

    AccountRepository accountRepository;

    @Override
    public Integer getTenantIdByUsername(String username) {
        return accountRepository.findTenantIdByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));
    }
}
