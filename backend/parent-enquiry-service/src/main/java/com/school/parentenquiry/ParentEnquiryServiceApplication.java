package com.school.parentenquiry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ParentEnquiryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParentEnquiryServiceApplication.class, args);
    }
}
