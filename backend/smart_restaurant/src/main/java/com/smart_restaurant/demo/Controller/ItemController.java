package com.smart_restaurant.demo.Controller;


import com.smart_restaurant.demo.Service.ItemService;
import com.smart_restaurant.demo.dto.Request.ItemRequest;
import com.smart_restaurant.demo.dto.Response.ApiResponse;
import com.smart_restaurant.demo.entity.Item;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ItemController {

    ItemService itemService;

    @PostMapping("")
    public ApiResponse<Item> createItem( @RequestBody ItemRequest request) {
        Item item = itemService.createItem(request);
        return ApiResponse.<Item>builder()
                .message("Item created successfully")
                .result(item)
                .build();
    }
}
