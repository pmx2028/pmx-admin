package com.paramount.pmx.model.pay;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// SETTLE_PG.pay(obj, callback) 호출 시 넘겨줄 obj를 그대로 표현한 DTO.
// 필드명은 https://tbnpg.settlebank.co.kr/resources/js/v1/SettlePG_v1.2.js 가 읽는 파라미터명과 동일하게 맞춘다.
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class HectoPayRequestDto {

    // SETTLE_PG.pay()의 obj.env / obj.ui — 결제요청 패킷은 아니지만 클라이언트 호출에 필요
    private String env;
    private String uiType;

    // 결제요청 패킷 (SETTLE_PG.pay 필수 파라미터)
    private String mchtId;
    private String method;
    private String trdDt;
    private String trdTm;
    private String mchtTrdNo;
    private String mchtName;
    private String mchtEName;
    private String pmtPrdtNm;
    private String trdAmt;
    private String mchtCustNm;
    private String mchtCustId;
    private String notiUrl;
    private String nextUrl;
    private String cancUrl;
    private String mchtParam;
    private String pktHash;
}
