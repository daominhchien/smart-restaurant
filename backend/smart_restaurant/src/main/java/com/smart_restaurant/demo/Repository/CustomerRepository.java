package com.smart_restaurant.demo.Repository;

import com.smart_restaurant.demo.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
}
