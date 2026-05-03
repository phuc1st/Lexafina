package com.lexafina.auth.service;

import com.lexafina.auth.dto.AuthResponse;
import com.lexafina.auth.dto.LoginRequest;
import com.lexafina.auth.dto.RegisterRequest;
import com.lexafina.auth.dto.UserSummary;
import com.lexafina.auth.entity.RefreshToken;
import com.lexafina.auth.entity.User;
import com.lexafina.auth.repository.RefreshTokenRepository;
import com.lexafina.auth.repository.UserRepository;
import com.lexafina.auth.security.UserPrincipal;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;

/**
 * Đăng ký/đăng nhập, phát hành JWT + refresh token (hash trong DB, raw trong cookie).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int REFRESH_RANDOM_BYTES = 32;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CookieService cookieService;

    @Value("${app.jwt.refresh-ttl-days:14}")
    private int refreshTtlDays;

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already taken");
        }
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);
        return issueTokens(user, response);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        refreshTokenRepository.deleteByUserId(user.getId());
        return issueTokens(user, response);
    }

    @Transactional
    public Optional<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
        String raw = readCookie(request, CookieService.REFRESH_COOKIE);
        if (raw == null || raw.isBlank()) {
            return Optional.empty();
        }
        String hash = sha256Hex(raw);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash).orElse(null);
        if (stored == null || stored.getRevokedAt() != null || stored.getExpiresAt().isBefore(Instant.now())) {
            cookieService.clearRefreshCookie(response);
            return Optional.empty();
        }
        Long userId = stored.getUser().getId();
        refreshTokenRepository.deleteByUserId(userId);
        User user = userRepository.findById(userId).orElseThrow();
        return Optional.of(issueTokens(user, response));
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String raw = readCookie(request, CookieService.REFRESH_COOKIE);
        if (raw != null && !raw.isBlank()) {
            String hash = sha256Hex(raw);
            refreshTokenRepository.findByTokenHash(hash).ifPresent(rt -> {
                rt.setRevokedAt(Instant.now());
                refreshTokenRepository.save(rt);
            });
        }
        cookieService.clearRefreshCookie(response);
    }

    public UserSummary me(UserPrincipal principal) {
        return UserSummary.from(principal.getUser());
    }

    private AuthResponse issueTokens(User user, HttpServletResponse response) {
        String access = jwtService.createAccessToken(user);
        String rawRefresh = newRawRefresh();
        String hash = sha256Hex(rawRefresh);
        Instant exp = Instant.now().plusSeconds(refreshTtlDays * 86_400L);
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(hash)
                .expiresAt(exp)
                .build();
        refreshTokenRepository.save(rt);
        cookieService.addRefreshCookie(response, rawRefresh);
        return new AuthResponse(access, jwtService.getAccessTtlSeconds(), UserSummary.from(user));
    }

    private static String newRawRefresh() {
        byte[] b = new byte[REFRESH_RANDOM_BYTES];
        RANDOM.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }

    private static String sha256Hex(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte x : digest) {
                sb.append(String.format("%02x", x));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie c : cookies) {
            if (name.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }
}
