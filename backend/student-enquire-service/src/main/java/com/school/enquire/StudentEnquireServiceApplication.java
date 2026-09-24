package com.school.enquire;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class StudentEnquireServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentEnquireServiceApplication.class, args);
    }
}
