package com.school.attendance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class TeacherAttendanceServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(TeacherAttendanceServiceApplication.class, args);
    }
}
