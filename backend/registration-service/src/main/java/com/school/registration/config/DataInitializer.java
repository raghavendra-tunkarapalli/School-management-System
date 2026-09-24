package com.school.registration.config;

import com.school.registration.entity.Role;
import com.school.registration.entity.User;
import com.school.registration.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminPassword = passwordEncoder.encode("admin");
            String teacherPassword = passwordEncoder.encode("teacher");
            String staffPassword = passwordEncoder.encode("staff");
            String parentPassword = passwordEncoder.encode("parent");
            String studentPassword = passwordEncoder.encode("student");

            // Seed Demo Admin (admin@gmail.com and admin@school.com with password 'admin')
            seedOrUpdateUser(userRepository, "System", "Admin", "admin_gmail", "admin@gmail.com", Role.ADMIN, adminPassword);
            seedOrUpdateUser(userRepository, "System", "Admin", "admin", "admin@school.com", Role.ADMIN, adminPassword);

            // Seed Demo Teacher (teacher@gmail.com with password 'teacher')
            seedOrUpdateUser(userRepository, "Sarah", "Connor", "teacher_gmail", "teacher@gmail.com", Role.TEACHER, teacherPassword);
            seedOrUpdateUser(userRepository, "Sarah", "Connor", "teacher", "teacher@school.com", Role.TEACHER, teacherPassword);

            // Seed Demo Staff (staff@gmail.com with password 'staff')
            seedOrUpdateUser(userRepository, "Michael", "Scott", "staff_gmail", "staff@gmail.com", Role.STAFF, staffPassword);
            seedOrUpdateUser(userRepository, "Michael", "Scott", "staff", "staff@school.com", Role.STAFF, staffPassword);

            // Seed Demo Parent (parent@gmail.com with password 'parent')
            seedOrUpdateUser(userRepository, "Robert", "Patterson", "parent_gmail", "parent@gmail.com", Role.PARENT, parentPassword);
            seedOrUpdateUser(userRepository, "Robert", "Patterson", "parent", "parent@school.com", Role.PARENT, parentPassword);

            // Seed Demo Student (student@gmail.com with password 'student')
            seedOrUpdateUser(userRepository, "Alex", "Morgan", "student_gmail", "student@gmail.com", Role.STUDENT, studentPassword);
            seedOrUpdateUser(userRepository, "Alex", "Morgan", "student", "student@school.com", Role.STUDENT, studentPassword);
        };
    }

    private void seedOrUpdateUser(UserRepository repo, String firstName, String lastName, String username, String email, Role role, String password) {
        Optional<User> byEmail = repo.findByEmail(email);
        if (byEmail.isPresent()) {
            User u = byEmail.get();
            u.setPassword(password);
            repo.save(u);
            return;
        }

        Optional<User> byUser = repo.findByUsername(username);
        if (byUser.isPresent()) {
            User u = byUser.get();
            u.setPassword(password);
            u.setEmail(email);
            repo.save(u);
            return;
        }

        repo.save(new User(firstName, lastName, username, email, role, password));
    }
}
