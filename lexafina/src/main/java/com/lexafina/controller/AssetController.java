package com.lexafina.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Serve local binary assets (audio, image) by UUID.
 * <p>
 * Folder convention (do migrate by hand):
 * - {data-path}/assets/audio/{fileId}.mp3
 * - {data-path}/assets/images/{uuid}.{png|jpg|jpeg|webp}
 * <p>
 * Image fallback: nếu không tồn tại local thì 302 redirect sang CDN YouPass.
 * Audio không có fallback (không tồn tại = 404) vì YouPass CDN không phục vụ audio.
 */
@Slf4j
@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private static final Pattern SAFE_ID = Pattern.compile("^[a-zA-Z0-9_-]{8,64}$");

    private static final List<String> IMAGE_EXTENSIONS = List.of("png", "jpg", "jpeg", "webp");

    private static final String CMS_ASSET_URL = "https://cms.youpass.vn/assets/%s?width=400";

    @Value("${lexafina.data-path}")
    private String dataPath;

    @GetMapping("/audio/{fileId}")
    public ResponseEntity<Resource> getAudio(@PathVariable String fileId) {
        if (!SAFE_ID.matcher(fileId).matches()) {
            log.warn("Invalid audio fileId: {}", fileId);
            return ResponseEntity.badRequest().build();
        }

        Path root = Paths.get(dataPath, "assets", "audio").toAbsolutePath().normalize();
        Path file = root.resolve(fileId + ".mp3").normalize();

        // Defense in depth: regex đã chặn ../ nhưng vẫn double-check phạm vi root
        if (!file.startsWith(root)) {
            log.warn("Path traversal attempt: {}", file);
            return ResponseEntity.badRequest().build();
        }

        if (!Files.exists(file) || !Files.isRegularFile(file)) {
            log.info("Audio not found: {}", file);
            return ResponseEntity.notFound().build();
        }

        log.info("Serving audio: {}", fileId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .body(new FileSystemResource(file));
    }

    @GetMapping("/image/{uuid}")
    public ResponseEntity<Resource> getImage(@PathVariable String uuid) {
        if (!SAFE_ID.matcher(uuid).matches()) {
            log.warn("Invalid image uuid: {}", uuid);
            return ResponseEntity.badRequest().build();
        }

        Path imageDir = Paths.get(dataPath, "assets", "images").toAbsolutePath().normalize();

        for (String ext : IMAGE_EXTENSIONS) {
            Path candidate = imageDir.resolve(uuid + "." + ext).normalize();
            if (!candidate.startsWith(imageDir)) continue;

            if (Files.exists(candidate) && Files.isRegularFile(candidate)) {
                log.info("Serving local image: {}.{}", uuid, ext);
                return ResponseEntity.ok()
                        .contentType(mediaTypeFor(ext))
                        .body(new FileSystemResource(candidate));
            }
        }

        URI cdnUri = URI.create(String.format(CMS_ASSET_URL, uuid));
        log.info("Image not local, redirect to CDN: {}", uuid);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(cdnUri)
                .build();
    }

    private MediaType mediaTypeFor(String ext) {
        return switch (ext.toLowerCase()) {
            case "png" -> MediaType.IMAGE_PNG;
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "webp" -> MediaType.parseMediaType("image/webp");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}
