package com.smart_restaurant.demo.Controller;


import com.smart_restaurant.demo.Service.ModifierGroupService;
import com.smart_restaurant.demo.dto.Request.ModifierGroupRequest;
import com.smart_restaurant.demo.dto.Response.ApiResponse;
import com.smart_restaurant.demo.dto.Response.ModifierGroupResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/menu/modifier-group")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ModifierGroupController {

    ModifierGroupService modifierGroupService;

    @PostMapping("")
    public ApiResponse<ModifierGroupResponse> createModifierGroup(@Valid @RequestBody ModifierGroupRequest modifierGroupRequest, JwtAuthenticationToken jwtAuthenticationToken){
        ModifierGroupResponse modifierGroup = modifierGroupService.createModifierGroup(modifierGroupRequest, jwtAuthenticationToken);

        return ApiResponse.<ModifierGroupResponse>builder()
                .message("ModifierGroup create successfully")
                .result(modifierGroup)
                .build();


    }
}
