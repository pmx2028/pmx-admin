package com.paramount.pmx.logging;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.turbo.TurboFilter;
import ch.qos.logback.core.spi.FilterReply;
import org.slf4j.Marker;

import java.util.ArrayList;
import java.util.List;

public class StaticResourceTurboFilter extends TurboFilter {

    private final List<String> excludePrefixes = new ArrayList<>(
            List.of("/static/")
    );
    @Override
    public FilterReply decide(Marker marker, Logger logger, Level level,
                              String format, Object[] params, Throwable t) {

        if (format != null) {
            // 정적 리소스 경로 차단
            for (String prefix : excludePrefixes) {
                if (format.contains(prefix)) {
                    return FilterReply.DENY;
                }
            }
            // Completed 304 환경 차단
            if (format.startsWith("Completed 304")) {
                return FilterReply.DENY;
            }
            // Completed 200/500 등 dev, prod 환경만 차단
            if (format.startsWith("Completed ") && isNotLocal()) {
                return FilterReply.DENY;
            }
        }
        return FilterReply.NEUTRAL;
    }
    // XML 에서 <excludePrefix> 여러 개 주입
    public void addExcludePrefix(String prefix) {
        excludePrefixes.add(prefix);
    }

    private boolean isNotLocal() {
        String profile = System.getProperty("spring.profiles.active", "");
        return !profile.contains("local");
    }
}

