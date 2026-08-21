package com.paramount.pmx.service.order;

import com.paramount.pmx.model.DatatableDto;
import com.paramount.pmx.model.enums.OrderStatus;
import com.paramount.pmx.model.lesson.Lesson;
import com.paramount.pmx.model.order.Orders;
import com.paramount.pmx.model.order.OrdersDto;
import com.paramount.pmx.model.response.Response;
import com.paramount.pmx.model.response.ResponseDto;
import com.paramount.pmx.repository.lesson.LessonRepository;
import com.paramount.pmx.repository.order.OrdersRepository;
import com.paramount.pmx.security.CustomUserDetails;
import com.paramount.pmx.specs.order.SearchOrderSpec;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static java.lang.Math.E;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrdersRepository ordersRepository;
    private final LessonRepository lessonRepository;


    public ResponseDto getAllOrderList(Map<String, Object> requestParams, CustomUserDetails userDetails) {
        Sort defaultSort = Sort.by(Sort.Order.desc("id"));
        DatatableDto datatableDto = new DatatableDto(requestParams, defaultSort, SearchOrderSpec::getValidSortKey);

        Specification<Orders> spec = SearchOrderSpec.createSpecification(datatableDto.getSearch(), List.of());
        Page<Orders> page = ordersRepository.findAll(spec, datatableDto.getPageable());

        List<OrdersDto> result = page.getContent().stream()
                .map(OrdersDto::toListDto)
                .toList();

        long recordsTotal = ordersRepository.count(SearchOrderSpec.createSpecification(new HashMap<>(), List.of()));

        return Response.ok(
                result,
                datatableDto.getDraw(),
                recordsTotal,
                page.getTotalElements()
        );
    }

    @Transactional
    public ResponseDto createOrder(OrdersDto reqDto, CustomUserDetails userDetails) {
        validateCreate(reqDto);

        Lesson lesson = lessonRepository.findById(reqDto.getLessonId())
                .orElseThrow(() -> new IllegalArgumentException("해당 강습을 찾을 수 없습니다."));


        if (Objects.equals(lesson.getLessonPrice(), reqDto.getOrderAmount() == null ? null : Long.valueOf(reqDto.getOrderAmount()))) {
            new NoSuchElementException("주문결재 금액 오류 입니다.");
        }

        int discountAmount = reqDto.getDiscountAmount() == null ? 0 : reqDto.getDiscountAmount();
        String  orderNo = reqDto.getOrderNo() == null ? generateOrderNo() : reqDto.getOrderNo();


        Orders order = Orders.builder()
                .orderNo(orderNo)
                //.memberId(reqDto.getMemberId())
                .memberId(1L)
                .apartId(reqDto.getApartId())
                .lessonId(reqDto.getLessonId())
                .orderName(reqDto.getOrderName())
                .orderAmount(reqDto.getOrderAmount())
                .discountAmount(discountAmount)
                .paymentAmount(reqDto.getOrderAmount() - discountAmount)
                .orderStatus(OrderStatus.READY.name())
                .build();

        ordersRepository.save(order);
        return Response.ok(OrdersDto.toDetailDto(order));
    }

    public ResponseDto getOrderDetail(Long orderId, CustomUserDetails userDetails) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("해당 주문을 찾을 수 없습니다."));

        return Response.ok(OrdersDto.toDetailDto(order));
    }

    @Transactional
    public ResponseDto updateOrder(Long orderId, OrdersDto reqDto, CustomUserDetails userDetails) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("해당 주문을 찾을 수 없습니다."));

        if (!"READY".equals(order.getOrderStatus()) && !"PAYMENT_PENDING".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException("결제가 진행된 주문은 수정할 수 없습니다.");
        }

        order.setApartId(reqDto.getApartId());
        order.setLessonId(reqDto.getLessonId());
        order.setOrderName(reqDto.getOrderName() == null ? order.getOrderName() : reqDto.getOrderName());
        order.setOrderAmount(reqDto.getOrderAmount() == null ? order.getOrderAmount() : reqDto.getOrderAmount());
        order.setDiscountAmount(reqDto.getDiscountAmount() == null ? order.getDiscountAmount() : reqDto.getDiscountAmount());
        order.setPaymentAmount(order.getOrderAmount() - order.getDiscountAmount());
        ordersRepository.save(order);

        return Response.ok(true);
    }

    @Transactional
    public ResponseDto cancelOrder(Long orderId, CustomUserDetails userDetails) {
        Orders order = ordersRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("해당 주문을 찾을 수 없습니다."));

        order.setOrderStatus("CANCELLED");
        ordersRepository.save(order);

        return Response.ok(true);
    }

    private void validateCreate(OrdersDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("요청 정보가 없습니다.");
        }
        if (reqDto.getMemberId() == null) {
            throw new IllegalArgumentException("회원을 선택해 주세요.");
        }
        if (reqDto.getOrderName() == null || reqDto.getOrderName().isBlank()) {
            throw new IllegalArgumentException("주문명을 입력해 주세요.");
        }
        if (reqDto.getOrderAmount() == null) {
            throw new IllegalArgumentException("주문 금액을 입력해 주세요.");
        }
        if (reqDto.getOrderNo() != null && !reqDto.getOrderNo().isBlank() && ordersRepository.existsByOrderNo(reqDto.getOrderNo())) {
            throw new IllegalArgumentException("이미 사용 중인 주문번호입니다.");
        }
    }
    public static String generateOrderNo() {
        String random = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();

        return "PMX"
                + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                + random;
    }
}
