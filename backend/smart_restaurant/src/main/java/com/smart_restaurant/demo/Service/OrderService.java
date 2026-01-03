package com.smart_restaurant.demo.Service;

import com.smart_restaurant.demo.dto.Request.OrderRequest;
import com.smart_restaurant.demo.dto.Response.OrderResponse;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public interface OrderService {

    OrderResponse createOrder(OrderRequest orderRequest, JwtAuthenticationToken jwtAuthenticationToken);
}
