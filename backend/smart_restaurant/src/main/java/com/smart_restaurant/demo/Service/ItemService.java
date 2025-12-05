package com.smart_restaurant.demo.Service;

import com.smart_restaurant.demo.dto.Request.ItemRequest;
import com.smart_restaurant.demo.entity.Item;


public interface ItemService {
    public Item createItem(ItemRequest request);
}
