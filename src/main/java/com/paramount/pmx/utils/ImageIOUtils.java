package com.paramount.pmx.utils;

import com.twelvemonkeys.imageio.metadata.CompoundDirectory;
import com.twelvemonkeys.imageio.metadata.Directory;
import com.twelvemonkeys.imageio.metadata.Entry;
import com.twelvemonkeys.imageio.metadata.exif.EXIFReader;
import com.twelvemonkeys.imageio.metadata.jpeg.JPEG;
import com.twelvemonkeys.imageio.metadata.jpeg.JPEGSegment;
import com.twelvemonkeys.imageio.metadata.jpeg.JPEGSegmentUtil;
import com.twelvemonkeys.imageio.metadata.tiff.TIFF;
import org.opencv.core.CvType;
import org.opencv.core.Mat;

import javax.imageio.*;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import javax.imageio.stream.MemoryCacheImageInputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class ImageIOUtils {
    private ImageIOUtils(){}

    public static BufferedImage readToBufferedImage(byte[] bytes) throws Exception {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
        if (image == null) {
            return null;
        }

        int orientation = readExifOrientation(bytes);
        if (orientation == 1) {
            return image;
        }

        return applyExifOrientation(image, orientation);
    }

    public static byte[] writeJpeg(BufferedImage img, float quality) throws Exception {
        // 1) JPEG에 안전한 RGB로 변환 (알파/CMYK/커스텀 색공간 제거)
        BufferedImage rgb = toJpegCompatibleRgb(img);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ImageOutputStream ios = ImageIO.createImageOutputStream(baos)) {

            ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
            try {
                writer.setOutput(ios);

                ImageWriteParam params = writer.getDefaultWriteParam();
                if (params.canWriteCompressed()) {
                    params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                    params.setCompressionQuality(Math.max(0f, Math.min(1f, quality)));
                }

                writer.write(null, new IIOImage(rgb, null, null), params);
            } finally {
                writer.dispose();
            }

            return baos.toByteArray();
        }
    }

    public static Mat toMatBGR(BufferedImage img) {
        if (img == null) throw new IllegalArgumentException("BufferedImage is null");

        final int w = img.getWidth(), h = img.getHeight();

        // 0) 초대형 이미지 선축소(옵션)
        final long maxPixels = 25_000_000L; // 25MP
        BufferedImage src = img;
        if ((long) w * h > maxPixels) {
            double scale = Math.sqrt(maxPixels / ((double) w * h));
            int tw = Math.max(1, (int) Math.round(w * scale));
            int th = Math.max(1, (int) Math.round(h * scale));
            Image scaled = img.getScaledInstance(tw, th, Image.SCALE_SMOOTH);
            BufferedImage tmp = new BufferedImage(tw, th, BufferedImage.TYPE_INT_RGB);
            var g = tmp.createGraphics();
            g.drawImage(scaled, 0, 0, null);
            g.dispose();
            src = tmp;
        }

        final int W = src.getWidth(), H = src.getHeight();
        int[] rgb = new int[W * H];
        // 1) 항상 안전한 경로: INT(ARGB/RGB) 픽셀을 뽑아온다.
        src.getRGB(0, 0, W, H, rgb, 0, W);

        // 2) ARGB → BGR 바이트로 변환
        byte[] bgr = new byte[W * H * 3];
        int bi = 0;
        for (int i = 0; i < rgb.length; i++) {
            int p = rgb[i];
            bgr[bi++] = (byte) (p       & 0xFF);       // B
            bgr[bi++] = (byte) ((p>>>8) & 0xFF);       // G
            bgr[bi++] = (byte) ((p>>>16)& 0xFF);       // R
        }

        // 3) Mat 구성
        Mat mat = new Mat(H, W, CvType.CV_8UC3);
        mat.put(0, 0, bgr);
        return mat;
    }

    public static BufferedImage crop(BufferedImage src, Rectangle r) {
        return src.getSubimage(r.x, r.y, r.width, r.height);
    }

    public static BufferedImage resizeKeepRatio(BufferedImage src, int targetWidth) {
        int w = src.getWidth(), h = src.getHeight();
        if (targetWidth >= w) return src; // 업스케일 방지

        int th = (int) Math.round(h * (targetWidth / (double) w));
        Image scaled = src.getScaledInstance(targetWidth, th, Image.SCALE_SMOOTH);

        int type = targetBufferedImageType(src);
        BufferedImage out = new BufferedImage(targetWidth, th, type);
        Graphics2D g = out.createGraphics();

        g.setComposite(AlphaComposite.Src);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        g.drawImage(scaled, 0, 0, null);
        g.dispose();
        return out;
    }

    public static BufferedImage resizeExact(BufferedImage src, int width, int height) {
        Image scaled = src.getScaledInstance(width, height, Image.SCALE_SMOOTH);

        int type = targetBufferedImageType(src);
        BufferedImage out = new BufferedImage(width, height, type);
        Graphics2D g = out.createGraphics();

        g.setComposite(AlphaComposite.Src);
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        g.drawImage(scaled, 0, 0, null);
        g.dispose();
        return out;
    }

    public static String sanitizeFilename(String name) {
        String n = name.replace("\\", "/");
        n = n.substring(n.lastIndexOf('/') + 1);
        n = n.replaceAll("[\\r\\n\\t]", "_");
        n = n.replaceAll("[^A-Za-z0-9._-]", "_");
        if (n.isBlank()) n = "upload";
        return n;
    }

    public static String extOf(String name) {
        int dot = name.lastIndexOf('.');
        return (dot >= 0 ? name.substring(dot).toLowerCase() : "");
    }

    public static String baseOf(String name) {
        int dot = name.lastIndexOf('.');
        return (dot >= 0 ? name.substring(0, dot) : name);
    }

    public static String contentTypeOfExt(String ext) {
        return switch (ext) {
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".png" -> "image/png";
            case ".gif" -> "image/gif";
            case ".webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }

    /** 확장자에 맞춰 저장. 미지원 확장자는 JPEG로 폴백 */
    public static byte[] writeByExt(BufferedImage img, String ext, float jpegQuality) throws Exception {
        switch (ext) {
            case ".jpg":
            case ".jpeg":
                return writeJpeg(img, jpegQuality);

            case ".png": {
                BufferedImage toWrite = img;
                // PNG는 알파 지원 → 필요하면 ARGB로 변환
                if (!img.getColorModel().hasAlpha() || img.getType() != BufferedImage.TYPE_INT_ARGB) {
                    BufferedImage argb = new BufferedImage(img.getWidth(), img.getHeight(), BufferedImage.TYPE_INT_ARGB);
                    Graphics2D g = argb.createGraphics();
                    g.setComposite(AlphaComposite.Src);
                    g.drawImage(img, 0, 0, null);
                    g.dispose();
                    toWrite = argb;
                }
                var baos = new ByteArrayOutputStream();
                ImageIO.write(toWrite, "png", baos);
                return baos.toByteArray();
            }

            case ".gif": {
                var baos = new ByteArrayOutputStream();
                ImageIO.write(img, "gif", baos);
                return baos.toByteArray();
            }

            case ".webp": {
                // WebP 플러그인이 없다면 JPEG 폴백
                try {
                    var baos = new ByteArrayOutputStream();
                    ImageIO.write(img, "webp", baos);
                    return baos.toByteArray();
                } catch (Throwable ignore) {
                    return writeJpeg(img, jpegQuality);
                }
            }
            default:
                return writeJpeg(img, jpegQuality);
        }
    }

    public static int frameCountOf(byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            return 1;
        }

        try (ImageInputStream stream = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            if (stream == null) {
                return 1;
            }

            var readers = ImageIO.getImageReaders(stream);
            if (!readers.hasNext()) {
                return 1;
            }

            ImageReader reader = readers.next();
            try {
                reader.setInput(stream, false, false);
                return Math.max(1, reader.getNumImages(true));
            } finally {
                reader.dispose();
            }
        } catch (IOException | RuntimeException ignored) {
            return 1;
        }
    }

    public static String dimStr(BufferedImage img){ return img.getWidth() + "x" + img.getHeight(); }

    public static String shape(int w, int h){
        if (w == h) return "square";
        if (w > h)  return (w / (double)h < 1.3) ? "wide-square" : "wide";
        return (h / (double)w < 1.3) ? "narrow-square" : "narrow";
    }

    /** 평균색 기반 대표색(= 1x1 축소와 동일) */
    public static Map<String,Object> dominantColor(BufferedImage src){
        int tw = 1, th = 1;
        Image scaled = src.getScaledInstance(tw, th, Image.SCALE_AREA_AVERAGING);
        BufferedImage one = new BufferedImage(tw, th, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = one.createGraphics();
        g.drawImage(scaled, 0, 0, null); g.dispose();
        int rgb = one.getRGB(0,0);
        int r=(rgb>>16)&0xFF, g8=(rgb>>8)&0xFF, b=rgb&0xFF;

        String hex = String.format("%02X%02X%02X", r,g8,b);
        // HSV
        float[] hsv = Color.RGBtoHSB(r, g8, b, null);
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("hex", hex);
        m.put("rgb", Arrays.asList(r,g8,b));
        m.put("hsv", Arrays.asList(
                (double)Math.round(hsv[0]*3600)/10.0,            // H(도)
                (double)Math.round(hsv[1]*100000)/1000.0,        // S(%)
                (double)Math.round(hsv[2]*100000)/1000.0         // V(%)
        ));
        return m;
    }

    private static int targetBufferedImageType(BufferedImage src) {
        // 알파 있으면 ARGB, 없으면 기존처럼 BGR
        return src.getColorModel().hasAlpha()
                ? BufferedImage.TYPE_INT_ARGB
                : BufferedImage.TYPE_3BYTE_BGR;
    }
    private static BufferedImage toJpegCompatibleRgb(BufferedImage src) {
        // TYPE_3BYTE_BGR은 JPEG writer가 가장 무난하게 처리함
        BufferedImage dst = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_3BYTE_BGR);
        Graphics2D g = dst.createGraphics();
        try {
            g.setComposite(AlphaComposite.Src);

            // PNG 투명 등 알파가 있으면 배경색 깔기 (원하면 BLACK 등으로 변경)
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, dst.getWidth(), dst.getHeight());

            g.drawImage(src, 0, 0, null);
        } finally {
            g.dispose();
        }
        return dst;
    }
    private static int readExifOrientation(byte[] bytes) {
        if (!isJpeg(bytes)) {
            return 1;
        }

        try (ImageInputStream jpegStream = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            if (jpegStream == null) {
                return 1;
            }

            List<JPEGSegment> exifSegments = JPEGSegmentUtil.readSegments(jpegStream, JPEG.APP1, "Exif");
            if (exifSegments.isEmpty()) {
                return 1;
            }

            JPEGSegment exifSegment = exifSegments.get(0);
            try (var segmentStream = exifSegment.segmentData()) {
                if (segmentStream == null) {
                    return 1;
                }
                segmentStream.skipNBytes(6);
                try (ImageInputStream exifStream = new MemoryCacheImageInputStream(segmentStream)) {
                    Directory exifDirectory = new EXIFReader().read(exifStream);
                    int orientation = extractOrientation(exifDirectory);
                    return isSupportedExifOrientation(orientation) ? orientation : 1;
                }
            }
        } catch (IOException | RuntimeException ignored) {
            return 1;
        }
    }

    private static int extractOrientation(Directory directory) {
        if (directory == null) {
            return 1;
        }

        Entry orientationEntry = directory.getEntryById(TIFF.TAG_ORIENTATION);
        if (orientationEntry != null) {
            return parseOrientationValue(orientationEntry.getValue());
        }

        if (directory instanceof CompoundDirectory compoundDirectory) {
            for (int i = 0; i < compoundDirectory.directoryCount(); i++) {
                int orientation = extractOrientation(compoundDirectory.getDirectory(i));
                if (orientation != 1) {
                    return orientation;
                }
            }
        }

        return 1;
    }

    private static int parseOrientationValue(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof short[] values && values.length > 0) {
            return values[0];
        }
        if (value instanceof int[] values && values.length > 0) {
            return values[0];
        }
        if (value instanceof long[] values && values.length > 0) {
            return (int) values[0];
        }
        if (value instanceof String text) {
            try {
                return Integer.parseInt(text.trim());
            } catch (NumberFormatException ignored) {
                return 1;
            }
        }

        return 1;
    }

    private static boolean isSupportedExifOrientation(int orientation) {
        return orientation >= 2 && orientation <= 8;
    }

    private static boolean isJpeg(byte[] bytes) {
        return bytes != null
                && bytes.length >= 2
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8;
    }

    private static BufferedImage applyExifOrientation(BufferedImage src, int orientation) {
        int srcWidth = src.getWidth();
        int srcHeight = src.getHeight();
        boolean swapAxes = orientation >= 5 && orientation <= 8;
        int destWidth = swapAxes ? srcHeight : srcWidth;
        int destHeight = swapAxes ? srcWidth : srcHeight;

        int[] srcPixels = src.getRGB(0, 0, srcWidth, srcHeight, null, 0, srcWidth);
        int[] destPixels = new int[destWidth * destHeight];

        for (int y = 0; y < srcHeight; y++) {
            for (int x = 0; x < srcWidth; x++) {
                int dx;
                int dy;

                switch (orientation) {
                    case 2 -> {
                        dx = srcWidth - 1 - x;
                        dy = y;
                    }
                    case 3 -> {
                        dx = srcWidth - 1 - x;
                        dy = srcHeight - 1 - y;
                    }
                    case 4 -> {
                        dx = x;
                        dy = srcHeight - 1 - y;
                    }
                    case 5 -> {
                        dx = y;
                        dy = x;
                    }
                    case 6 -> {
                        dx = srcHeight - 1 - y;
                        dy = x;
                    }
                    case 7 -> {
                        dx = srcHeight - 1 - y;
                        dy = srcWidth - 1 - x;
                    }
                    case 8 -> {
                        dx = y;
                        dy = srcWidth - 1 - x;
                    }
                    default -> {
                        dx = x;
                        dy = y;
                    }
                }

                destPixels[dy * destWidth + dx] = srcPixels[y * srcWidth + x];
            }
        }

        BufferedImage dest = new BufferedImage(destWidth, destHeight, targetBufferedImageType(src));
        dest.setRGB(0, 0, destWidth, destHeight, destPixels, 0, destWidth);
        return dest;
    }
}
