package com.skr.PixelZone.service;

import com.skr.PixelZone.config.ImageKitProperties;
import com.skr.PixelZone.entity.User;
import com.skr.PixelZone.exception.BadRequestException;
import com.skr.PixelZone.exception.ImageKitUploadException;
import io.imagekit.client.ImageKitClient;
import io.imagekit.errors.ImageKitException;
import io.imagekit.models.assets.AssetListParams;
import io.imagekit.models.assets.AssetListResponse;
import io.imagekit.models.files.FileDeleteParams;
import io.imagekit.models.files.FileUploadParams;
import io.imagekit.models.files.FileUploadResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class ImageKitService {

    private static final int AI_DOWNLOAD_MAX_ATTEMPTS = 12;
    private static final Duration AI_DOWNLOAD_RETRY_DELAY =
            Duration.ofSeconds(3);

    private final ImageKitClient imageKitClient;
    private final ImageKitProperties imageKitProperties;
    private final HttpClient httpClient;

    public ImageKitService(
            ImageKitClient imageKitClient,
            ImageKitProperties imageKitProperties
    ) {
        this.imageKitClient = imageKitClient;
        this.imageKitProperties = imageKitProperties;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public FileUploadResponse uploadPhoto(
            User user,
            MultipartFile file
    ) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Photo file is required"
            );
        }

        try {

            FileUploadParams params = FileUploadParams.builder()
                    .file(file.getBytes())
                    .fileName(resolveFileName(file))
                    .folder(userFolder(user.getId()))
                    .useUniqueFileName(true)
                    .build();

            return imageKitClient.files().upload(params);

        } catch (ImageKitException ex) {

            throw new ImageKitUploadException(
                    "ImageKit upload failed "+
                    ex.getMessage()
            );

        } catch (IOException ex) {

            throw new ImageKitUploadException(
                    "Failed to read upload file "+
                    ex.getMessage()
            );
        }
    }

    public FileUploadResponse uploadBytes(User user, byte[] bytes, String fileName) {
        try{
            FileUploadParams params = FileUploadParams.builder()
                    .file(bytes)
                    .fileName(fileName)
                    .folder(userFolder(user.getId()))
                    .useUniqueFileName(true)
                    .build();

            return imageKitClient.files().upload(params);
        }catch (ImageKitException ex) {
            throw new ImageKitUploadException("ImageKit upload failed: "+ex.getMessage());
        }
    }

    public void deleteFile(String field) {
        try{
            imageKitClient.files().delete(
                    FileDeleteParams.builder()
                            .fileId(field)
                            .build()
            );
        }catch (ImageKitException ex) {
            throw new ImageKitUploadException("ImageKit delete failed: "+ex.getMessage());
        }
    }

    public List<AssetListResponse> listAssetsInFolder(String folderPath, long skip, long limit) {
        try{
            return imageKitClient.assets().list(
                    AssetListParams.builder()
                            .path(folderPath)
                            .skip(skip)
                            .limit(limit)
                            .build()
            );
        }catch (ImageKitException ex) {
            throw new ImageKitUploadException("ImageKit list assets failed: "+ex.getMessage());
        }
    }


    public String buildAiTransformUrl(String sourceUrl, String transformChain) {
        if(sourceUrl == null || sourceUrl.isBlank()) {
            throw new BadRequestException("Source url is required");
        }

        if(transformChain == null || transformChain.isBlank()) {
            return sourceUrl;
        }

        String baseUrl = stripQuery(sourceUrl);
        String cacheBuster = "v=" + System.currentTimeMillis();
        return baseUrl + "?tr=" + transformChain + "&" + cacheBuster;
    }


    public byte[] downloadTransformedImage(String transformUrl) {
        ImageKitUploadException lastError = null;

        for(int i = 0; i < AI_DOWNLOAD_MAX_ATTEMPTS; i++) {
            try {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(transformUrl))
                        .timeout(Duration.ofSeconds(90))
                        .GET()
                        .build();

                HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
                String intermediate = response.headers().firstValue("id-intermediate-response").orElse("false");

                if(intermediate.equals("true")) {
                    sleepBeforeRetry();
                    continue;
                }

                if(response.statusCode() >= 400) {
                    throw new ImageKitUploadException(
                            "Failed to download transformed image,HTTP status code "+response.statusCode()
                    );
                }

                byte[] responseBody = response.body();
                if(responseBody == null ||  responseBody.length == 0) {
                    throw new ImageKitUploadException("Transformed image download returned empty content");
                }

                String contentType = response.headers().firstValue("Content-Type").orElse("");

                if (contentType.contains("text/html")) {
                    sleepBeforeRetry();
                    continue;
                }

                return responseBody;
            }catch (ImageKitUploadException ex) {
                lastError = ex;
                sleepBeforeRetry();
            }catch (IOException | InterruptedException ex) {
                if(ex instanceof InterruptedException) {
                    Thread.currentThread().interrupt();
                }
                lastError = new ImageKitUploadException("Failed to download transformed image: "+ex.getMessage());
                sleepBeforeRetry();
            }
        }

        throw lastError != null
                ? lastError
                : new ImageKitUploadException("Timed out waiting for AI transformation to finish!");
    }

    public String buildThumbnailUrl(String filePath) {
        if(filePath == null || filePath.isBlank()) {
            return filePath;
        }

        String src = filePath.startsWith("/") ? filePath : "/" + filePath;

        return imageKitClient.helper().buildUrl(
                io.imagekit.models.SrcOptions.builder()
                        .urlEndpoint(imageKitProperties.urlEndpoint())
                        .src(src)
                        .addTransformation(
                                io.imagekit.models.Transformation.builder()
                                        .width(400.0)
                                        .height(400.0)
                                        .focus("auto")
                                        .build()
                        )
                        .build()
        );
    }

    public String buildThumbnailUrlFromUrl(String url) {
        if(url == null || url.isBlank()) {
            return url;
        }

        String separator = url.contains("?") ? "&" : "?";
        return url+separator+"tr=w-400,h-400,fa=auto";
    }


    public static String encodePrompt(String prompt) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(prompt.trim().getBytes(StandardCharsets.UTF_8));
    }


    public static String userFolder(UUID userId) {
        return "/users/" + userId;
    }

    private String stripQuery(String url) {
        int queryIndex = url.indexOf('?');
        return queryIndex >= 0 ? url.substring(0, queryIndex) : url;
    }

    private void sleepBeforeRetry() {
        try {
            Thread.sleep(AI_DOWNLOAD_RETRY_DELAY.toMillis());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String resolveFileName(MultipartFile file) {

        String fileName = file.getOriginalFilename();

        if (fileName == null || fileName.isBlank()) {
            throw new BadRequestException("File name is empty");
        }

        return fileName;
    }
}