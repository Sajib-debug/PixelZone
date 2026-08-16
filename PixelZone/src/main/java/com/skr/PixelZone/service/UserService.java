package com.skr.PixelZone.service;

import com.skr.PixelZone.dto.UserResponse;
import com.skr.PixelZone.entity.User;
import com.skr.PixelZone.exception.UnauthorizedException;
import com.skr.PixelZone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(()->new UnauthorizedException("User not Found!"));
    }

    public UserResponse getUserResponseByEmail(String email) {
        return toUserResponse(getByEmail(email));
    }

    public Optional<String> findEmailById(UUID userId) {
        return userRepository.findById(userId).map(User::getEmail);
    }

    public boolean existsById(UUID userId) {
        return userRepository.existsById(userId);
    }

    public UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(),user.getEmail(),user.getDisplayName());
    }

}
