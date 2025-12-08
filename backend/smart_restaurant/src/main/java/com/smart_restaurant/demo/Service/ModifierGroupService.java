package com.smart_restaurant.demo.Service;

import com.smart_restaurant.demo.dto.Request.ModifierGroupRequest;
import com.smart_restaurant.demo.dto.Response.ModifierGroupResponse;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public interface ModifierGroupService {
    public ModifierGroupResponse createModifierGroup(ModifierGroupRequest request, JwtAuthenticationToken jwtAuthenticationToken);
}
