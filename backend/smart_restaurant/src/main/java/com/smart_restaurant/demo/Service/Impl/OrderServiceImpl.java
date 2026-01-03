package com.smart_restaurant.demo.Service.Impl;

import com.smart_restaurant.demo.Repository.*;
import com.smart_restaurant.demo.Service.OrderService;
import com.smart_restaurant.demo.dto.Request.OrderRequest;
import com.smart_restaurant.demo.dto.Response.OrderResponse;
import com.smart_restaurant.demo.entity.Account;
import com.smart_restaurant.demo.entity.Customer;
import com.smart_restaurant.demo.entity.RestaurantTable;
import com.smart_restaurant.demo.exception.AppException;
import com.smart_restaurant.demo.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderServiceImpl implements OrderService {
    OrderRepository orderRepository;
    DetailOrderRepository detailOrderRepository;
    ItemRepository itemRepository;
    ModifierOptionRepository modifierOptionRepository;
    TableRepository tableRepository;
    CustomerRepository customerRepository;
    StatusRepository statusRepository;
    AccountRepository accountRepository;

    @Override
    public OrderResponse createOrder(OrderRequest orderRequest, JwtAuthenticationToken jwtAuthenticationToken) {
        String username = null;
        Integer customerId = null;

        if (jwtAuthenticationToken != null) {
            username = jwtAuthenticationToken.getName();
            Customer customer = customerRepository.findByAccount_Username(username).orElse(null);

            if (customer != null) {
                customerId = customer.getCustomerId();
            }
        }

        // Lấy bàn
        RestaurantTable restaurantTable = tableRepository.findById(orderRequest.getTableId())
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

        //

        return null;

    }
}
