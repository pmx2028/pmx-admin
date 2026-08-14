package com.paramount.pmx.specs.user;

import com.paramount.pmx.model.user.Users;
import io.micrometer.common.util.StringUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;

public class SearchUsersSpec {

    //검색 파라메터 키값 설정
    @AllArgsConstructor
    @Getter
    public enum SearchKey{
        LEVEL_NOT("level"), // level
        ROLE_ID_IS("roleId"),
        NAME_LIKE("name")
        ;

        private final String value;
    }

    //정렬 파라메터 키값 설정
    @AllArgsConstructor
    @Getter
    public enum SortingKey{
        ID("id"),
        CREATED_AT("createdAt"),
        ACTIVATED("activated"),
        ;
         private final String value;

        public static SortingKey findByValue(String value) {
            if (value == null) return null;
            return Arrays.stream(values())
                    .filter(v -> v.value.equals(value))
                    .findFirst()
                    .orElse(null);
        }
    }

    public static Specification<Users> createSpecification(Map<String, Object> searchRequest, List<String> defaultSearchParam){
        //defaultSearchParam 추가
        for (String str : defaultSearchParam){
            searchRequest.put(str.split("=")[0], str.split("=")[1]);
        }

        //searchfield:1:2:3, searchkeyword:1:2:3가 있을 경우 재조합한다.
        String fieldName = "searchfield";
        String keywordName = "searchkeyword";
        Map<String, Object> additionRequest = new HashMap<>();
        for (String key : searchRequest.keySet()){
            if (key.startsWith(fieldName)){
                String keyNumber = key.substring(fieldName.length());
                
                if (StringUtils.isNotEmpty((String)searchRequest.get(keywordName + keyNumber))){
                    additionRequest.put((String)searchRequest.get(key), (String)searchRequest.get(keywordName + keyNumber));
                }
            }
        }
        searchRequest.putAll(additionRequest);


        //등록된 searchRequest만 남기고, 중복된 searchRequest를 제거한다.
        Map<SearchKey, Object> searchKeyword = getValidSearchKey(searchRequest);
        return (Specification<Users>) ((root, query, builder) -> {

            // query에 distinct 적용. query가 늦어지므로 제거. 중복데이터가 존재할 경우 풀기.
            // query.distinct(true);
            List<Predicate> predicate = new ArrayList<>();
            for (SearchKey key : searchKeyword.keySet()) {
                String keyValue = searchKeyword.get(key).toString().trim();

                switch (key) {
                    case LEVEL_NOT:
                        predicate.add(builder.notEqual(root.get("level"),  keyValue));
                        break;
                    case ROLE_ID_IS:
                        predicate.add(builder.equal(root.get("roleId"), keyValue));
                        break;
                    case NAME_LIKE:
                        predicate.add(builder.like(
                                builder.lower(root.get(key.value)),    // 대소문자 무시용
                                "%" + keyValue.toLowerCase() + "%"
                        ));
                        break;

                    default:
                }
            }

            return builder.and(predicate.toArray(new Predicate[0]));
        });
    }


    // SearchKey에 설정된 값이 아닌 검색파라메터인 경우 제거하고 유효한 검색파라메터만 리턴
    public static Map<SearchKey, Object> getValidSearchKey(Map<String, Object> searchRequest) {
        final Map<SearchKey, Object> searchKeys = new HashMap<>();
        for (String key : searchRequest.keySet()) {
            try {
                if(!StringUtils.isEmpty((searchRequest.get(key).toString()).replaceAll("\\p{Z}", ""))) { //모든공백제거(아스키, 유니코드)
                    searchKeys.put(SearchKey.valueOf(key.toUpperCase()), searchRequest.get(key));
                }
            } catch(Exception e) {
                // 지정된 key값이 아닌경우 Exception 처리
            }
        }
        return searchKeys;
    }

    // SortKey에 설정된 값이 아닌 정렬파라메터인  경우 제거하고 유효한 정렬파라메터로만 sort
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
