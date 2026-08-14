package com.paramount.pmx.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;


@Getter
@RequiredArgsConstructor
public enum AuthorityCode {

    /**
     * Permissions, Roles 코드 Enum.
     * code를 기억할수 없어서 편하게 사용하기 위해 작성해서 사용!
     * DB 테이블 값 변경 시 반드시 DB 데이터와 동기화할 것
     */

    /*  =================================== Permissions 테이블 =================================== */
    // PAGE 권한
    LESSON_PAGE_VIEW("강습 화면 접근"),
    APART_PAGE_VIEW("아파트 화면 접근"),
    MANAGER_PAGE_VIEW("매니저 화면 접근"),
    TRAINER_PAGE_VIEW("강사 화면 접근"),
    MEMBER_PAGE_VIEW("강습생 화면 접근"),
    REFUND_PAGE_VIEW("환불 화면 접근"),
    PAYMENT_PAGE_VIEW("정산 화면 접근"),
    STATISTICS_PAGE_VIEW("통계 화면 접근"),
    NOTICE_PAGE_VIEW("공지사항 화면 접근"),

    // ACTION 권한
    MANAGER("매니저 권한"),
    TRAINER("강사 권한"),
    ADMIN("관리자처럼 모든 행동을 할 수 있는 권한"),

    /*  =================================== Role 테이블 =================================== */
    ROLE_MANAGER("매니져 권한 세트"),
    ROLE_TRAINER("강사 권한 세트"),
    ROLE_ADMIN("관리자 권한 세트"),


    /*  =================================== 권한없음 =================================== */
    // NO_PRIVILEGE 코드는 permissions 테이블에 따로 저장되어있지 않음
    // 로그인시 users.level이 0인 경우 부여되는 권한임
    // 아직 퇴사상태는 아니지만, 퇴사 휴가 소진하는 경우에 cms에 들어와 데이터에 접근하지 못하도록 조치하기 위한 장치임
    NO_PRIVILEGE("권한없음 상태(level=0)")

    ;
    
    private final String description;

    public String getCode() {
        return this.name(); // Enum 이름이 DB code와 동일
    }

    /** 코드로 Enum 조회 */
    public static AuthorityCode fromCode(String code) {
        for (AuthorityCode p : values()) {
            if (p.name().equalsIgnoreCase(code)) {
                return p;
            }
        }
        throw new IllegalArgumentException("Unknown permission code: " + code);
    }
}
