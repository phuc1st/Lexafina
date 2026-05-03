package com.lexafina.auth.dto;

import com.lexafina.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummary {

    private Long id;
    private String username;
    private String email;

    public static UserSummary from(User u) {
        return new UserSummary(u.getId(), u.getUsername(), u.getEmail());
    }
}
