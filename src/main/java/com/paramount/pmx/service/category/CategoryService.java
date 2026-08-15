package com.paramount.pmx.service.category;

import com.paramount.pmx.model.category.Category;
import com.paramount.pmx.model.category.CategoryDetail;
import com.paramount.pmx.model.category.CategoryDetailDto;
import com.paramount.pmx.model.category.CategoryDto;
import com.paramount.pmx.model.category.OwnCategoryTreeDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.category.CategoryDetailRepository;
import com.paramount.pmx.repository.category.CategoryRepository;
import com.paramount.pmx.security.CustomUserDetails;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class CategoryService {

    private CategoryRepository categoryRepository;
    private CategoryDetailRepository categoryDetailRepository;

    // 기사작성 에디터에서 사용되는 카테고리
    public ResponseDto getChildrenByParentIdForEditor(Long parentId) {
        return Response.ok(categoryRepository.findByParentIdAndActivatedOrderByPosition(parentId, 1));
    }

    // 최상위 카테고리 (카테고리 탭 메뉴 구성시 사용됨)
    public List<Category> getTopCategories() {
        return categoryRepository.findByParentIdIsNull();
    }

    @Transactional
    public ResponseDto create(CategoryDto reqDto, CustomUserDetails userDetails) {
        Category saved;
        if (reqDto.getParentId() == null) {
            // 최상위 분류 생성
            saved = createRoot(reqDto);

        } else {
            // 하위 분류 생성
            saved = createChild(reqDto);
        }
        return Response.ok(saved);
    }

    public Category createRoot(CategoryDto reqDto) {
        // 최상위 분류 생성
        Category category = Category.builder()
                .parentId(null)
                .name(reqDto.getName())
                .activated(1)
                .position(null)
                .depth(null)
                .build();
        return categoryRepository.save(category);
    }

    public Category createChild(CategoryDto reqDto) {
        // 하위 분류 생성
        Category parentCategory = categoryRepository.findById(reqDto.getParentId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ID 입니다."));

        // position
        Integer maxPos = categoryRepository.findMaxPositionByParentId(1L);
        Integer nextPos = (maxPos == null ? 1 : maxPos + 1);

        // depth
        Integer parentDepth = parentCategory.getDepth();
        int depth = parentDepth==null ? 1 : parentDepth + 1;

        // topParentId
        /**
         * 사실 topParentId가 왜 필요한지 모르겠음, 일단 기존에 사용하던 컬럼이라 남겨두기 위해서 값 넣어줌
         * -> 추후 필요없는 컬럼이라고 판단되면 삭제하고 로직 간단하게 변경해줘야함
         * */

        Category category = Category.builder()
                .parentId(reqDto.getParentId())
                .name(reqDto.getName())
                .activated(reqDto.getActivated())
                .depth(depth)
                .build();
        Category saved = categoryRepository.save(category);

        if (depth == 1) {
            // 위에서 못넣어줬던 본인 id를 생성한 후 넣어줌
            categoryRepository.save(saved);
        }

        return saved;
    }


    @Transactional
    public ResponseDto update(Long id, CategoryDto reqDto, CustomUserDetails userDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ID 입니다."));

        category.setName(reqDto.getName());
        category.setActivated(reqDto.getActivated());

        categoryRepository.save(category);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto saveDetail(Long categoryId, CategoryDetailDto reqDto, CustomUserDetails userDetails) {
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리 ID 입니다."));

        CategoryDetail categoryDetail = categoryDetailRepository.findById(categoryId)
                .orElseGet(() -> CategoryDetail.builder()
                        .id(categoryId)
                        .build());

        categoryDetail.setPrice(reqDto.getPrice());
        categoryDetail.setDescription(reqDto.getDescription());
        categoryDetail.setUsageInfo(reqDto.getUsageInfo());
        categoryDetail.setCoverId(reqDto.getCoverId());
        categoryDetail.setCoverId1(reqDto.getCoverId1());

        CategoryDetail saved = categoryDetailRepository.save(categoryDetail);
        return Response.ok(CategoryDetailDto.toDetailDto(saved));
    }

    @Transactional
    public ResponseDto updateDetail(Long categoryId, CategoryDetailDto reqDto, CustomUserDetails userDetails) {
        return saveDetail(categoryId, reqDto, userDetails);
    }

    @Transactional
    public ResponseDto deleteDetail(Long categoryId, CustomUserDetails userDetails) {
        CategoryDetail categoryDetail = categoryDetailRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 ID 입니다."));

        categoryDetailRepository.delete(categoryDetail);
        return Response.ok(true);
    }

    public ResponseDto getDetailsByCategoryId(Long categoryId) {
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리 ID 입니다."));

        CategoryDetailDto detail = categoryDetailRepository.findById(categoryId)
                .map(CategoryDetailDto::toDetailDto)
                .orElse(null);

        return Response.ok(detail);
    }

    @Transactional
    public ResponseDto reorderPosition(List<CategoryDto> reqList, CustomUserDetails userDetails) {

        // 1) 요청에 포함된 id들로 기존 카테고리를 한 번에 로딩
        Set<Long> ids = reqList.stream()
                .map(CategoryDto::getId)
                .collect(Collectors.toSet());

        Map<Long, Category> categoryMap = categoryRepository
                .findAllById(ids)
                .stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

        // 2) 요청으로 들어온 순서대로 position 업데이트
        for (CategoryDto item : reqList) {
            Category category = categoryMap.get(item.getId());
            if (category == null) {
                continue; // 방어
            }
            category.setPosition(item.getPosition());
        }

        // 3) flush → DB 반영
        categoryRepository.flush();

        return Response.ok(true);
    }


    // 하위 카테고리 트리 조회
    public ResponseDto getCategoryTree() {
        // 1) 전체 카테고리 로드
        List<Category> all = categoryRepository.findAll().stream()
                .filter(category -> Objects.equals(category.getActivated(), 1))
                .toList();

        return Response.ok(getTreeByRootId(all));
    }

    public List<OwnCategoryTreeDto> getTreeByRootId(List<Category> all) {
        // 2) id -> Category 매핑
        Map<Long, Category> byId = all.stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

        // 3) parentId -> children 분류
        Map<Long, List<Category>> childrenByParent = all.stream()
                .filter(c -> c.getParentId() != null)
                .collect(Collectors.groupingBy(Category::getParentId));

        // 4) DFS로 트리 펼치기 (루트는 빼고 자식부터)
        List<Category> ordered = new ArrayList<>();

        // 첫 번째 Level
        List<Category> firstLevel = all.stream()
                .filter(c -> c.getParentId() == null)
                .collect(Collectors.toCollection(ArrayList::new));

        firstLevel.sort(Comparator
                .comparing((Category c) -> c.getPosition() == null ? 0 : c.getPosition())
                .thenComparing(Category::getId)
        );

        for (Category child : firstLevel) {
            addWithDescendants(child, childrenByParent, ordered);
        }

        // 5) Category → OwnCategoryTreeDto 변환
        List<OwnCategoryTreeDto> dtoList = new ArrayList<>();

        // 5-2) 그 다음으로 하위 트리 DTO들 추가
        List<OwnCategoryTreeDto> childrenDtos = ordered.stream()
                .map(c -> {
                    Long parentId = c.getParentId();
                    String parentName = null;

                    if (parentId != null) {
                        Category parent = byId.get(parentId);
                        if (parent != null) {
                            parentName = parent.getName();
                        }
                    }

                    return new OwnCategoryTreeDto(
                            c.getId(),
                            c.getName(),
                            parentId,
                            parentName,
                            c.getDepth(),
                            c.getPosition(),
                            c.getActivated()
                    );
                })
                .toList();

        dtoList.addAll(childrenDtos);
        return dtoList;
    }

    /**
     * DFS(pre-order): category 자신 → 자식들 순서대로 재귀 삽입
     */
    private void addWithDescendants(
            Category category,
            Map<Long, List<Category>> childrenByParent,
            List<Category> result
    ) {
        // 1) 자기 자신 먼저 추가
        result.add(category);

        // 2) 자식 정렬
        List<Category> children = new ArrayList<>(
                childrenByParent.getOrDefault(category.getId(), Collections.emptyList())
        );

        children.sort(Comparator
                .comparing((Category c) -> c.getPosition() == null ? 0 : c.getPosition())
                .thenComparing(Category::getId)
        );

        // 3) 자식들에 대해 다시 DFS 호출
        for (Category child : children) {
            addWithDescendants(child, childrenByParent, result);
        }
    }
    //상위 카테고리 명으로 하위카테고리 리스트 조회
    public ResponseDto getChildrenByParentNameList(String name) {
        return Response.ok(categoryRepository.findChildrenByParentName(name));
    }



}


