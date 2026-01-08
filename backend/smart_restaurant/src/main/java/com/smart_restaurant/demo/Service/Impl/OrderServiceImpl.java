package com.smart_restaurant.demo.Service.Impl;

import com.smart_restaurant.demo.Repository.*;
import com.smart_restaurant.demo.Service.AccountService;
import com.smart_restaurant.demo.Service.OrderService;
import com.smart_restaurant.demo.dto.Request.DetailOrderRequest;
import com.smart_restaurant.demo.dto.Request.OrderRequest;
import com.smart_restaurant.demo.dto.Request.UpdateDetailOrderRequest;
import com.smart_restaurant.demo.dto.Request.UpdateOrderStatusRequest;
import com.smart_restaurant.demo.dto.Response.DetailOrderResponse;
import com.smart_restaurant.demo.dto.Response.ModifierOptionResponse;
import com.smart_restaurant.demo.dto.Response.OrderResponse;
import com.smart_restaurant.demo.entity.*;
import com.smart_restaurant.demo.enums.OrderStatus;
import com.smart_restaurant.demo.enums.SelectionType;
import com.smart_restaurant.demo.exception.AppException;
import com.smart_restaurant.demo.exception.ErrorCode;
import com.smart_restaurant.demo.mapper.DetailOrderMapper;
import com.smart_restaurant.demo.mapper.OrderMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    DetailOrderMapper detailOrderMapper;
    OrderMapper orderMapper;
    TenantRepository tenantRepository;
    AccountService accountService;

    @Override
    public OrderResponse createOrder(OrderRequest orderRequest, JwtAuthenticationToken jwtAuthenticationToken) {
        String username = null;
        Customer customer = null;
        String customerName = null;
        boolean isHaveName = true; // Mặc định: không đăng nhập

        // Check đăng nhập
        if (jwtAuthenticationToken != null) {
            try {
                isHaveName = false;
                username = jwtAuthenticationToken.getName();

                if (username == null || username.isEmpty()) {
                    System.out.println("⚠️ ERROR: Username từ JWT là null hoặc rỗng!");
                    throw new AppException(ErrorCode.INVALID_TOKEN_FORMAT);
                }

                // Tìm Account bằng username
                Account account = accountRepository.findByUsername(username)
                        .orElseThrow(() -> {
                            return new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
                        });


                // Tìm Customer bằng Account ID
                customer = customerRepository.findByAccountAccountId(account.getAccountId())
                        .orElseThrow(() -> {
                            return new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
                        });

                // Lấy tên từ Customer
                customerName = customer.getName();
                System.out.println("✅ CustomerId: " + customer.getCustomerId());
                System.out.println("✅ CustomerName từ DB: " + customerName);

            } catch (AppException e) {
                System.out.println("❌ Lỗi khi lấy thông tin customer: " + e.getMessage());
                throw e;
            }
        } else {

            customerName = orderRequest.getCustomerName();
            System.out.println("⏸️ Không đăng nhập - CustomerName từ request: " + customerName);
        }

        // Lấy bàn
        RestaurantTable restaurantTable = tableRepository.findById(orderRequest.getTableId())
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

        // Kiểm tra bàn này đã có order chưa
        List<Order> activeOrders = orderRepository.findByTable_TableIdAndStatus_OrderStatusNot(orderRequest.getTableId(), OrderStatus.Deleted);
        if (!activeOrders.isEmpty()) {
            throw new AppException(ErrorCode.TABLE_ALREADY_HAS_ORDER);
        }

        // Tính tiền
        float subTotal = 0;
        List<DetailOrder> detailOrders = new ArrayList<>();

        for (DetailOrderRequest detailOrderRequest : orderRequest.getDetailOrders()) {
            // Kiểm tra item
            Item item = itemRepository.findById(detailOrderRequest.getItemId())
                    .orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_FOUND));

            double itemPrice = item.getPrice();
            double itemTotal = itemPrice * detailOrderRequest.getQuantity();


            List<ModifierOption> modifierOptions = new ArrayList<>();
            if (detailOrderRequest.getModifierOptionIds() != null && !detailOrderRequest.getModifierOptionIds().isEmpty()) {
                modifierOptions = modifierOptionRepository.findAllById(detailOrderRequest.getModifierOptionIds());

                List<ModifierGroup> itemModifierGroups = item.getModifierGroups();

                // Validate modifiers theo ModifierGroup rules
                validateModifiersForItem(modifierOptions, itemModifierGroups);

                for (ModifierOption modifier : modifierOptions) {
                    itemTotal += modifier.getPrice()* detailOrderRequest.getQuantity();
                }
            } else {
                // Check nếu có required modifier groups nhưng không chọn
                validateRequiredModifierGroups(item.getModifierGroups());
            }

            subTotal += itemTotal;

            DetailOrder detailOrder = detailOrderMapper.toDetailOrder(detailOrderRequest);
            detailOrder.setItem(item);
            detailOrder.setPrice(itemPrice);
            detailOrder.setModifies(modifierOptions);
            detailOrders.add(detailOrder);
        }

        // Lưu order
        Order order = orderMapper.toOrder(orderRequest);
        OrderStatus pendingStatusEnum = OrderStatus.valueOf("Pending_approval"); // Hoặc OrderStatus.PENDING_APPROVAL

        Status pendingStatus = statusRepository.findByOrderStatus(pendingStatusEnum)
                .orElseThrow(() -> new RuntimeException("Status not found"));

        order.setStatus(pendingStatus);
        order.setIsHaveName(isHaveName);
        order.setCustomerName(customerName);
        order.setTable(restaurantTable);
        order.setCustomer(customer);

        System.out.println("📝 Lưu order - isHaveName: " + isHaveName + ", customerName: " + customerName
                + ", customerId: " + (customer != null ? customer.getCustomerId() : "null"));

        Order savedOrder = orderRepository.save(order);

        // Lưu detailOrder
        for (DetailOrder detail : detailOrders) {
            detail.setOrder(savedOrder);
        }
        detailOrderRepository.saveAll(detailOrders);

        // Cập nhật quantity_sold của item
        for (DetailOrderRequest detailOrderRequest : orderRequest.getDetailOrders()) {
            Item item = itemRepository.findById(detailOrderRequest.getItemId()).orElse(null);
            if (item != null) {
                item.setQuantitySold((item.getQuantitySold() != null ? item.getQuantitySold() : 0) + detailOrderRequest.getQuantity());
                itemRepository.save(item);
            }
        }

        // Tạo response
        OrderResponse response = orderMapper.toOrderResponse(savedOrder);
        response.setSubtotal(subTotal);
        response.setOderStatus(savedOrder.getStatus().getOrderStatus());
        response.setCustomerName(savedOrder.getCustomerName());
        response.setTableId(savedOrder.getTable().getTableId());
        response.setDetailOrders(toDetailOrderResponses(detailOrders));

        return response;
    }

    @Override
    public List<OrderResponse> getAllMyOrder(JwtAuthenticationToken jwtAuthenticationToken) {
        String username = jwtAuthenticationToken.getName();
        // lay account tu username
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        Integer accountId = account.getAccountId();

        // Tim customer boi account
        Customer customer = customerRepository.findByAccountAccountId(accountId)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        Integer customerId = customer.getCustomerId();


        // Lấy tất cả order
        List<Order> orders = orderRepository.findByCustomerCustomerId(customerId);

        // Convert sang OrderResponse dùng mapper
        return orders.stream()
                .filter(order -> !"Deleted".equals(order.getStatus().getOrderStatus()))
                .map(this::toFullOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getAllTenantOrder(JwtAuthenticationToken jwtAuthenticationToken) {

        String username = jwtAuthenticationToken.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        if (account.getTenant() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED); // Chặn CUSTOMER hoặc SUPER_ADMIN
        }
        Integer tenantId = accountService.getTenantIdByUsername(username);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));

        List<Order> orders = orderRepository.findByTableTenantTenantId(tenantId);
        return orders.stream()
                .map(this::toFullOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderById(Integer id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order không tồn tại"));

        if ("Deleted".equals(order.getStatus().getOrderStatus())) {
            throw new RuntimeException("Order đã bị xóa");
        }

        return toFullOrderResponse(order);

    }

    @Override
    public List<OrderResponse> getAllOrderTenantStatusPendingApproval(JwtAuthenticationToken jwtToken) {
        String username = jwtToken.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        if (account.getTenant() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED); // Chặn CUSTOMER hoặc SUPER_ADMIN
        }
        Integer tenantId = accountService.getTenantIdByUsername(username);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new AppException(ErrorCode.TENANT_NOT_FOUND));

        List<Order> orders = orderRepository.findByTable_Tenant_TenantIdAndStatus_OrderStatus(tenantId, OrderStatus.Pending_approval);
        return orders.stream()
                .map(this::toFullOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse updateOrderStatus(Integer id, UpdateOrderStatusRequest updateOrderStatusRequest) {

        // Check order tồn tại
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Check request
        if (updateOrderStatusRequest == null || updateOrderStatusRequest.getStatus() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        // Map enum → entity Status
        Status statusEntity = statusRepository
                .findByOrderStatus(updateOrderStatusRequest.getStatus())
                .orElseThrow(() -> new AppException(ErrorCode.STATUS_NOT_FOUND));

        order.setStatus(statusEntity);

        // Save
        Order updatedOrder = orderRepository.save(order);
        return toFullOrderResponse(updatedOrder);
    }


    @Override
    public OrderResponse updateOrderAddItems(Integer orderId, List<UpdateDetailOrderRequest> detailOrderRequests, JwtAuthenticationToken jwtAuthenticationToken) {
        // 1. Lấy Customer từ JWT
        String username = null;
        Customer customer = null;

        if (jwtAuthenticationToken != null) {
            username = jwtAuthenticationToken.getName();
            if (username == null || username.isEmpty()) {
                throw new AppException(ErrorCode.INVALID_TOKEN_FORMAT);
            }

            Account account = accountRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

            customer = customerRepository.findByAccountAccountId(account.getAccountId())
                    .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        }

        // 2. Kiểm tra order tồn tại
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // 3. Validate: Order phải thuộc về customer hiện tại (nếu đã đăng nhập)
        if (customer != null && !order.getCustomer().getCustomerId().equals(customer.getCustomerId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ORDER_ACCESS);
        }

        // 4. Validate: Order phải ở trạng thái Pending_payment
        OrderStatus requiredStatus = OrderStatus.valueOf("Pending_payment");
        Status pendingPaymentStatus = statusRepository.findByOrderStatus(requiredStatus)
                .orElseThrow(() -> new RuntimeException("Status not found"));

        if (!order.getStatus().getStatusId().equals(pendingPaymentStatus.getStatusId())) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
        }

        // 5. Validate: Bàn vẫn hoạt động (không bị xóa/khóa)
        RestaurantTable table = order.getTable();
        if (table.getIs_active() != null && table.getIs_active()) {
            throw new AppException(ErrorCode.TABLE_NOT_AVAILABLE);
        }

        // 6. Lấy danh sách DetailOrder hiện tại
        List<DetailOrder> existingDetails = order.getDetailOrders();

        // 7. Xử lý các mặt hàng - CHỈ THÊM, KHÔNG XÓA
        List<DetailOrder> newDetailOrders = new ArrayList<>();
        List<DetailOrder> updatedDetailOrders = new ArrayList<>();

        for (UpdateDetailOrderRequest detailOrderRequest : detailOrderRequests) {

            // 7.1. Validate request
            if (detailOrderRequest.getItemId() == null || detailOrderRequest.getQuantity() == null) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            // 7.2. ❌ KHÔNG CHO PHÉP GIẢM QUANTITY (quantity <= 0 hoặc âm)
            if (detailOrderRequest.getQuantity() <= 0) {
                throw new AppException(ErrorCode.CANNOT_DECREASE_QUANTITY);
            }

            // 7.3. Kiểm tra item
            Item item = itemRepository.findById(detailOrderRequest.getItemId())
                    .orElseThrow(() -> new AppException(ErrorCode.ITEM_NOT_FOUND));

            double itemPrice = item.getPrice();

            // 7.4. Validate & xử lý modifiers
            List<ModifierOption> requestModifiers = new ArrayList<>();
            if (detailOrderRequest.getModifierOptionIds() != null && !detailOrderRequest.getModifierOptionIds().isEmpty()) {
                requestModifiers = modifierOptionRepository.findAllById(detailOrderRequest.getModifierOptionIds());

                // Validate số lượng modifier tìm được
                if (requestModifiers.size() != detailOrderRequest.getModifierOptionIds().size()) {
                    throw new AppException(ErrorCode.MODIFIER_NOT_FOUND);
                }

                List<ModifierGroup> itemModifierGroups = item.getModifierGroups();
                validateModifiersForItem(requestModifiers, itemModifierGroups);
            } else {
                validateRequiredModifierGroups(item.getModifierGroups());
            }

            // 7.5. Tìm DetailOrder đã tồn tại theo itemId
            DetailOrder existingDetailOrder = existingDetails.stream()
                    .filter(d -> d.getItem().getItemId().equals(detailOrderRequest.getItemId()))
                    .findFirst()
                    .orElse(null);

            if (existingDetailOrder != null) {
                // ===== ĐÃ CÓ DETAILORDER → KIỂM TRA XÓA MODIFIERS =====

                // 7.6. Lấy danh sách modifier IDs hiện tại
                Set<Integer> currentModifierIds = existingDetailOrder.getModifies().stream()
                        .map(ModifierOption::getModifierOptionId)
                        .collect(Collectors.toSet());

                // 7.7. ❌ KIỂM TRA CÓ Ý ĐỊNH XÓA MODIFIERS KHÔNG
                Set<Integer> requestModifierIds = requestModifiers.stream()
                        .map(ModifierOption::getModifierOptionId)
                        .collect(Collectors.toSet());

                // Tìm modifiers bị thiếu trong request (có nghĩa là muốn xóa)
                Set<Integer> removedModifierIds = new HashSet<>(currentModifierIds);
                removedModifierIds.removeAll(requestModifierIds);

                if (!removedModifierIds.isEmpty()) {
                    // ❌ CÓ MODIFIERS BỊ THIẾU → BÁO LỖI
                    throw new AppException(ErrorCode.CANNOT_REMOVE_MODIFIERS);
                }

                // 7.8. Lọc ra các modifiers MỚI (chưa có trong DetailOrder)
                List<ModifierOption> newModifiersToAdd = new ArrayList<>();
                List<Integer> skippedModifierIds = new ArrayList<>();

                for (ModifierOption requestModifier : requestModifiers) {
                    if (!currentModifierIds.contains(requestModifier.getModifierOptionId())) {
                        // ✅ Modifier chưa có → THÊM
                        newModifiersToAdd.add(requestModifier);
                        System.out.println("➕ Thêm modifier " + requestModifier.getModifierOptionId() +
                                " vào DetailOrder " + existingDetailOrder.getDetailOrderId());
                    } else {
                        // ℹ️ Modifier đã có → BỎ QUA
                        skippedModifierIds.add(requestModifier.getModifierOptionId());
                    }
                }

                // 7.9. THÊM modifiers mới vào DetailOrder
                if (!newModifiersToAdd.isEmpty()) {
                    existingDetailOrder.getModifies().addAll(newModifiersToAdd);
                    System.out.println("✅ Đã thêm " + newModifiersToAdd.size() + " modifier mới vào DetailOrder " +
                            existingDetailOrder.getDetailOrderId());
                }

                if (!skippedModifierIds.isEmpty()) {
                    System.out.println("ℹ️ Bỏ qua " + skippedModifierIds.size() + " modifier đã tồn tại: " + skippedModifierIds);
                }

                // 7.10. TĂNG quantity (CHỈ TĂNG, KHÔNG GIẢM)
                int oldQuantity = existingDetailOrder.getQuantity();
                int newQuantity = oldQuantity + detailOrderRequest.getQuantity();
                existingDetailOrder.setQuantity(newQuantity);

                updatedDetailOrders.add(existingDetailOrder);

                System.out.println("📝 Cập nhật DetailOrder " + existingDetailOrder.getDetailOrderId() +
                        ": Item " + item.getItemId() +
                        ", qty " + oldQuantity + " → " + newQuantity +
                        ", modifiers " + currentModifierIds.size() + " → " + existingDetailOrder.getModifies().size());

            } else {
                // ===== CHƯA CÓ DETAILORDER → THÊM MỚI =====

                DetailOrder detailOrder = new DetailOrder();
                detailOrder.setItem(item);
                detailOrder.setPrice(itemPrice);
                detailOrder.setQuantity(detailOrderRequest.getQuantity());
                detailOrder.setModifies(requestModifiers);
                detailOrder.setOrder(order);

                newDetailOrders.add(detailOrder);

                System.out.println("✨ Thêm mới DetailOrder: Item " + item.getItemId() +
                        ", qty " + detailOrderRequest.getQuantity() +
                        ", modifiers " + requestModifiers.size());
            }
        }

        // 8. ❌ KIỂM TRA CÓ Ý ĐỊNH XÓA DETAILORDER KHÔNG
        // Lấy tất cả itemIds từ request
        Set<Integer> requestItemIds = detailOrderRequests.stream()
                .map(UpdateDetailOrderRequest::getItemId)
                .collect(Collectors.toSet());

        // Kiểm tra có DetailOrder nào trong order KHÔNG CÓ trong request không
        List<Integer> missingItemIds = new ArrayList<>();
        for (DetailOrder existingDetail : existingDetails) {
            Integer existingItemId = existingDetail.getItem().getItemId();
            if (!requestItemIds.contains(existingItemId)) {
                missingItemIds.add(existingItemId);
            }
        }

        if (!missingItemIds.isEmpty()) {
            // ❌ CÓ ITEMS BỊ THIẾU TRONG REQUEST → BÁO LỖI
            throw new AppException(ErrorCode.CANNOT_REMOVE_ITEMS);
        }

        // 9. Lưu các DetailOrder mới và cập nhật
        if (!newDetailOrders.isEmpty()) {
            detailOrderRepository.saveAll(newDetailOrders);
            System.out.println("💾 Đã lưu " + newDetailOrders.size() + " DetailOrder mới");
        }

        if (!updatedDetailOrders.isEmpty()) {
            detailOrderRepository.saveAll(updatedDetailOrders);
            System.out.println("💾 Đã cập nhật " + updatedDetailOrders.size() + " DetailOrder hiện có");
        }

        // 10. Cập nhật quantity_sold của items
        for (UpdateDetailOrderRequest detailOrderRequest : detailOrderRequests) {
            Item item = itemRepository.findById(detailOrderRequest.getItemId()).orElse(null);
            if (item != null) {
                int currentSold = item.getQuantitySold() != null ? item.getQuantitySold() : 0;
                item.setQuantitySold(currentSold + detailOrderRequest.getQuantity());
                itemRepository.save(item);
            }
        }

        // 11. Cập nhật order
        order.setUpdateAt(LocalDateTime.now());
        Order updatedOrder = orderRepository.save(order);

        // 12. Lấy toàn bộ DetailOrders của order (cả cũ + mới)
        List<DetailOrder> allDetailOrders = detailOrderRepository.findByOrder_OrderId(orderId);

        // 13. TÍNH LẠI subtotal từ tất cả DetailOrders
        float totalSubtotal = 0;
        for (DetailOrder detail : allDetailOrders) {
            double itemTotal = detail.getPrice() * detail.getQuantity();
            if (detail.getModifies() != null && !detail.getModifies().isEmpty()) {
                for (ModifierOption modifier : detail.getModifies()) {
                    itemTotal += modifier.getPrice() * detail.getQuantity();
                }
            }
            totalSubtotal += itemTotal;
        }

        // 14. Tạo response
        OrderResponse response = orderMapper.toOrderResponse(updatedOrder);
        response.setSubtotal(totalSubtotal);
        response.setOderStatus(updatedOrder.getStatus().getOrderStatus());
        response.setCustomerName(updatedOrder.getCustomerName());
        response.setTableId(updatedOrder.getTable().getTableId());
        response.setDetailOrders(toDetailOrderResponses(allDetailOrders));

        System.out.println("✅ Cập nhật order " + orderId + " thành công. " +
                "Thêm " + newDetailOrders.size() + " DetailOrder mới, " +
                "Cập nhật " + updatedDetailOrders.size() + " DetailOrder hiện có");

        return response;
    }


    private OrderResponse toFullOrderResponse(Order order) {
        OrderResponse response = orderMapper.toOrderResponse(order);

        // Set tableId (vì mapper cơ bản có thể không map trường này)
        if (order.getTable() != null) {
            response.setTableId(order.getTable().getTableId());
        }
        response.setOderStatus(order.getStatus().getOrderStatus());

        // Map chi tiết đơn hàng với đầy đủ thông tin item và modifier
        List<DetailOrderResponse> detailResponses = order.getDetailOrders().stream()
                .map(detail -> {
                    DetailOrderResponse detailResponse = detailOrderMapper.toDetailOrderResponse(detail);

                    // Thêm thông tin item
                    if (detail.getItem() != null) {
                        detailResponse.setItemId(detail.getItem().getItemId());
                        detailResponse.setItemName(detail.getItem().getItemName());
                    }

                    // Map modifiers chi tiết (vì mapper mặc định có thể không làm phần này)
                    List<ModifierOptionResponse> modifierResponses = detail.getModifies().stream()
                            .map(m -> {
                                ModifierOptionResponse modResp = new ModifierOptionResponse();
                                modResp.setModifierOptionId(m.getModifierOptionId());
                                modResp.setName(m.getName());
                                modResp.setPrice(m.getPrice());
                                modResp.setModifierGroupId(m.getModifierGroup().getModifierGroupId());
                                modResp.setModifierGroupName(m.getModifierGroup().getName());
                                return modResp;
                            })
                            .collect(Collectors.toList());

                    detailResponse.setModifiers(modifierResponses);
                    return detailResponse;
                })
                .collect(Collectors.toList());

        response.setDetailOrders(detailResponses);

        return response;
    }

    private List<DetailOrderResponse> toDetailOrderResponses(List<DetailOrder> detailOrders) {
        return detailOrders.stream()
                .map(detail -> {
                    DetailOrderResponse detailResponse = detailOrderMapper.toDetailOrderResponse(detail);

                    if (detail.getItem() != null) {
                        detailResponse.setItemId(detail.getItem().getItemId());
                        detailResponse.setItemName(detail.getItem().getItemName());
                    }

                    detailResponse.setModifiers(detail.getModifies().stream()
                            .map(m -> new ModifierOptionResponse(
                                    m.getModifierOptionId(),
                                    m.getName(),
                                    m.getPrice(),
                                    m.getModifierGroup().getModifierGroupId(),
                                    m.getModifierGroup().getName()
                            ))
                            .collect(Collectors.toList()));

                    return detailResponse;
                })
                .collect(Collectors.toList());
    }

    private void validateModifiersForItem(List<ModifierOption> modifierOptions, List<ModifierGroup> itemModifierGroups) {

        Map<ModifierGroup, List<ModifierOption>> modifiersByGroup = new HashMap<>();

        // Check modifier group có thuộc Item không
        for (ModifierOption modifier : modifierOptions) {
            ModifierGroup group = modifier.getModifierGroup();
            if (!itemModifierGroups.contains(group)) {
                throw new AppException(ErrorCode.MODIFIER_NOT_VALID_FOR_ITEM);
            }
            modifiersByGroup.computeIfAbsent(group, k -> new ArrayList<>()).add(modifier);
        }

        // Validate constraints của từng group
        for (ModifierGroup group : itemModifierGroups) {
            List<ModifierOption> selectedModifiers = modifiersByGroup.getOrDefault(group, new ArrayList<>());

            // Check isRequired
            if (Boolean.TRUE.equals(group.getIsRequired()) && selectedModifiers.isEmpty()) {
                throw new AppException(ErrorCode.REQUIRED_MODIFIER_GROUP_NOT_SELECTED);
            }

            // Check selectionType
            if (selectedModifiers.size() > 1) {
                if (group.getSelectionType() == SelectionType.SINGLE) {
                    throw new AppException(ErrorCode.MODIFIER_GROUP_ONLY_SINGLE_SELECTION);
                }
            }

            if (selectedModifiers.size() == 0 && group.getSelectionType() == SelectionType.SINGLE && Boolean.TRUE.equals(group.getIsRequired())) {
                throw new AppException(ErrorCode.REQUIRED_MODIFIER_GROUP_NOT_SELECTED);
            }
        }
    }

    private void validateRequiredModifierGroups(List<ModifierGroup> modifierGroups) {
        for (ModifierGroup group : modifierGroups) {
            if (Boolean.TRUE.equals(group.getIsRequired())) {
                throw new AppException(ErrorCode.REQUIRED_MODIFIER_GROUP_NOT_SELECTED);
            }
        }
    }



}
