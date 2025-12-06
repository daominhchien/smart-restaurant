package com.smart_restaurant.demo.Service.Impl;


import com.smart_restaurant.demo.Repository.CategoryRepository;
import com.smart_restaurant.demo.Repository.ItemRepository;
import com.smart_restaurant.demo.Repository.ModifierGroupRepository;
import com.smart_restaurant.demo.Service.CategoryService;
import com.smart_restaurant.demo.Service.ItemService;
import com.smart_restaurant.demo.dto.Request.ItemRequest;
import com.smart_restaurant.demo.dto.Response.ItemResponse;
import com.smart_restaurant.demo.entity.Category;
import com.smart_restaurant.demo.entity.Item;
import com.smart_restaurant.demo.entity.ModifierGroup;
import com.smart_restaurant.demo.exception.AppException;
import com.smart_restaurant.demo.exception.ErrorCode;
import com.smart_restaurant.demo.mapper.ItemMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ItemServiceImpl implements ItemService {

    CategoryRepository categoryRepository;
    ItemMapper itemMapper;
    ItemRepository itemRepository;
    ModifierGroupRepository modifierGroupRepository;

    @Override
    public ItemResponse createItem(ItemRequest request) {
        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        if (categories.size() != request.getCategoryIds().size()) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
       // Kiem tra trung Item
        boolean existsItem = itemRepository.existsByItemNameAndCategoryIn(request.getItemName(), categories);
        if (existsItem) {
            throw new AppException(ErrorCode.ITEM_ALREADY_EXISTS);
        }

        Item item = itemMapper.toItem(request);
        item.setCategory(categories);

        // Phần modifierGroup
        List<ModifierGroup> modifierGroup = new ArrayList<>();

        if ( request.getModifierGroupIds() != null){
            modifierGroup = modifierGroupRepository.findAllById(request.getModifierGroupIds());
            if (modifierGroup.size() != request.getModifierGroupIds().size()) {
                throw new AppException(ErrorCode.MODIFIER_GROUP_NOT_FOUND);
            }
            item.setModifierGroups(modifierGroup);
        }
        Item savedItem = itemRepository.save(item);

        ItemResponse itemResponse= itemMapper.toItemResponse(savedItem);
        itemResponse.setCategories(categories);
        itemResponse.setModifierGroup(modifierGroup);

        return itemResponse;
    }
}
