package com.paramount.pmx.specs.lesson;

import com.paramount.pmx.model.apart.Apart;
import com.paramount.pmx.model.lesson.LessonConfirmed;
import io.micrometer.common.util.StringUtils;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;

// 아파트 목록 + 특정 연/월 강습확정 여부를 함께 다루는 Specification.
// 아파트를 기준(root)으로 조회하므로 findAll(spec, pageable)로 페이징/리스트 처리가 가능하다.
public class SearchLessonConfirmedSpec {

    @AllArgsConstructor
    @Getter
    public enum SearchKey {
        ADDRESS_ID_IS("addressId"),
        ADDRESS1_ID_IS("addressId1"),
        NAME_LIKE("name"),
        YEAR_IS("year"),
        MONTH_IS("month"),
        CONFIRMED_IS("confirmed");

        private final String value;
    }

    @AllArgsConstructor
    @Getter
    public enum SortingKey {
        ID("id"),
        NAME("name"),
        CREATED_AT("createdAt"),
        ACTIVATED("activated");

        private final String value;

        public static SortingKey findByValue(String value) {
            if (value == null) return null;
            return Arrays.stream(values())
                    .filter(v -> v.value.equals(value))
                    .findFirst()
                    .orElse(null);
        }
    }

    public static Specification<Apart> createSpecification(Map<String, Object> searchRequest, List<String> defaultSearchParam) {
        for (String str : defaultSearchParam) {
            searchRequest.put(str.split("=")[0], str.split("=")[1]);
        }

        Map<SearchKey, Object> searchKeyword = getValidSearchKey(searchRequest);

        return (root, query, builder) -> {
            List<Predicate> predicate = new ArrayList<>();

            for (SearchKey key : searchKeyword.keySet()) {
                String keyValue = searchKeyword.get(key).toString().trim();

                switch (key) {
                    case ADDRESS_ID_IS:
                        predicate.add(builder.equal(root.get("addressId"), keyValue));
                        break;
                    case ADDRESS1_ID_IS:
                        predicate.add(builder.equal(root.get("addressId1"), keyValue));
                        break;
                    case NAME_LIKE:
                        predicate.add(builder.like(
                                builder.lower(root.get("name")),
                                "%" + keyValue.toLowerCase() + "%"
                        ));
                        break;
                    default:
                        // YEAR_IS, MONTH_IS, CONFIRMED_IS는 아래 서브쿼리에서 함께 처리한다.
                }
            }

            // 확정여부(CONFIRMED_IS)로 필터링하는 경우에만 해당 연/월의 lesson_confirmed를
            // EXISTS 서브쿼리로 검사해 목록을 제한한다.
            // 연/월만 있고 확정여부가 없는 경우는 "표시용 조회"이므로 목록 자체는 제한하지 않는다
            // (강습확정 정보 병합은 서비스단에서 별도 배치 조회로 처리한다).
            String year = toStringValue(searchKeyword.get(SearchKey.YEAR_IS));
            String month = toStringValue(searchKeyword.get(SearchKey.MONTH_IS));
            String confirmed = toStringValue(searchKeyword.get(SearchKey.CONFIRMED_IS));

            if (year != null && month != null && confirmed != null) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<LessonConfirmed> lc = subquery.from(LessonConfirmed.class);
                subquery.select(lc.get("id"));
                subquery.where(builder.and(
                        builder.equal(lc.get("apartId"), root.get("id")),
                        builder.equal(lc.get("year"), year),
                        builder.equal(lc.get("month"), month),
                        builder.equal(lc.get("confirmed"), confirmed)
                ));
                predicate.add(builder.exists(subquery));
            }

            return builder.and(predicate.toArray(new Predicate[0]));
        };
    }

    public static Map<SearchKey, Object> getValidSearchKey(Map<String, Object> searchRequest) {
        final Map<SearchKey, Object> searchKeys = new HashMap<>();
        for (String key : searchRequest.keySet()) {
            try {
                if (!StringUtils.isEmpty((searchRequest.get(key).toString()).replaceAll("\\p{Z}", ""))) {
                    searchKeys.put(SearchKey.valueOf(key.toUpperCase()), searchRequest.get(key));
                }
            } catch (Exception e) {
                // 지정된 key값이 아닌경우 Exception 처리
            }
        }
        return searchKeys;
    }

    public static Sort getValidSortKey(Sort sort) {
        if (sort == null || sort.isUnsorted()) return sort;

        List<Sort.Order> orders = new ArrayList<>();
        for (Sort.Order order : sort) {
            SortingKey key = SortingKey.findByValue(order.getProperty());
            if (key != null) {
                orders.add(new Sort.Order(order.getDirection(), key.getValue()));
            }
        }
        return orders.isEmpty() ? Sort.unsorted() : Sort.by(orders);
    }

    private static String toStringValue(Object value) {
        return value == null ? null : value.toString().trim();
    }
}
