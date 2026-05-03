package com.lexafina.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    /** Thời hạn access token (giây) */
    private long expiresIn;
    private UserSummary user;
}
