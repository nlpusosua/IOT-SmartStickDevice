package com.example.IOT_SmartStick.config.security;

import com.example.IOT_SmartStick.constant.UserStatus;
import com.example.IOT_SmartStick.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {
    private final User user;
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Trả về danh sách quyền (role) của user
        // Chuyển đổi UserRole enum thành SimpleGrantedAuthority
        return List.of(new SimpleGrantedAuthority(user.getRole().name()));
    }
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        // Chúng ta dùng email làm username
        return user.getEmail();
    }
    @Override
    public boolean isAccountNonExpired() {
        return true; // Bạn có thể thêm logic kiểm tra tài khoản hết hạn
    }

    @Override
    public boolean isAccountNonLocked() {
        // Tài khoản không bị khóa nếu status là ACTIVE
        return user.getStatus() != UserStatus.BANNED;
    }
    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Bạn có thể thêm logic kiểm tra mật khẩu hết hạn
    }

    @Override
    public boolean isEnabled() {
        return user.getStatus() == UserStatus.ACTIVE;
    }
}
