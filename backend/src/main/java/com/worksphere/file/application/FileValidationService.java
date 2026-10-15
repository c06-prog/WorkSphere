package com.worksphere.file.application;

import com.worksphere.shared.exception.BusinessRuleException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Service responsible for validating file size, extensions, MIME types, and magic bytes.
 * Implements security rules per 06_API_CONTRACT.md section 24 and 04_SYSTEM_ARCHITECTURE.md section 15.
 */
@Service
public class FileValidationService {

    private static final Logger log = LoggerFactory.getLogger(FileValidationService.class);

    public static final long MAX_IMAGE_SIZE = 10L * 1024 * 1024; // 10 MB
    public static final long MAX_DOCUMENT_SIZE = 20L * 1024 * 1024; // 20 MB

    public static final String MIME_JPEG = "image/jpeg";
    public static final String MIME_PNG = "image/png";
    public static final String MIME_WEBP = "image/webp";
    public static final String MIME_PDF = "application/pdf";
    public static final String MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    public static final String MIME_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private static final Map<String, String> EXTENSION_TO_MIME = Map.of(
            "jpg", MIME_JPEG,
            "jpeg", MIME_JPEG,
            "png", MIME_PNG,
            "webp", MIME_WEBP,
            "pdf", MIME_PDF,
            "docx", MIME_DOCX,
            "xlsx", MIME_XLSX
    );

    private static final Set<String> IMAGE_MIMES = Set.of(MIME_JPEG, MIME_PNG, MIME_WEBP);

    // Magic bytes
    private static final byte[] PNG_SIGNATURE = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
    private static final byte[] PDF_SIGNATURE = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D}; // %PDF-
    private static final byte[] ZIP_SIGNATURE = new byte[]{0x50, 0x4B, 0x03, 0x04}; // PK\3\4

    /**
     * Validates file size, extension, MIME type, and magic bytes.
     *
     * @param originalFilename client-reported original filename
     * @param declaredMimeType client-reported MIME type
     * @param sizeBytes actual size of the file in bytes
     * @param headerBytes initial bytes of the file (at least 32 bytes)
     * @param fullStream supplier or stream for deep inspection if required (e.g., Office ZIPs)
     * @return normalized canonical MIME type and extension
     */
    public ValidatedFileAttributes validate(
            String originalFilename,
            String declaredMimeType,
            long sizeBytes,
            byte[] headerBytes,
            InputStream fullStream
    ) {
        // 1. Check size
        if (sizeBytes <= 0) {
            throw new BusinessRuleException("FILE_EMPTY", "Tệp tải lên không được để rỗng");
        }

        // 2. Extract and validate extension
        String extension = extractExtension(originalFilename);
        if (extension == null || !EXTENSION_TO_MIME.containsKey(extension)) {
            throw new BusinessRuleException("FILE_EXTENSION_NOT_ALLOWED", "Định dạng phần mở rộng tệp không được hỗ trợ");
        }

        String canonicalMime = EXTENSION_TO_MIME.get(extension);

        // 3. Check type-specific size limit
        long maxAllowedSize = IMAGE_MIMES.contains(canonicalMime) ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
        if (sizeBytes > maxAllowedSize) {
            throw new BusinessRuleException("FILE_TOO_LARGE",
                    String.format("Dung lượng tệp vượt quá giới hạn cho phép (%d MB)", maxAllowedSize / (1024 * 1024)));
        }

        // 4. Verify magic bytes according to target MIME
        verifyMagicBytes(canonicalMime, headerBytes, fullStream);

        return new ValidatedFileAttributes(canonicalMime, extension);
    }

    public String extractExtension(String filename) {
        if (filename == null) {
            return null;
        }
        int lastDot = filename.lastIndexOf('.');
        if (lastDot < 0 || lastDot == filename.length() - 1) {
            return null;
        }
        return filename.substring(lastDot + 1).toLowerCase(Locale.ROOT).trim();
    }

    private void verifyMagicBytes(String canonicalMime, byte[] header, InputStream fullStream) {
        if (header == null || header.length < 4) {
            throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED", "Nội dung tệp không hợp lệ");
        }

        switch (canonicalMime) {
            case MIME_JPEG -> {
                if ((header[0] & 0xFF) != 0xFF || (header[1] & 0xFF) != 0xD8 || (header[2] & 0xFF) != 0xFF) {
                    throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED", "Tệp JPEG không khớp chữ ký nhị phân hợp lệ");
                }
            }
            case MIME_PNG -> {
                if (header.length < PNG_SIGNATURE.length || !startsWith(header, PNG_SIGNATURE)) {
                    throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED", "Tệp PNG không khớp chữ ký nhị phân hợp lệ");
                }
            }
            case MIME_WEBP -> {
                // RIFF at 0..3 and WEBP at 8..11
                if (header.length < 12) {
                    throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED", "Tệp WEBP không khớp chữ ký nhị phân hợp lệ");
                }
                boolean riff = header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F';
                boolean webp = header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P';
                if (!riff || !webp) {
                    throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED", "Tệp WEBP không khớp chữ ký nhị phân hợp lệ");
                }
            }
            case MIME_PDF -> {
                if (header.length < PDF_SIGNATURE.length || !startsWith(header, PDF_SIGNATURE)) {
                    throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED", "Tệp PDF không khớp chữ ký nhị phân hợp lệ");
                }
            }
            case MIME_DOCX, MIME_XLSX -> {
                if (header.length < ZIP_SIGNATURE.length || !startsWith(header, ZIP_SIGNATURE)) {
                    throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED", "Tệp tài liệu Office không đúng định dạng ZIP OpenXML");
                }
                verifyOfficeZipStructure(canonicalMime, fullStream);
            }
            default -> throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED", "Loại tệp không được hỗ trợ");
        }
    }

    private void verifyOfficeZipStructure(String canonicalMime, InputStream stream) {
        if (stream == null) {
            return;
        }

        boolean hasContentTypes = false;
        boolean hasSpecificFolder = false;
        String requiredPrefix = canonicalMime.equals(MIME_DOCX) ? "word/" : "xl/";

        try (ZipInputStream zis = new ZipInputStream(new BufferedInputStream(stream))) {
            ZipEntry entry;
            int entriesCount = 0;
            while ((entry = zis.getNextEntry()) != null) {
                entriesCount++;
                if (entriesCount > 200) {
                    // Safety limit to avoid zip bomb
                    break;
                }
                String entryName = entry.getName();
                if (entryName.contains("..")) {
                    throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED", "Tệp nén chứa đường dẫn nguy hiểm");
                }
                if ("[Content_Types].xml".equalsIgnoreCase(entryName)) {
                    hasContentTypes = true;
                }
                if (entryName.toLowerCase(Locale.ROOT).startsWith(requiredPrefix)) {
                    hasSpecificFolder = true;
                }
                if (hasContentTypes && hasSpecificFolder) {
                    break;
                }
            }
        } catch (IOException e) {
            log.warn("Failed to inspect Office ZIP structure: {}", e.getMessage());
            throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED", "Tệp tài liệu Office bị hỏng hoặc không hợp lệ");
        }

        if (!hasContentTypes || !hasSpecificFolder) {
            throw new BusinessRuleException("FILE_TYPE_NOT_ALLOWED",
                    "Tệp tài liệu Office thiếu cấu trúc nội dung bắt buộc của OpenXML");
        }
    }

    private boolean startsWith(byte[] array, byte[] prefix) {
        if (array.length < prefix.length) {
            return false;
        }
        for (int i = 0; i < prefix.length; i++) {
            if (array[i] != prefix[i]) {
                return false;
            }
        }
        return true;
    }

    public record ValidatedFileAttributes(String mimeType, String extension) {
    }
}
