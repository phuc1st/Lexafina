package com.lexafina.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;

/**
 * Gắn / xoá cookie refresh (httpOnly, SameSite=Strict).
 */
@Service
public class CookieService {

    public static final String REFRESH_COOKIE = "refresh_token";

    private final boolean secure;
    private final int refreshTtlDays;

    public CookieService(
            @Value("${app.cookie.secure:false}") boolean secure,
            @Value("${app.jwt.refresh-ttl-days:14}") int refreshTtlDays) {
        this.secure = secure;
        this.refreshTtlDays = refreshTtlDays;
    }

    public void addRefreshCookie(HttpServletResponse response, String rawRefreshToken) {
        ResponseCookie c = ResponseCookie.from(REFRESH_COOKIE, rawRefreshToken)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(Duration.ofDays(refreshTtlDays))
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, c.toString());
    }

    public void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie c = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, c.toString());
    }
}
