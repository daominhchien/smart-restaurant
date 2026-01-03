package com.smart_restaurant.demo.dto.Request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class OrderRequest {

    private String customerName;
    private Integer tableId;
    private String special;
    private List<DetailOrderRequest> detailOrders;
}
