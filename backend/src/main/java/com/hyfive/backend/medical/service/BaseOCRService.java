package com.hyfive.backend.medical.service;

import com.hyfive.backend.S3Service;
import com.hyfive.backend.medical.dto.ExtractedMedicalRecordDto;
import com.hyfive.backend.medical.dto.MedicalOcrResponseDto;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class BaseOCRService implements OCRService {

    private static final Pattern DATE_PATTERN = Pattern.compile(
            "(20\\d{2}|\\d{2})\\s*[.\\-/년]\\s*(\\d{1,2})\\s*[.\\-/월]\\s*(\\d{1,2})\\s*일?"
    );
    private static final Pattern AMOUNT_PATTERN = Pattern.compile("(\\d{1,3}(?:,\\d{3})+|\\d{4,})(?:\\s*원)?");
    private static final Pattern CLINIC_PATTERN = Pattern.compile(
            "([가-힣A-Za-z0-9\\s]{2,}?(?:동물병원|동물의료센터|동물메디컬센터|메디컬센터|병원))"
    );
    private static final DecimalFormat AMOUNT_FORMAT = new DecimalFormat("#,###");

    private final Tesseract tesseract;
    private final S3Service s3Service;

    public BaseOCRService(
            @Value("${ocr.tesseract.datapath}") String datapath,
            @Value("${ocr.tesseract.language:kor+eng}") String language,
            S3Service s3Service
    ) {
        this.tesseract = new Tesseract();
        this.tesseract.setDatapath(datapath);
        this.tesseract.setLanguage(language);
        this.tesseract.setPageSegMode(6);
        this.tesseract.setOcrEngineMode(1);
        this.tesseract.setTessVariable("user_defined_dpi", "300");
        this.tesseract.setTessVariable("preserve_interword_spaces", "1");
        this.s3Service = s3Service;
    }

    @Override
    public MedicalOcrResponseDto analyze(MultipartFile image) {
        String rawText = runOcr(image);
        ExtractedMedicalRecordDto extracted = extractFields(rawText);

        return new MedicalOcrResponseDto(rawText, extracted, List.of());
    }

    @Override
    public MedicalOcrResponseDto analyzeMedical(String visitDate, String type, List<MultipartFile> images) {
        if (visitDate == null || visitDate.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "진료일자는 필수입니다.");
        }

        if (type == null || type.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "진료 유형은 필수입니다.");
        }

        if (images == null || images.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지는 필수입니다.");
        }

        String rawText = images.stream()
                .map(this::runOcr)
                .collect(Collectors.joining("\n\n"));
        ExtractedMedicalRecordDto extracted = extractFields(rawText, visitDate, type);
        List<String> imageUrls = uploadImages(images);

        return new MedicalOcrResponseDto(rawText, extracted, imageUrls);
    }

    private List<String> uploadImages(List<MultipartFile> images) {
        return images.stream()
                .map(this::uploadImage)
                .toList();
    }

    private String uploadImage(MultipartFile image) {
        try {
            return s3Service.upload(image);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 업로드 중 오류가 발생했습니다.");
        }
    }

    private String runOcr(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지는 필수입니다.");
        }

        Path tempFile = null;
        Path processedFile = null;

        try {
            tempFile = Files.createTempFile("medical-ocr-", getSuffix(image.getOriginalFilename()));
            image.transferTo(tempFile);
            processedFile = preprocessImage(tempFile);

            return tesseract.doOCR(processedFile.toFile()).trim();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지 처리 중 오류가 발생했습니다.");
        } catch (TesseractException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "OCR 분석 중 오류가 발생했습니다.");
        } finally {
            deleteIfExists(processedFile);
            deleteIfExists(tempFile);
        }
    }

    private Path preprocessImage(Path originalFile) throws IOException {
        BufferedImage original = ImageIO.read(originalFile.toFile());
        if (original == null) {
            return originalFile;
        }

        int scale = shouldUpscale(original) ? 2 : 1;
        int width = original.getWidth() * scale;
        int height = original.getHeight() * scale;

        BufferedImage gray = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D graphics = gray.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        graphics.drawImage(original, 0, 0, width, height, null);
        graphics.dispose();

        BufferedImage binary = new BufferedImage(width, height, BufferedImage.TYPE_BYTE_GRAY);
        int threshold = calculateOtsuThreshold(gray);

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int grayValue = gray.getRGB(x, y) & 0xFF;
                int sharpened = grayValue < threshold ? 0 : 255;
                int rgb = (sharpened << 16) | (sharpened << 8) | sharpened;
                binary.setRGB(x, y, rgb);
            }
        }

        Path processedFile = Files.createTempFile("medical-ocr-processed-", ".png");
        ImageIO.write(binary, "png", processedFile.toFile());
        return processedFile;
    }

    private boolean shouldUpscale(BufferedImage image) {
        return Math.max(image.getWidth(), image.getHeight()) < 2200;
    }

    private int calculateOtsuThreshold(BufferedImage image) {
        int[] histogram = new int[256];
        int width = image.getWidth();
        int height = image.getHeight();

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                histogram[image.getRGB(x, y) & 0xFF]++;
            }
        }

        int total = width * height;
        long sum = 0;
        for (int i = 0; i < histogram.length; i++) {
            sum += (long) i * histogram[i];
        }

        long backgroundSum = 0;
        int backgroundWeight = 0;
        double maxVariance = 0;
        int threshold = 170;

        for (int i = 0; i < histogram.length; i++) {
            backgroundWeight += histogram[i];
            if (backgroundWeight == 0) {
                continue;
            }

            int foregroundWeight = total - backgroundWeight;
            if (foregroundWeight == 0) {
                break;
            }

            backgroundSum += (long) i * histogram[i];
            double backgroundMean = (double) backgroundSum / backgroundWeight;
            double foregroundMean = (double) (sum - backgroundSum) / foregroundWeight;
            double variance = (double) backgroundWeight * foregroundWeight
                    * Math.pow(backgroundMean - foregroundMean, 2);

            if (variance > maxVariance) {
                maxVariance = variance;
                threshold = i;
            }
        }

        return threshold;
    }

    private void deleteIfExists(Path path) {
        if (path == null) {
            return;
        }

        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
    }

    private ExtractedMedicalRecordDto extractFields(String rawText) {
        return ExtractedMedicalRecordDto.builder()
                .type(extractType(rawText))
                .clinicName(extractClinicName(rawText))
                .visitDate(extractVisitDate(rawText))
                .diagnosis(extractDiagnosis(rawText))
                .content(extractContent(rawText))
                .totalCost(extractTotalCost(rawText))
                .prescriptions(List.of())
                .build();
    }

    private ExtractedMedicalRecordDto extractFields(String rawText, String visitDate, String type) {
        return ExtractedMedicalRecordDto.builder()
                .type(type.trim().toUpperCase(Locale.ROOT))
                .clinicName(extractClinicName(rawText))
                .visitDate(visitDate.trim())
                .diagnosis(extractDiagnosis(rawText))
                .content(extractContent(rawText))
                .totalCost(extractTotalCost(rawText))
                .prescriptions(List.of())
                .build();
    }

    private String extractType(String rawText) {
        String text = normalizeText(rawText);
        if (text.isBlank()) {
            return "TREATMENT";
        }

        if (containsAny(text, "건강검진", "검진", "혈액검사", "종합검사")) {
            return "CHECKUP";
        }

        if (containsAny(text, "예방접종", "백신", "접종", "광견병", "종합백신")) {
            return "VACCINATION";
        }

        if (containsAny(text, "수술", "마취", "봉합", "절제")) {
            return "SURGERY";
        }

        return "TREATMENT";
    }

    private String extractClinicName(String rawText) {
        for (String line : normalizedLines(rawText)) {
            if (isNoiseLine(line)) {
                continue;
            }

            Matcher matcher = CLINIC_PATTERN.matcher(line);
            if (matcher.find()) {
                return cleanExtractedValue(matcher.group(1));
            }
        }

        Matcher matcher = CLINIC_PATTERN.matcher(normalizeText(rawText));
        return matcher.find() ? cleanExtractedValue(matcher.group(1)) : null;
    }

    private String extractVisitDate(String rawText) {
        String labeled = findLabeledValue(rawText, "진료일", "진료일자", "방문일", "내원일", "결제일", "날짜", "일자");
        String date = normalizeDate(labeled);
        if (date != null) {
            return date;
        }

        Matcher matcher = DATE_PATTERN.matcher(normalizeText(rawText));
        return matcher.find() ? formatDate(matcher) : null;
    }

    private String extractDiagnosis(String rawText) {
        String value = findLabeledValue(rawText, "진단명", "진단", "병명", "상병명", "소견");
        if (value != null) {
            return value;
        }

        return normalizedLines(rawText).stream()
                .filter(line -> containsAny(line, "진단", "소견"))
                .map(this::removeKnownLabel)
                .map(this::cleanExtractedValue)
                .filter(line -> !line.isBlank())
                .findFirst()
                .orElse(null);
    }

    private String extractContent(String rawText) {
        String value = findLabeledValue(rawText, "진료내용", "진료 내역", "처치내용", "처치 내역", "검사내용", "검사 내역");
        if (value != null) {
            return value;
        }

        List<String> candidates = normalizedLines(rawText).stream()
                .filter(line -> !isNoiseLine(line))
                .filter(line -> containsAny(line, "진료", "검사", "처치", "투약", "주사", "접종", "수술", "치료", "상담", "입원", "처방"))
                .map(this::removeKnownLabel)
                .map(this::cleanExtractedValue)
                .filter(line -> line.length() >= 2)
                .distinct()
                .limit(5)
                .toList();

        if (!candidates.isEmpty()) {
            return String.join(" / ", candidates);
        }

        return normalizedLines(rawText).stream()
                .filter(line -> !isNoiseLine(line))
                .filter(line -> line.length() >= 3)
                .limit(3)
                .collect(Collectors.joining(" / "));
    }

    private String extractTotalCost(String rawText) {
        String labeled = findLabeledValue(rawText, "총 결제금액", "결제금액", "청구금액", "수납금액", "합계", "총액", "총 진료비", "진료비 총액");
        Long labeledAmount = parseLargestAmount(labeled);
        if (labeledAmount != null) {
            return AMOUNT_FORMAT.format(labeledAmount);
        }

        Long amount = parseLargestAmount(rawText);
        return amount == null ? null : AMOUNT_FORMAT.format(amount);
    }

    private String findLabeledValue(String rawText, String... labels) {
        List<String> lines = normalizedLines(rawText);

        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            for (String label : labels) {
                int index = line.indexOf(label);
                if (index < 0) {
                    continue;
                }

                String sameLine = cleanExtractedValue(line.substring(index + label.length()));
                if (!sameLine.isBlank()) {
                    return sameLine;
                }

                if (i + 1 < lines.size()) {
                    String nextLine = cleanExtractedValue(lines.get(i + 1));
                    if (!nextLine.isBlank() && !isNoiseLine(nextLine)) {
                        return nextLine;
                    }
                }
            }
        }

        return null;
    }

    private String normalizeDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        Matcher matcher = DATE_PATTERN.matcher(value);
        return matcher.find() ? formatDate(matcher) : null;
    }

    private String formatDate(Matcher matcher) {
        int year = Integer.parseInt(matcher.group(1));
        if (year < 100) {
            year += 2000;
        }

        int month = Integer.parseInt(matcher.group(2));
        int day = Integer.parseInt(matcher.group(3));

        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return null;
        }

        return String.format("%04d-%02d-%02d", year, month, day);
    }

    private Long parseLargestAmount(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        List<Long> amounts = new ArrayList<>();
        Matcher matcher = AMOUNT_PATTERN.matcher(text);
        while (matcher.find()) {
            try {
                long amount = Long.parseLong(matcher.group(1).replace(",", ""));
                if (amount >= 100) {
                    amounts.add(amount);
                }
            } catch (NumberFormatException ignored) {
            }
        }

        return amounts.stream().max(Comparator.naturalOrder()).orElse(null);
    }

    private List<String> normalizedLines(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return List.of();
        }

        return rawText.lines()
                .map(this::cleanExtractedValue)
                .filter(line -> !line.isBlank())
                .toList();
    }

    private String normalizeText(String rawText) {
        if (rawText == null) {
            return "";
        }

        return rawText.replace('\r', '\n').trim();
    }

    private String removeKnownLabel(String value) {
        return value.replaceFirst("^(진료내용|진료 내역|처치내용|처치 내역|검사내용|검사 내역|진단명|진단|병명|상병명|소견)\\s*[:：-]?", "");
    }

    private String cleanExtractedValue(String value) {
        if (value == null) {
            return "";
        }

        return value.replaceAll("[\\t ]+", " ")
                .replaceAll("^[\\s:：\\-=|]+", "")
                .replaceAll("[\\s:：\\-=|]+$", "")
                .trim();
    }

    private boolean isNoiseLine(String line) {
        return containsAny(line,
                "사업자", "대표자", "전화", "TEL", "주소", "영수증", "카드", "승인", "부가세",
                "공급가", "현금", "계좌", "환불", "바코드", "등록번호", "면허", "www", "http"
        );
    }

    private boolean containsAny(String text, String... keywords) {
        if (text == null) {
            return false;
        }

        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    private String getSuffix(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".png";
        }

        String suffix = filename.substring(filename.lastIndexOf(".")).toLowerCase(Locale.ROOT);

        return switch (suffix) {
            case ".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff" -> suffix;
            default -> ".png";
        };
    }
}
