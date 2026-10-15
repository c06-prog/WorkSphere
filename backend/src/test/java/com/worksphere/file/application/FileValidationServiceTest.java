package com.worksphere.file.application;

import com.worksphere.shared.exception.BusinessRuleException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileValidationServiceTest {

    private FileValidationService validationService;

    @BeforeEach
    void setUp() {
        validationService = new FileValidationService();
    }

    @Test
    @DisplayName("Validates valid JPEG file")
    void shouldValidateValidJpeg() {
        byte[] header = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0, 0, 0};
        var result = validationService.validate("photo.jpg", "image/jpeg", 5000L, header, new ByteArrayInputStream(header));

        assertThat(result.mimeType()).isEqualTo("image/jpeg");
        assertThat(result.extension()).isEqualTo("jpg");
    }

    @Test
    @DisplayName("Validates valid PNG file")
    void shouldValidateValidPng() {
        byte[] header = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0};
        var result = validationService.validate("image.png", "image/png", 10000L, header, new ByteArrayInputStream(header));

        assertThat(result.mimeType()).isEqualTo("image/png");
        assertThat(result.extension()).isEqualTo("png");
    }

    @Test
    @DisplayName("Validates valid WEBP file")
    void shouldValidateValidWebp() {
        byte[] header = new byte[]{
                'R', 'I', 'F', 'F',
                0, 0, 0, 0,
                'W', 'E', 'B', 'P',
                0, 0, 0, 0
        };
        var result = validationService.validate("banner.webp", "image/webp", 2000L, header, new ByteArrayInputStream(header));

        assertThat(result.mimeType()).isEqualTo("image/webp");
        assertThat(result.extension()).isEqualTo("webp");
    }

    @Test
    @DisplayName("Validates valid PDF file")
    void shouldValidateValidPdf() {
        byte[] header = "%PDF-1.7 header".getBytes(StandardCharsets.US_ASCII);
        var result = validationService.validate("document.pdf", "application/pdf", 1024L, header, new ByteArrayInputStream(header));

        assertThat(result.mimeType()).isEqualTo("application/pdf");
        assertThat(result.extension()).isEqualTo("pdf");
    }

    @Test
    @DisplayName("Validates valid DOCX file with [Content_Types].xml and word/ entry")
    void shouldValidateValidDocx() throws IOException {
        byte[] docxBytes = createOfficeZip("[Content_Types].xml", "word/document.xml");
        byte[] header = new byte[32];
        System.arraycopy(docxBytes, 0, header, 0, Math.min(docxBytes.length, 32));

        var result = validationService.validate(
                "report.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                docxBytes.length,
                header,
                new ByteArrayInputStream(docxBytes)
        );

        assertThat(result.mimeType()).isEqualTo("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        assertThat(result.extension()).isEqualTo("docx");
    }

    @Test
    @DisplayName("Validates valid XLSX file with [Content_Types].xml and xl/ entry")
    void shouldValidateValidXlsx() throws IOException {
        byte[] xlsxBytes = createOfficeZip("[Content_Types].xml", "xl/workbook.xml");
        byte[] header = new byte[32];
        System.arraycopy(xlsxBytes, 0, header, 0, Math.min(xlsxBytes.length, 32));

        var result = validationService.validate(
                "sheet.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                xlsxBytes.length,
                header,
                new ByteArrayInputStream(xlsxBytes)
        );

        assertThat(result.mimeType()).isEqualTo("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        assertThat(result.extension()).isEqualTo("xlsx");
    }

    @Test
    @DisplayName("Rejects empty file with FILE_EMPTY")
    void shouldRejectEmptyFile() {
        byte[] empty = new byte[0];
        assertThatThrownBy(() -> validationService.validate("test.pdf", "application/pdf", 0L, empty, new ByteArrayInputStream(empty)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Tệp tải lên không được để rỗng");
    }

    @Test
    @DisplayName("Rejects image exceeding 10MB limit with FILE_TOO_LARGE")
    void shouldRejectImageOver10Mb() {
        byte[] header = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0};
        long overLimit = 10L * 1024 * 1024 + 1;

        assertThatThrownBy(() -> validationService.validate("huge.jpg", "image/jpeg", overLimit, header, new ByteArrayInputStream(header)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Dung lượng tệp vượt quá giới hạn cho phép");
    }

    @Test
    @DisplayName("Rejects document exceeding 20MB limit with FILE_TOO_LARGE")
    void shouldRejectDocumentOver20Mb() {
        byte[] header = "%PDF-1.5".getBytes(StandardCharsets.US_ASCII);
        long overLimit = 20L * 1024 * 1024 + 1;

        assertThatThrownBy(() -> validationService.validate("huge.pdf", "application/pdf", overLimit, header, new ByteArrayInputStream(header)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Dung lượng tệp vượt quá giới hạn cho phép");
    }

    @Test
    @DisplayName("Rejects unsupported extension with FILE_EXTENSION_NOT_ALLOWED")
    void shouldRejectDisallowedExtension() {
        byte[] header = new byte[]{0x4D, 0x5A}; // MZ executable
        assertThatThrownBy(() -> validationService.validate("program.exe", "application/octet-stream", 100L, header, new ByteArrayInputStream(header)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Định dạng phần mở rộng tệp không được hỗ trợ");
    }

    @Test
    @DisplayName("Rejects signature spoofing (JPEG extension with invalid header)")
    void shouldRejectMimeSpoofing() {
        byte[] spoofHeader = "NOT A JPEG".getBytes(StandardCharsets.US_ASCII);
        assertThatThrownBy(() -> validationService.validate("fake.jpg", "image/jpeg", 500L, spoofHeader, new ByteArrayInputStream(spoofHeader)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Tệp JPEG không khớp chữ ký");
    }

    @Test
    @DisplayName("Rejects Office ZIP missing word/ entry")
    void shouldRejectDocxMissingWordEntry() throws IOException {
        byte[] invalidDocx = createOfficeZip("[Content_Types].xml", "other/doc.xml");
        byte[] header = new byte[32];
        System.arraycopy(invalidDocx, 0, header, 0, Math.min(invalidDocx.length, 32));

        assertThatThrownBy(() -> validationService.validate(
                "invalid.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                invalidDocx.length,
                header,
                new ByteArrayInputStream(invalidDocx)
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Tệp tài liệu Office thiếu cấu trúc nội dung bắt buộc của OpenXML");
    }

    @Test
    @DisplayName("Rejects Office ZIP with path traversal entry")
    void shouldRejectOfficeZipWithPathTraversal() throws IOException {
        byte[] evilZip = createOfficeZip("[Content_Types].xml", "word/../evil.txt");
        byte[] header = new byte[32];
        System.arraycopy(evilZip, 0, header, 0, Math.min(evilZip.length, 32));

        assertThatThrownBy(() -> validationService.validate(
                "evil.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                evilZip.length,
                header,
                new ByteArrayInputStream(evilZip)
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Tệp nén chứa đường dẫn nguy hiểm");
    }

    @Test
    @DisplayName("Rejects Office ZIP exceeding entry count limit (zip bomb defense)")
    void shouldRejectOfficeZipExceedingEntryCount() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            ZipEntry ct = new ZipEntry("[Content_Types].xml");
            zos.putNextEntry(ct);
            zos.write("<Types/>".getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            ZipEntry wd = new ZipEntry("word/document.xml");
            zos.putNextEntry(wd);
            zos.write("<document/>".getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            // Add entries exceeding MAX_ZIP_ENTRIES (200)
            for (int i = 0; i < 205; i++) {
                ZipEntry entry = new ZipEntry("word/part" + i + ".xml");
                zos.putNextEntry(entry);
                zos.write("part".getBytes(StandardCharsets.UTF_8));
                zos.closeEntry();
            }
        }
        byte[] zipBytes = baos.toByteArray();
        byte[] header = new byte[32];
        System.arraycopy(zipBytes, 0, header, 0, 32);

        assertThatThrownBy(() -> validationService.validate(
                "bomb.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                zipBytes.length,
                header,
                new ByteArrayInputStream(zipBytes)
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Số lượng entry trong tệp nén vượt quá giới hạn an toàn");
    }

    @Test
    @DisplayName("Rejects Office ZIP with entry declaring excessive uncompressed size")
    void shouldRejectOfficeZipWithOversizedEntry() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] filename = "word/document.xml".getBytes(StandardCharsets.UTF_8);
        byte[] header = new byte[]{
                0x50, 0x4B, 0x03, 0x04, // signature
                0x14, 0x00,             // version 20
                0x00, 0x00,             // flags (no data descriptor)
                0x08, 0x00,             // method DEFLATE
                0x00, 0x00, 0x00, 0x00, // time
                0x12, 0x34, 0x56, 0x78, // crc
                0x64, 0x00, 0x00, 0x00, // compressed size = 100
                0x00, 0x00, 0x40, 0x03, // uncompressed size = 54,525,952 (~52 MB)
                (byte) filename.length, 0x00, // filename length
                0x00, 0x00              // extra length
        };
        baos.writeBytes(header);
        baos.writeBytes(filename);
        baos.writeBytes(new byte[100]); // dummy compressed payload

        byte[] zipBytes = baos.toByteArray();
        byte[] first32 = new byte[32];
        System.arraycopy(zipBytes, 0, first32, 0, 32);

        assertThatThrownBy(() -> validationService.validate(
                "huge.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                zipBytes.length,
                first32,
                new ByteArrayInputStream(zipBytes)
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Kích thước giải nén của entry vượt quá giới hạn an toàn");
    }

    @Test
    @DisplayName("Rejects Office ZIP with suspicious compression ratio")
    void shouldRejectOfficeZipWithSuspiciousCompressionRatio() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            ZipEntry ct = new ZipEntry("[Content_Types].xml");
            zos.putNextEntry(ct);
            zos.write("<Types/>".getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            ZipEntry wd = new ZipEntry("word/ratio.xml");
            zos.putNextEntry(wd);
            byte[] zeroes = new byte[65536];
            for (int i = 0; i < 35; i++) {
                zos.write(zeroes);
            }
            zos.closeEntry();
        }
        byte[] zipBytes = baos.toByteArray();
        byte[] header = new byte[32];
        System.arraycopy(zipBytes, 0, header, 0, 32);

        assertThatThrownBy(() -> validationService.validate(
                "ratio.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                zipBytes.length,
                header,
                new ByteArrayInputStream(zipBytes)
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Tỷ lệ nén của tệp vượt ngưỡng an toàn");
    }

    @Test
    @DisplayName("Rejects corrupt Office ZIP archive")
    void shouldRejectCorruptOfficeZip() {
        byte[] corruptZip = new byte[]{0x50, 0x4B, 0x03, 0x04, 0x00, 0x00, 0x08, 0x00, (byte) 0xFF, (byte) 0xFF, 0x12, 0x34};
        byte[] header = new byte[corruptZip.length];
        System.arraycopy(corruptZip, 0, header, 0, corruptZip.length);

        assertThatThrownBy(() -> validationService.validate(
                "corrupt.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                corruptZip.length,
                header,
                new ByteArrayInputStream(corruptZip)
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Tệp tài liệu Office");
    }

    @Test
    @DisplayName("Rejects DOCX archive that contains XLSX entries (xl/)")
    void shouldRejectDocxWithXlsxEntries() throws IOException {
        byte[] mixedZip = createOfficeZip("[Content_Types].xml", "word/document.xml", "xl/workbook.xml");
        byte[] header = new byte[32];
        System.arraycopy(mixedZip, 0, header, 0, 32);

        assertThatThrownBy(() -> validationService.validate(
                "mixed.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                mixedZip.length,
                header,
                new ByteArrayInputStream(mixedZip)
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Cấu trúc tệp không khớp định dạng tài liệu được khai báo");
    }

    private byte[] createOfficeZip(String... entries) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            for (String entryName : entries) {
                ZipEntry entry = new ZipEntry(entryName);
                zos.putNextEntry(entry);
                zos.write("dummy-data".getBytes(StandardCharsets.UTF_8));
                zos.closeEntry();
            }
        }
        return baos.toByteArray();
    }
}
