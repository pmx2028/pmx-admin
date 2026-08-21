package com.paramount.pmx.controller.api;

import com.paramount.pmx.model.order.OrdersDto;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.service.order.OrderService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@Slf4j
@AllArgsConstructor
public class OrderApiController {

    private final OrderService orderService;

    // 주문 리스트 조회
    @GetMapping()
    public ResponseEntity<ResponseDto> getOrderList(
            @RequestParam Map<String, Object> requestParams,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = orderService.getAllOrderList(requestParams, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    // 주문 생성
    @PostMapping()
    public ResponseEntity<ResponseDto> createOrder(
            @RequestBody OrdersDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = orderService.createOrder(reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ResponseDto> getOrderDetail(
            @PathVariable("orderId") Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = orderService.getOrderDetail(orderId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<ResponseDto> updateOrder(
            @PathVariable("orderId") Long orderId,
            @RequestBody OrdersDto reqDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = orderService.updateOrder(orderId, reqDto, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }

    /** 주문 취소 처리 */
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<ResponseDto> cancelOrder(
            @PathVariable("orderId") Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        ResponseDto responseDto = orderService.cancelOrder(orderId, userDetails);
        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }
}
