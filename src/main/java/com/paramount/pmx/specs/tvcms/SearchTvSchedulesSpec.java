package com.paramount.pmx.specs.tvcms;

import com.paramount.pmx.model.tvcms.TvSchedules;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Order;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.Predicate;
import java.util.*;

public class SearchTvSchedulesSpec {

    //검색 파라메터 키값 설정
    @AllArgsConstructor
    @Getter
    public enum SearchKey{
        SCHEDULE_ID ("id")
        ,SCHEDULE_DAY_BETWEEN("scheduleDay")
        ,SCHEDULE_GUBN("scheduleGubn")
        ,SCHEDULE_LIKE("scheduleName")
        ,CONTENT_LIKE("content")
        ,SCHEDULE_CONTENT_LIKE("scheduleNameContent")
        ;

        private final String value;
    }

    //정렬 파라메터 키값 설정
    @AllArgsConstructor
    @Getter
    public enum SortingKey{
        SCHEDULE_DAY("scheduleDay")
        ,SCHEDULE_ST_TIME("scheduleStTime")
        ;
        private final String value;

        public static SortingKey findByEnumName(String name){
            return Arrays.stream(SortingKey.values())
                            .filter(sortingKeyEnum -> sortingKeyEnum.name().equals(name))
                            .findAny()
                            .orElse(null);
        }
    }

    public static Specification<TvSchedules> createSpecification(Map<String, Object> searchRequest, List<String> defaultSearchParam){
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
        return (Specification<TvSchedules>) ((root, query, builder) -> {

            // query에 distinct 적용. query가 늦어지므로 제거. 중복데이터가 존재할 경우 풀기.
            // query.distinct(true);
            List<Predicate> predicate = new ArrayList<>();
            for (SearchKey key : searchKeyword.keySet()) {
                String keyValue = searchKeyword.get(key).toString().trim();
                switch (key) {
                    case SCHEDULE_ID:
                        predicate.add(builder.equal(root.get(key.value), keyValue));
                        break;
                    case SCHEDULE_DAY_BETWEEN:
                        try{
                            String[] dates = searchKeyword.get(key).toString().split("~");
                            predicate.add(builder.between(
                                    root.get(key.value), dates[0], dates[1]
                            ));
                        } catch (Exception e){
                            System.out.println("searchObjectWidth :: date between error " + e.getMessage());
                        }
                        break;
                    case SCHEDULE_GUBN:
                        String[] arrSchedule = searchKeyword.get(key).toString().split(",");
                        if (arrSchedule.length == 1){
                            predicate.add(builder.like(root.get(key.value), "%"+arrSchedule[0]+"%"));
                        } else if (arrSchedule.length == 2){
                            Predicate corpNamePredicate = builder.like(root.get(key.value), "%"+arrSchedule[0]+"%");
                            Predicate corpNamePredicate2 = builder.like(root.get(key.value), "%"+arrSchedule[1]+"%");
                            predicate.add(builder.or(corpNamePredicate, corpNamePredicate2));
                        }
                        break;
                    case SCHEDULE_LIKE:
                        predicate.add(builder.like(root.get(key.value), "%"+keyValue.replaceAll("[^가-힣0-9a-zA-Z/\\s]", "")+"%"));
                        break;
                    case CONTENT_LIKE:
                        predicate.add(builder.like(root.get(key.value), "%"+keyValue.replaceAll("[^가-힣0-9a-zA-Z/\\s]", "")+"%"));
                        break;
                    case SCHEDULE_CONTENT_LIKE:
                        Predicate scheduleNamePredicate = builder.like(root.get("scheduleName"), "%"+keyValue.replaceAll("[^가-힣0-9a-zA-Z/\\s]", "")+"%");
                        Predicate contentPredicate= builder.like(root.get("content"), "%"+keyValue.replaceAll("[^가-힣0-9a-zA-Z/\\s]", "")+"%");
                        predicate.add(builder.or(scheduleNamePredicate, contentPredicate));
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
