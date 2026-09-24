package com.school.adminadmission;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AdminAdmissionsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdminAdmissionsServiceApplication.class, args);
    }
}
