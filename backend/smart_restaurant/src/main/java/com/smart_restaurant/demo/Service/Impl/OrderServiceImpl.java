package com.smart_restaurant.demo.Service.Impl;


import com.lowagie.text.*;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.smart_restaurant.demo.Repository.DiscountRepository;
import com.smart_restaurant.demo.Repository.OrderRepository;
import com.smart_restaurant.demo.Repository.StatusRepository;
import com.smart_restaurant.demo.Repository.*;
import com.smart_restaurant.demo.Service.AccountService;
import com.smart_restaurant.demo.Service.OrderService;
import com.smart_restaurant.demo.dto.Response.InvoiceResponse;
import com.smart_restaurant.demo.entity.Discount;
import com.smart_restaurant.demo.entity.Image;
import com.smart_restaurant.demo.entity.Order;
import com.smart_restaurant.demo.entity.Status;
import com.smart_restaurant.demo.enums.DiscountType;
import com.smart_restaurant.demo.enums.OrderStatus;
import com.smart_restaurant.demo.exception.AppException;
import com.smart_restaurant.demo.exception.ErrorCode;
import com.smart_restaurant.demo.mapper.OrderMapper;
import com.smart_restaurant.demo.dto.Request.DetailOrderRequest;
import com.smart_restaurant.demo.dto.Request.OrderRequest;
import com.smart_restaurant.demo.dto.Response.DetailOrderResponse;
import com.smart_restaurant.demo.dto.Response.ModifierOptionResponse;
import com.smart_restaurant.demo.dto.Response.OrderResponse;
import com.smart_restaurant.demo.entity.*;
import com.smart_restaurant.demo.enums.OrderStatus;
import com.smart_restaurant.demo.exception.AppException;
import com.smart_restaurant.demo.exception.ErrorCode;

import com.smart_restaurant.demo.mapper.DetailOrderMapper;



import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.awt.*;
import java.awt.Font;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderServiceImpl implements OrderService {
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
    DiscountRepository discountRepository;
    OrderRepository orderRepository;
    @Override
    public InvoiceResponse createInvoice(Integer orderId ,JwtAuthenticationToken jwtAuthenticationToken){
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_EXISTED));

        List<Discount> discountList = discountRepository.findAll();

        Discount discountApply = null;
        Account account=accountRepository.findByUsername(jwtAuthenticationToken.getName()).orElseThrow(()->new AppException(ErrorCode.ACCOUNT_EXISTED));
        Tenant tenant=account.getTenant();
        for (Discount discount : discountList) {
            if (discount.getMinApply() <= order.getSubtotal()
                    && discount.getMaxApply() >= order.getSubtotal()
                    && Boolean.TRUE.equals(discount.getIsActive())
                    &&discount.getTenant()==tenant) {
                discountApply = discount;
                break;
            }
        }

        float subtotal = order.getSubtotal();
        float discountAmount = 0;
        Integer taxRate = 5;
        float taxAmount;
        float total;

        if (discountApply != null) {
            if (discountApply.getDiscountType() == DiscountType.Percent) {
                discountAmount = subtotal * discountApply.getValue() / 100;
            } else if (discountApply.getDiscountType() == DiscountType.Fixed) {
                discountAmount = discountApply.getValue();
            }
        }

        float afterDiscount = subtotal - discountAmount;

        taxAmount = afterDiscount * taxRate / 100;

        total = afterDiscount + taxAmount;

        order.setTax(taxRate);
        order.setTotal(total);
        order.setDiscount(discountAmount);
        Status status=order.getStatus();
        status.setOrderStatus(OrderStatus.Pending_payment);
        statusRepository.save(status);
        InvoiceResponse invoiceResponse=orderMapper.toInvoiceResponse(orderRepository.save(order));
        invoiceResponse.setTableName(order.getTable().getTableName());
        invoiceResponse.setDetailOrders(toDetailOrderResponses(order.getDetailOrders()));
        System.out.println("name:"+ order.getCustomerName());
        if(order.getIsHaveName()==true){
            invoiceResponse.setCustomerName(order.getCustomerName());
        }else {
            invoiceResponse.setCustomerName(order.getCustomer().getName());
        }
        return invoiceResponse;
    }


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

                for (ModifierOption modifier : modifierOptions) {
                    boolean isValidModifier = itemModifierGroups.stream()
                            .anyMatch(group -> group.getOptions() != null &&
                                    group.getOptions().contains(modifier));

                    if (!isValidModifier) {
                        throw new AppException(ErrorCode.MODIFIER_NOT_VALID_FOR_ITEM);
                    }

                    itemTotal += modifier.getPrice();
                }
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
    @Override
    public byte[] generateInvoicePdf(Integer orderId, JwtAuthenticationToken jwtAuthenticationToken) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_EXISTED));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // ===== TITLE (GIỮ NGUYÊN FONT) =====
            com.lowagie.text.Font titleFont =
                    new com.lowagie.text.Font(
                            com.lowagie.text.Font.HELVETICA,
                            18,
                            com.lowagie.text.Font.BOLD
                    );


            Paragraph title = new Paragraph(
                    "SMART RESTAURANT\nHÓA ĐƠN THANH TOÁN",
                    titleFont
            );
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15);
            document.add(title);

            // ===== INFO (GIỮ NGUYÊN FONT) =====
            com.lowagie.text.Font normalFont =
                    new com.lowagie.text.Font(
                            com.lowagie.text.Font.HELVETICA,
                            10,
                            com.lowagie.text.Font.BOLD
                    );

            document.add(new Paragraph("Mã đơn: " + order.getOrderId(), normalFont));
            document.add(new Paragraph("Bàn: " + order.getTable().getTableName(), normalFont));

            String customerName = Boolean.TRUE.equals(order.getIsHaveName())
                    ? order.getCustomerName()
                    : order.getCustomer().getName();

            document.add(new Paragraph("Khách hàng: " + customerName, normalFont));
            document.add(new Paragraph("Ngày: " + order.getCreateAt(), normalFont));
            document.add(Chunk.NEWLINE);

            // ===== TABLE (7 CỘT) =====
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setWidths(new float[]{3, 1, 2, 2, 2, 2, 2});

            // ===== HEADER =====
            table.addCell(createHeaderCell("Món"));
            table.addCell(createHeaderCell("SL"));
            table.addCell(createHeaderCell("Giá"));
            table.addCell(createHeaderCell("Loại"));
            table.addCell(createHeaderCell("size"));
            table.addCell(createHeaderCell("Giá mod"));
            table.addCell(createHeaderCell("Thành tiền"));

            // ===== DATA =====
            for (DetailOrder d : order.getDetailOrders()) {
                double modifierTotal=0;

                if (d.getModifies() == null || d.getModifies().isEmpty()) {
                    table.addCell(createCell(d.getItem().getItemName()));
                    table.addCell(createCenterCell(String.valueOf(d.getQuantity())));
                    table.addCell(createRightCell(formatMoney(d.getPrice())));

                    table.addCell(createCell("-"));
                    table.addCell(createCell("-"));
                    table.addCell(createRightCell("-"));
                    double lineTotal = d.getQuantity() * d.getPrice();
                    table.addCell(createRightCell(formatMoney(lineTotal)));
                } else {

                    for (ModifierOption m : d.getModifies()) {

                        table.addCell(createCell(d.getItem().getItemName()));
                        table.addCell(createCenterCell(String.valueOf(d.getQuantity())));
                        table.addCell(createRightCell(formatMoney(d.getPrice())));

                        table.addCell(createCell(m.getModifierGroup().getName()));
                        table.addCell(createCell(m.getName()));
                        table.addCell(createRightCell(formatMoney(m.getPrice())));
                        modifierTotal+=m.getPrice();
                    }
                    double lineTotal = d.getQuantity() * d.getPrice()+modifierTotal;
                    table.addCell(createRightCell(formatMoney(lineTotal)));
                }
            }

            document.add(table);
            document.add(Chunk.NEWLINE);

            // ===== TOTAL =====
            document.add(new Paragraph("Tạm tính: " + formatMoney(order.getSubtotal()), normalFont));
            document.add(new Paragraph("Giảm giá: -" + formatMoney(order.getDiscount()), normalFont));

            double taxAmount = order.getTotal() - (order.getSubtotal() - order.getDiscount());
            document.add(new Paragraph(
                    "Thuế (" + order.getTax() + "%): " + formatMoney(taxAmount),
                    normalFont
            ));

            com.lowagie.text.Font totalFont =
                    new com.lowagie.text.Font(
                            com.lowagie.text.Font.HELVETICA,
                            12,
                            com.lowagie.text.Font.BOLD
                    );

            Paragraph total = new Paragraph(
                    "TỔNG THANH TOÁN: " + formatMoney(order.getTotal()),
                    totalFont
            );
            total.setSpacingBefore(10);
            document.add(total);

            Paragraph thanks = new Paragraph("\nCảm ơn quý khách!", normalFont);
            thanks.setAlignment(Element.ALIGN_CENTER);
            document.add(thanks);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo PDF hóa đơn", e);
        } finally {
            document.close();
        }

        return out.toByteArray();
    }

    // ================= HELPER =================

    private PdfPCell createCell(String content) {
        com.lowagie.text.Font font = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 10, com.lowagie.text.Font.BOLD);
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setPadding(2);
        return cell;
    }

    private PdfPCell createHeaderCell(String content) {
        com.lowagie.text.Font font = new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, 12, com.lowagie.text.Font.BOLD);
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setPadding(2);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    private PdfPCell createRightCell(String content) {
        PdfPCell cell = createCell(content);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return cell;
    }

    private PdfPCell createCenterCell(String content) {
        PdfPCell cell = createCell(content);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    private String formatMoney(Double value) {
        if (value == null) value = 0d;
        return String.format("%,.0f VNĐ", value);
    }

    private String formatMoney(Float value) {
        if (value == null) value = 0f;
        return String.format("%,.0f VNĐ", value);
    }





}
