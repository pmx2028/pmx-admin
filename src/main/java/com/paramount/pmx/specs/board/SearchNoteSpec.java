package com.paramount.pmx.specs.board;


import com.paramount.pmx.model.board.Note;
import jakarta.persistence.criteria.Predicate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.*;

@Slf4j
public class SearchNoteSpec {

    @AllArgsConstructor
    @Getter
    public enum SearchKey {
        TITLE_LIKE(""), // 이름
        CONTENT_LIKE(""),
        BOARD_ID_EQUAL(""), //
        ;

        private final String value;
    }

    @AllArgsConstructor
    @Getter
    public enum SortingKey {
        CREATED_AT("createdAt"), // 작성일시
        UPDATED_AT("updatedAt"), // 수정일시

        ;

        private final String value;

        //public static SortingKey findByEnumName(String name) {
        //    return Arrays.stream(SortingKey.values())
        //            .filter(s -> s.name().equalsIgnoreCase(name))
        //            .findAny()
        //            .orElse(null);
        //}

        // value 기준으로 찾도록
        public static SortingKey findByFieldName(String fieldName) {
            return Arrays.stream(SortingKey.values())
                    .filter(s -> s.getValue().equalsIgnoreCase(fieldName))
                    .findFirst()
                    .orElse(null);
        }
    }

    public static Specification<Note> createSpecification(Map<String, Object> searchRequest) {
        //등록된 searchRequest만 남기고, 중복된 searchRequest를 제거한다.
        Map<SearchKey, Object> searchKeyword = getValidSearchKey(searchRequest);

        return (root, query, builder) -> {
            // query.distinct(true);

            List<Predicate> predicates = new ArrayList<>();

            // 오늘 날짜 문자열 (yyyy-MM-dd)
            String today = LocalDate.now().toString();

            for (Map.Entry<SearchKey, Object> entry : searchKeyword.entrySet()) {
                String keyValue = entry.getValue().toString().trim();

                switch (entry.getKey()) {
                    case BOARD_ID_EQUAL:
                        predicates.add(builder.equal(root.get("boardId"), keyValue));
                        break;
                    case TITLE_LIKE:
                        predicates.add(builder.like(root.get("title"), "%"+keyValue+"%"));
                        break;
                    case CONTENT_LIKE:
                        predicates.add(builder.like(root.get("content"), "%"+keyValue+"%"));
                        break;
                    default:
                        break;
                }
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }



    // SearchKey에 설정된 값이 아닌 검색파라메터인 경우 제거하고 유효한 검색파라메터만 리턴
    public static Map<SearchKey, Object> getValidSearchKey(Map<String, Object> searchRequest) {
        Map<SearchKey, Object> searchKeys = new HashMap<>();
        for (String key : searchRequest.keySet()) {
            try {
                Object value = searchRequest.get(key);
                if (value != null && !value.toString().trim().isEmpty()) {
                    searchKeys.put(SearchKey.valueOf(key.toUpperCase()), value);
                }
            } catch (Exception ignored) {
            }
        }
        return searchKeys;
    }


    // SortKey에 설정된 값이 아닌 정렬파라메터인  경우 제거하고 유효한 정렬파라메터로만 sort
    public static Sort getValidSortKey(Sort sort) {
        List<Sort.Order> orders = new ArrayList<>();
        for (Sort.Order order : sort) {
            SortingKey key = SortingKey.findByFieldName(order.getProperty());
            if (key != null) {
                orders.add(new Sort.Order(order.getDirection(), key.getValue()));
            }
        }
        return Sort.by(orders);
    }

}
