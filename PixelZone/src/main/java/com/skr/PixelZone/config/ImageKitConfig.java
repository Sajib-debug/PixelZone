package com.skr.PixelZone.config;

import io.imagekit.client.ImageKitClient;
import io.imagekit.client.okhttp.ImageKitOkHttpClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(ImageKitProperties.class)
public class ImageKitConfig {

    @Bean
    ImageKitClient imageKitClient(ImageKitProperties properties) {

        if (!properties.isConfigured()) {
            throw new IllegalStateException(
                    "ImageKit properties are not configured! " +
                            "Set IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL"
            );
        }

        return ImageKitOkHttpClient.builder()
                .privateKey(properties.privateKey())
                .build();
    }
}