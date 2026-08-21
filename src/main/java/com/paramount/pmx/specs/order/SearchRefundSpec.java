package com.paramount.pmx.specs.order;

import com.paramount.pmx.model.refund.Refund;
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

public class SearchRefundSpec {

    @AllArgsConstructor
    @Getter
    public enum SearchKey {
        REFUND_NO_LIKE("refundNo"),
        ORDER_ID_IS("orderId"),
        PAYMENT_ID_IS("paymentId"),
        MEMBER_ID_IS("memberId"),
        REFUND_STATUS_IS("refundStatus");

        private final String value;
    }

    @AllArgsConstructor
    @Getter
    public enum SortingKey {
        ID("id"),
        REFUND_NO("refundNo"),
        REFUND_AMOUNT("refundAmount"),
        REFUND_STATUS("refundStatus"),
        REQUESTED_AT("requestedAt"),
        COMPLETED_AT("completedAt"),
        CREATED_AT("createdAt"),
        UPDATED_AT("updatedAt");

        private final String value;

        public static SortingKey findByValue(String value) {
            if (value == null) return null;
            return Arrays.stream(values())
                    .filter(v -> v.value.equals(value))
                    .findFirst()
                    .orElse(null);
        }
    }

    public static Specification<Refund> createSpecification(Map<String, Object> searchRequest, List<String> defaultSearchParam) {
        for (String str : defaultSearchParam) {
            searchRequest.put(str.split("=")[0], str.split("=")[1]);
        }

        Map<SearchKey, Object> searchKeyword = getValidSearchKey(searchRequest);
        return (root, query, builder) -> {
            List<Predicate> predicate = new ArrayList<>();

            for (SearchKey key : searchKeyword.keySet()) {
                String keyValue = searchKeyword.get(key).toString().trim();

                switch (key) {
                    case REFUND_NO_LIKE:
                        predicate.add(builder.like(
                                builder.lower(root.get(key.value)),
                                "%" + keyValue.toLowerCase() + "%"
                        ));
                        break;
                    case ORDER_ID_IS, PAYMENT_ID_IS, MEMBER_ID_IS, REFUND_STATUS_IS:
                        predicate.add(builder.equal(root.get(key.value), keyValue));
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
                // ignore unsupported search key
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
