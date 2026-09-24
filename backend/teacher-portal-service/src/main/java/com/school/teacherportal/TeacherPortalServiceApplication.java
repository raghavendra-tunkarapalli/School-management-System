package com.school.teacherportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class TeacherPortalServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TeacherPortalServiceApplication.class, args);
    }
}
