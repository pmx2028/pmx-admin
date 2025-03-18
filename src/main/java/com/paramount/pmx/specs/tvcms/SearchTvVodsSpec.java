package com.paramount.pmx.specs.tvcms;

import com.paramount.pmx.model.tvcms.TvVods;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.Predicate;
import java.util.*;

public class SearchTvVodsSpec {

    //검색 파라메터 키값 설정
    @AllArgsConstructor
    @Getter
    public enum SearchKey{
         PROGRAM_LIKE("programName")
        ,VOD_LIKE("vodName")
        ,KREX_LIKE("krxeName")
        ,USE_FLAG("useFlag")
        ;

        private final String value;
    }

    //정렬 파라메터 키값 설정 설명 추가 설명 3
    @AllArgsConstructor
    @Getter
    public enum SortingKey{
        CREATED_AT("createdAt")
        ;
        private final String value;

        public static SortingKey findByEnumName(String name){
            return Arrays.stream(SortingKey.values())
                            .filter(sortingKeyEnum -> sortingKeyEnum.name().equals(name))
                            .findAny()
                            .orElse(null);
        }
    }

    public static Specification<TvVods> createSpecification(Map<String, Object> searchRequest, List<String> defaultSearchParam){
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
        return (Specification<TvVods>) ((root, query, builder) -> {

            // query에 distinct 적용. query가 늦어지므로 제거. 중복데이터가 존재할 경우 풀기.
            // query.distinct(true);
            List<Predicate> predicate = new ArrayList<>();
            for (SearchKey key : searchKeyword.keySet()) {
                String keyValue = searchKeyword.get(key).toString().trim();
                switch (key) {
                    case PROGRAM_LIKE:
                        Predicate  programNamePredicate = builder.like(root.get(key.value), "%"+keyValue.replaceAll("[^가-힣0-9a-zA-Z/\\s]", "")+"%");
                        //group keyword like
                        //Predicate groupKeywordPredicate= builder.like(root.get("groupKeyword"), "%"+keyValue.replaceAll("[^가-힣0-9a-zA-Z/\\s]", "")+"%");
                        //predicate.add(builder.or(groupNamePredicate, groupKeywordPredicate));
                        predicate.add(programNamePredicate);
                        break;
                    case VOD_LIKE:
                        predicate.add(builder.like(root.get(key.value), "%"+keyValue.replaceAll("[^가-힣0-9a-zA-Z/\\s]", "")+"%"));
                        break;
                    case KREX_LIKE:
                        predicate.add(builder.like(root.get(key.value), "%"+keyValue.replaceAll("[^가-힣0-9a-zA-Z/\\s]", "")+"%"));
                        break;
                    case USE_FLAG:
                        predicate.add(builder.equal(root.get(key.value), keyValue));
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

    // SortKey에 설정된 값이 아닌 정렬파라메터인  경우 제거하고 유효한 정렬파라메터만 리턴
    public static Sort getValidSortKey(Sort sort) {
        List<Order> orders = new ArrayList<>();
        for (Iterator<Order> it = sort.iterator(); it.hasNext(); ) {

            Order order = it.next();
            SortingKey newKey = SortingKey.findByEnumName(order.getProperty().toUpperCase());
            if(newKey != null) {
                orders.add(new Order(order.getDirection(), newKey.getValue()));
            }
        }

        return Sort.by(orders);
    }
}
