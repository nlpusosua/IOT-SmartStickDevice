package com.example.IOT_SmartStick.config.security;

import com.example.IOT_SmartStick.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 1. Kiểm tra xem có header "Authorization" không và có bắt đầu bằng "Bearer " không
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Nếu không có thì cho qua
            return;
        }

        // 2. Lấy token từ header (sau chữ "Bearer ")
        jwt = authHeader.substring(7);

        // 3. Trích xuất email (username) từ token
        userEmail = jwtService.extractUsername(jwt);

        // 4. Kiểm tra userEmail và SecurityContextHolder (chưa có ai được xác thực)
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Tải thông tin UserDetails từ database
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 5. Nếu token hợp lệ
            if (jwtService.isTokenValid(jwt, userDetails)) {
                // Tạo một đối tượng Authentication
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // Credentials (password) là null vì đã xác thực bằng token
                        userDetails.getAuthorities() // Quyền
                );

                // Set thêm details cho đối tượng Authentication
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 6. Set Authentication vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        // Chuyển request/response cho filter tiếp theo trong chuỗi
        filterChain.doFilter(request, response);
    }
}
