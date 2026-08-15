package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.category.CategoryDto;
import com.paramount.pmx.model.category.CategoryDetailDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.category.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class CategoryApiController {

    private final CategoryService categoryService;

    // 강습카테고리 관리
    @GetMapping("/tree")
    public ResponseEntity<ResponseDto> getCategoryTree(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(categoryService.getCategoryTree());
    }

    @PostMapping("")
    public ResponseEntity<ResponseDto> create(@RequestBody CategoryDto reqDto, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(categoryService.create(reqDto, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> update(@PathVariable Long id, @RequestBody CategoryDto dto, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(categoryService.update(id, dto, user));
    }

    @PutMapping("/reorder")
    public ResponseEntity<ResponseDto> reorder(@RequestBody List<CategoryDto> dto, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(categoryService.reorderPosition(dto, user));
    }

    @GetMapping("/{categoryId}/details")
    public ResponseEntity<ResponseDto> getDetails(@PathVariable Long categoryId) {
        return ResponseEntity.ok(categoryService.getDetailsByCategoryId(categoryId));
    }

    @PostMapping("/{categoryId}/details")
    public ResponseEntity<ResponseDto> createDetail(@PathVariable Long categoryId, @RequestBody CategoryDetailDto reqDto, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(categoryService.saveDetail(categoryId, reqDto, user));
    }

    @PutMapping("/{categoryId}/details")
    public ResponseEntity<ResponseDto> updateDetail(@PathVariable Long categoryId, @RequestBody CategoryDetailDto reqDto, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(categoryService.updateDetail(categoryId, reqDto, user));
    }

    @DeleteMapping("/{categoryId}/details")
    public ResponseEntity<ResponseDto> deleteDetail(@PathVariable Long categoryId, @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(categoryService.deleteDetail(categoryId, user));
    }

}
