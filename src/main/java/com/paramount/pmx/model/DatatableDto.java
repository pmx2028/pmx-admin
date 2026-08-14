package com.paramount.pmx.model;

import com.paramount.pmx.specs.board.SearchNoteSpec;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Getter
public class DatatableDto {

    private int draw;
    private int start;
    private int length;
    private int pageNumber;
    private Pageable pageable;
    private Sort sort;
    private Map<String, Object> search;

    public DatatableDto(Map<String, Object> params, Sort defaultSort) {
        init(params);
        Sort resolved = resolveSort(params, defaultSort, null);
        this.sort = SearchNoteSpec.getValidSortKey(resolved); // ✅ 기본 필터링 적용
        this.search = extractSearchParams(params);
    }

    // 새 오버로드: 도메인별 Sort 필터 주입 가능
    public DatatableDto(
            Map<String, Object> params,
            Sort defaultSort,
            Function<Sort, Sort> sortFilter
    ) {
        init(params);
        Sort resolved = resolveSort(params, defaultSort, null);

        // 🧩 필터 함수가 있으면 그걸로, 없으면 기본기사 스펙 사용
        this.sort = (sortFilter != null)
                ? sortFilter.apply(resolved)
                : SearchNoteSpec.getValidSortKey(resolved);

        this.search = extractSearchParams(params);
    }

    private void init(Map<String, Object> params) {
        this.draw = parseInt(params.get("draw"), 0);
        this.start = parseInt(params.get("start"), 0);
        this.length = parseInt(params.get("length"), 10);
        // ✅ paging 꺼져서 length가 0 이하일 경우 강제로 1페이지만
        if (this.length <= 0) {
            this.length = 10;  // 원하는 기본 페이지 크기 (예: 10, 20)
        }
        this.pageNumber = start / Math.max(length, 1);
    }

    private Sort resolveSort(Map<String, Object> params, Sort defaultSort, Sort absoluteSort) {
        String dirStr = String.valueOf(params.getOrDefault("order[0][dir]", "desc"));
        Direction direction = "ASC".equalsIgnoreCase(dirStr) ? Direction.ASC : Direction.DESC;

        String columnIdx = String.valueOf(params.getOrDefault("order[0][column]", ""));
        if (StringUtils.isBlank(columnIdx)) {
            return (absoluteSort != null)
                    ? absoluteSort.and(defaultSort)
                    : defaultSort;
        }

        String field = String.valueOf(params.getOrDefault("columns[" + columnIdx + "][data]", "createdAt"));
        if (StringUtils.isBlank(field)) {
            return (absoluteSort != null)
                    ? absoluteSort.and(defaultSort)
                    : defaultSort;
        }

        Sort orderSort = Sort.by(direction, field);

        return (absoluteSort != null)
                ? absoluteSort.and(orderSort)
                : orderSort;
    }

    private int parseInt(Object value, int defaultValue) {
        String str = String.valueOf(value);
        return NumberUtils.isCreatable(str) ? Integer.parseInt(str) : defaultValue;
    }

    private Map<String, Object> extractSearchParams(Map<String, Object> params) {
        Map<String, Object> result = new HashMap<>();
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            String key = entry.getKey();
            if (key.startsWith("search_")) {
                String strippedKey = key.replaceFirst("search_", "");
                result.put(strippedKey, entry.getValue());
            }
        }
        return result;
    }

    public Pageable getPageable() {
        // ✅ sort가 null일 경우 안전하게 Sort.unsorted()로 대체
        Sort safeSort = (this.sort != null) ? this.sort : Sort.unsorted();
        return PageRequest.of(pageNumber, length, safeSort);
    }
}
