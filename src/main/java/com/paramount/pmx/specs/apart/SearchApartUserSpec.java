package com.paramount.pmx.specs.apart;

import com.paramount.pmx.model.apart.ApartUser;
import io.micrometer.common.util.StringUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SearchApartUserSpec {

    @AllArgsConstructor
    @Getter
    public enum SearchKey {
        APART_ID_IS("apartId"),
        USER_ID_IS("userId"),
        USER_LEVEL_IS("user.level"),
        ROLE_ID_IS("user.roleId"),
        ACTIVATED_IS("activated");
        private final String value;
    }

    @AllArgsConstructor
    @Getter
    public enum SortingKey {
        ID("id"),
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

    public static Specification<ApartUser> createSpecification(Map<String, Object> searchRequest, List<String> defaultSearchParam) {
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
                    case APART_ID_IS:
                        predicate.add(builder.equal(root.get("apartId"), keyValue));
                        break;
                    case USER_ID_IS:
                        predicate.add(builder.equal(root.get("userId"), keyValue));
                        break;
                    case USER_LEVEL_IS:
                        predicate.add(builder.equal(root.get("user").get("level"), keyValue));
                        break;
                    case ROLE_ID_IS:
                        predicate.add(builder.equal(root.get("user").get("roleId"), keyValue));
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
