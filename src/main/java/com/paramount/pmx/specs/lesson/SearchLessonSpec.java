package com.paramount.pmx.specs.lesson;

import com.paramount.pmx.model.apart.ApartUser;
import com.paramount.pmx.model.lesson.Lesson;
import io.micrometer.common.util.StringUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;

public class SearchLessonSpec {

    @AllArgsConstructor
    @Getter
    public enum SearchKey {
        YEAR_IS("year"),
        MONTH_IS("month"),
        APART_ID_IS("apartId"),
        USER_ID_IS("userId"),
        CATEGORY_ID_IS("categoryId"),
        CATEGORY_ID1_IS("categoryId1"),
        ACTIVATED_IS("activated");
        private final String value;
    }

    @AllArgsConstructor
    @Getter
    public enum SortingKey {
        ID("id"),
        YEAR_IS("year"),
        MONTH_IS("month"),
        WEEKDAY_CODE_IS("weekdayCode"),
        TIME_CODE_IS("timeCode"),
        APART_ID("apartId"),
        USER_ID("userId"),
        CATEGORY_ID("categoryId"),
        CATEGORY_ID1("categoryId1"),
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

    public static Specification<Lesson> createSpecification(Map<String, Object> searchRequest, List<String> defaultSearchParam) {
        for (String str : defaultSearchParam) {
            searchRequest.put(str.split("=")[0], str.split("=")[1]);
        }

        String fieldName = "searchfield";
        String keywordName = "searchkeyword";
        Map<String, Object> additionRequest = new HashMap<>();
        for (String key : searchRequest.keySet()) {
            if (key.startsWith(fieldName)) {
                String keyNumber = key.substring(fieldName.length());

                if (StringUtils.isNotEmpty((String) searchRequest.get(keywordName + keyNumber))) {
                    additionRequest.put((String) searchRequest.get(key), (String) searchRequest.get(keywordName + keyNumber));
                }
            }
        }
        searchRequest.putAll(additionRequest);

        Map<SearchKey, Object> searchKeyword = getValidSearchKey(searchRequest);
        return (root, query, builder) -> {
            List<Predicate> predicate = new ArrayList<>();
            for (SearchKey key : searchKeyword.keySet()) {
                String keyValue = searchKeyword.get(key).toString().trim();

                switch (key) {
                    case YEAR_IS:
                        predicate.add(builder.equal(root.get("year"), keyValue));
                        break;
                    case MONTH_IS:
                        predicate.add(builder.equal(root.get("month"), keyValue));
                        break;
                    case APART_ID_IS:
                        predicate.add(builder.equal(root.get("apartId"), keyValue));
                        break;
                    case USER_ID_IS:
                        predicate.add(builder.equal(root.get("userId"), keyValue));
                        break;

                    case CATEGORY_ID_IS:
                        // 콤마로 여러 categoryId가 넘어올 수 있음 (예: GX/트니트니 탭 = "1,4")
                        List<Long> categoryIds = Arrays.stream(keyValue.split(","))
                                .map(String::trim)
                                .filter(v -> !v.isEmpty())
                                .map(Long::valueOf)
                                .toList();
                        if (categoryIds.size() == 1) {
                            predicate.add(builder.equal(root.get("categoryId"), categoryIds.get(0)));
                        } else if (categoryIds.size() > 1) {
                            predicate.add(root.get("categoryId").in(categoryIds));
                        }
                        break;
                    case CATEGORY_ID1_IS:
                        predicate.add(builder.equal(root.get("categoryId1"), keyValue));
                        break;
                    case ACTIVATED_IS:
                        predicate.add(builder.equal(root.get("activated"), keyValue));
                        break;
                    default:
                }
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
}
