package com.smart_restaurant.demo.Controller;

import com.smart_restaurant.demo.Service.OrderService;
import com.smart_restaurant.demo.dto.Request.OrderRequest;
import com.smart_restaurant.demo.dto.Response.ApiResponse;
import com.smart_restaurant.demo.dto.Response.OrderResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrderService orderService;

    @PostMapping("")
    public ApiResponse<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest orderRequest) {

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        JwtAuthenticationToken jwtToken =
                (auth instanceof JwtAuthenticationToken)
                        ? (JwtAuthenticationToken) auth
                        : null;

        System.out.println("🔍 JWT Token: " + (jwtToken != null ? "Có" : "Null"));

        // jwtToken sẽ tự động null nếu chưa đăng nhập
        OrderResponse orderResponse = orderService.createOrder(orderRequest, jwtToken);

        return ApiResponse.<OrderResponse>builder()
                .result(orderResponse)
                .message("Tạo order thành công")
                .build();
    }


    // Xem tất cả đơn hàng , xem được luôn chi tiết đơn hàng
    @GetMapping("")
    public ApiResponse<List<OrderResponse>> getAllMyOrder(JwtAuthenticationToken jwtToken){
        List<OrderResponse> orderResponse = orderService.getAllMyOrder( jwtToken);
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderResponse)
                .message("Get all order thành cong")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Integer id){
        OrderResponse orderResponse = orderService.getOrderById(id);
        return ApiResponse.<OrderResponse>builder()
                .result(orderResponse)
                .message("Get order thành cong")
                .build();
    }

    @GetMapping("/tenant")
    public ApiResponse<List<OrderResponse>> getAllOrderTenant(JwtAuthenticationToken jwtToken){
        List<OrderResponse> orderResponse = orderService.getAllTenantOrder(jwtToken);
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderResponse)
                .message("Get all order thành cong cua nhà hàng")
                .build();
    }


    // [STAFF]
    // [1] - Get all đơn hàng đang chờ xử lý
    @GetMapping("/pending-approval")
    public ApiResponse<List<OrderResponse>> getAllOrderTenantStatusPendingApproval(JwtAuthenticationToken jwtToken){
        List<OrderResponse> orderResponse = orderService.getAllOrderTenantStatusPendingApproval( jwtToken);
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderResponse)
                .message("Get all Order StatusPendingApproval thành cong cua nhà hàng")
                .build();
    }


}
