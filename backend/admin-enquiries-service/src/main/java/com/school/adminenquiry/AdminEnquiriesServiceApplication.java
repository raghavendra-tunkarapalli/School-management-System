package com.school.adminenquiry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AdminEnquiriesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdminEnquiriesServiceApplication.class, args);
    }
}
