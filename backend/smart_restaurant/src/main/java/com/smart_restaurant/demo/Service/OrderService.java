package com.smart_restaurant.demo.Service;

import com.smart_restaurant.demo.dto.Request.DetailOrderRequest;
import com.smart_restaurant.demo.dto.Request.OrderRequest;
import com.smart_restaurant.demo.dto.Request.UpdateDetailOrderRequest;
import com.smart_restaurant.demo.dto.Request.UpdateOrderStatusRequest;
import com.smart_restaurant.demo.dto.Response.ApiResponse;
import com.smart_restaurant.demo.dto.Response.OrderResponse;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.RequestBody;


import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest orderRequest, JwtAuthenticationToken jwtAuthenticationToken);
    List<OrderResponse> getAllMyOrder(JwtAuthenticationToken jwtAuthenticationToken);
    List<OrderResponse> getAllTenantOrder(JwtAuthenticationToken jwtAuthenticationToken);
    OrderResponse getOrderById(Integer id);
    List<OrderResponse> getAllOrderTenantStatusPendingApproval(JwtAuthenticationToken jwtToken);
    OrderResponse updateOrderStatus(Integer id, @RequestBody UpdateOrderStatusRequest updateOrderStatusRequest);
    OrderResponse updateOrderAddItems(Integer orderId, List<UpdateDetailOrderRequest> detailOrderRequests, JwtAuthenticationToken jwtAuthenticationToken);

}
