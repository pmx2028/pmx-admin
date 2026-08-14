package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.management.UserPermissionUpdateReqDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.management.RolePermissionService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Slf4j
@AllArgsConstructor
public class ManageRolePermissionApiController {

    private final RolePermissionService rolePermissionService;

    // 모든 역할 조회
    @GetMapping("/roles")
    public ResponseEntity<ResponseDto> getRoles(@AuthenticationPrincipal CustomUserDetails userDetails){
        ResponseDto responseDto = rolePermissionService.getRoleList(userDetails) ;
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    // 모든 권한 조회
    @GetMapping("/permissions")
    public ResponseEntity<ResponseDto> getPermissions(@AuthenticationPrincipal CustomUserDetails userDetails){
        ResponseDto responseDto = rolePermissionService.getPermissionList(userDetails) ;
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }
    // 역할에 부여된 권한 조회
    @GetMapping("/roles/{roleId}/permissions")
    public ResponseEntity<ResponseDto> getPermissionsByRoleId(@PathVariable("roleId") Long roleId, @AuthenticationPrincipal CustomUserDetails userDetails){
        ResponseDto responseDto = rolePermissionService.getPermissionByRoleId(roleId, userDetails) ;
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    // 역할에 부여된 권한 업데이트
    @PutMapping("/roles/{roleId}/permissions")
    public ResponseEntity<ResponseDto> updatePermissionsByRoleId(
            @PathVariable("roleId") Long roleId, @RequestBody List<Long> permissionIds, @AuthenticationPrincipal CustomUserDetails userDetails){
        ResponseDto responseDto = rolePermissionService.updateRolePermissions(roleId, permissionIds, userDetails) ;
        return new ResponseEntity<>(
                responseDto,
                HttpStatus.OK
        );
    }

    // 사용자별 권한관리에서 사용자 리스트 조회
    @GetMapping("/user-permission/users")
    public ResponseEntity<ResponseDto> getDistinctUsersFromUserPermissions(@AuthenticationPrincipal CustomUserDetails userDetails) {
        ResponseDto responseDto = rolePermissionService.getDistinctUsersFromUserPermissions(userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @GetMapping("/user-permission/{userId}/permissions")
    public ResponseEntity<ResponseDto> getUserPermission(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ResponseDto responseDto = rolePermissionService.getUserPermissionViewByUserId(userId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PutMapping("/user-permission/{userId}/permissions")
    public ResponseEntity<ResponseDto> updateUserPermission(
            @PathVariable("userId") Long userId,
            @RequestBody List<UserPermissionUpdateReqDto> reqDtoList,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ResponseDto responseDto = rolePermissionService.updateUserPermissionByUserId(userId, reqDtoList, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @DeleteMapping("/user-permission/{userId}/permissions")
    public ResponseEntity<ResponseDto> deleteUserPermission(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ResponseDto responseDto = rolePermissionService.deleteUserPermissionByUserId(userId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }
}
