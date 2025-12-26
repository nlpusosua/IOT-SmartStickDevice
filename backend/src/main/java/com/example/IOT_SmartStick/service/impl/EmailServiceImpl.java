package com.example.IOT_SmartStick.service.impl;

import com.example.IOT_SmartStick.entity.User;
import com.example.IOT_SmartStick.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    @Override
    public void sendVerificationEmail(User user, String token) {

//        String verificationUrl = "http://localhost:8080/api/v1/auth/verify?token=" + token;
        String verificationUrl = "http://35.186.148.135:8080/api/v1/auth/verify?token=" + token;

        String recipientEmail = user.getEmail();
        String subject = "Xác thực tài khoản IOT-SmartStick";
        String messageBody = "Chào " + user.getFullName() + ",\n\n"
                + "Cảm ơn bạn đã đăng ký. Vui lòng click vào link dưới đây để kích hoạt tài khoản của bạn:\n"
                + verificationUrl + "\n\n"
                + "Link sẽ hết hạn sau 15 phút.\n\n"
                + "Trân trọng,\n"
                + "Đội ngũ SmartStick.";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientEmail);
        message.setSubject(subject);
        message.setText(messageBody);
        message.setFrom("no-reply@smartstick.com");

        mailSender.send(message);
    }
}
