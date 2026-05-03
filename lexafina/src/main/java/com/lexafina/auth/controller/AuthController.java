package com.lexafina.auth.controller;

import com.lexafina.auth.dto.AuthResponse;
import com.lexafina.auth.dto.LoginRequest;
import com.lexafina.auth.dto.RegisterRequest;
import com.lexafina.auth.dto.UserSummary;
import com.lexafina.auth.security.UserPrincipal;
import com.lexafina.auth.service.AuthService;
import com.lexafina.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        return ResponseEntity.ok(ApiResponse.ok(authService.register(request, response)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request, response)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        return authService.refresh(request, response)
                .map(body -> ResponseEntity.ok(ApiResponse.ok(body)))
                .orElseGet(() -> ResponseEntity.status(401)
                        .body(ApiResponse.<AuthResponse>unauthorized("Invalid or expired session")));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummary>> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(authService.me(principal)));
    }
}
