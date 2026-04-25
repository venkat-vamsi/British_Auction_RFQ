package com.rfq.british.config;

import com.rfq.british.enums.UserRole;
import com.rfq.british.model.User;
import com.rfq.british.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedUsers() {
        return args -> {
            if (!userRepository.existsByEmail("buyer@demo.com")) {
                createUser("Alice Buyer", "buyer@demo.com", "BritishCo Procurement", UserRole.BUYER);
                createUser("Supplier Alpha", "alpha@demo.com", "Alpha Freight Ltd", UserRole.SUPPLIER);
                createUser("Supplier Beta", "beta@demo.com", "Beta Logistics", UserRole.SUPPLIER);
                createUser("Supplier Gamma", "gamma@demo.com", "Gamma Cargo Co", UserRole.SUPPLIER);
                log.info("Demo users seeded. Password for all: password123");
            }
        };
    }

    private void createUser(String name, String email, String company, UserRole role) {
        User user = User.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode("password123"))
                .role(role)
                .companyName(company)
                .build();
        userRepository.save(user);
    }
}
