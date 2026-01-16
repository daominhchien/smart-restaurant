package com.smart_restaurant.demo.mapper;

import com.smart_restaurant.demo.dto.Request.CustomerRequest;
import com.smart_restaurant.demo.dto.Request.SignupCustomerRequest;
import com.smart_restaurant.demo.dto.Response.CustomerResponse;
import com.smart_restaurant.demo.dto.Response.CustomerResponseDto;
import com.smart_restaurant.demo.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",uses = {AccountMapper.class})
public interface CustomerMapper {

    Customer toCustomer(SignupCustomerRequest signupCustomerRequest);

    CustomerResponse toCustomerResponse(Customer customer);
    CustomerResponseDto toCustomerResponseDto(Customer customer);
    Customer toCustomer(CustomerRequest customerRequest);
}
