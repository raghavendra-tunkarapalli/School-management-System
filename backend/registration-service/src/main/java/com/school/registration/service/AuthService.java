package com.school.registration.service;

import com.school.registration.dto.AuthResponse;
import com.school.registration.dto.LoginRequest;
import com.school.registration.dto.RegisterRequest;
import com.school.registration.entity.Role;
import com.school.registration.entity.User;
import com.school.registration.repository.UserRepository;
import com.school.registration.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse register(RegisterRequest request) {
        // Validation checks
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Registration for ADMIN role is disabled. Contact system administrator.");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email '" + request.getEmail() + "' is already registered. Please sign in or use a different email.");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username '" + request.getUsername() + "' is already taken. Please choose a different username.");
        }

        // Create new user entity
        User user = new User(
                request.getFirstName(),
                request.getLastName(),
                request.getUsername(),
                request.getEmail(),
                request.getRole(),
                passwordEncoder.encode(request.getPassword())
        );

        User savedUser = userRepository.save(user);

        // Generate JWT token containing mandatory user_id & role
        String token = jwtUtils.generateToken(savedUser);

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getRole(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                "User registered successfully!"
        );
    }

    public AuthResponse login(LoginRequest request) {
        // Find user by email or username
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(request.getEmail());
        }

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid email/username or password. Please try again.");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email/username or password. Please try again.");
        }

        String token = jwtUtils.generateToken(user);

        return new AuthResponse(
                token,
                user.getId(),
                user.getRole(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                "Authentication successful!"
        );
    }
}
