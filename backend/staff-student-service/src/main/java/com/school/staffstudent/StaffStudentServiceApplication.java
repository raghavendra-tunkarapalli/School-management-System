package com.school.staffstudent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class StaffStudentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(StaffStudentServiceApplication.class, args);
    }
}
