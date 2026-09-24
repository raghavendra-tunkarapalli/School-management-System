package com.school.studentportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class StudentPortalServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentPortalServiceApplication.class, args);
    }
}
