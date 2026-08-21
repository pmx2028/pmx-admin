create table addresses
(
    id         int auto_increment
        primary key,
    code       varchar(10)                        not null comment '행정구역 코드',
    parent_id  int                                null comment '상위 지역 ID',
    name       varchar(100)                       not null comment '행정구역명',
    depth      tinyint                            not null comment '1: 시도, 2: 시군구',
    type       varchar(20)                        null comment 'SIDO, SIGUNGU',
    use_yn     char     default 'Y'               not null,
    sort_order int      default 0                 not null,
    created_at datetime default CURRENT_TIMESTAMP not null,
    updated_at datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint uk_code
        unique (code),
    constraint fk_region_parent
        foreign key (parent_id) references addresses (id)
);

create index idx_name
    on addresses (name);

create index idx_parent_id
    on addresses (parent_id);

create table apart_users
(
    id            bigint auto_increment
        primary key,
    apart_id      bigint                                   not null comment '아파트 ID',
    user_id       bigint                                   not null comment '사용자 ID',
    category_id   bigint                                   null comment '강습종목 대분류',
    category_id1  bigint                                   null comment '강수종목 소분류',
    weekday_codes varchar(100)                             null comment '요일선택',
    commission    decimal(12, 2) default 0.00              null comment '수수료',
    capacity      int            default 0                 null comment '강습정원',
    min_capacity  int            default 0                 null comment '최소정원',
    lesson_price  decimal(12, 2) default 0.00              null comment '강습요금',
    lesson_cnt    int            default 0                 null comment '강습횟수',
    activated     int            default 1                 not null comment '삭제 여부 (0:삭제, 1:사용중)',
    created_at    datetime       default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at    datetime       default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '최종 수정일시'
)
    comment '아파트 사용자 강습관리' charset = utf8mb4;

create index idx_apart_users_apartment_id
    on apart_users (apart_id);

create index idx_apart_users_category_id
    on apart_users (category_id);

create index idx_apart_users_category_id1
    on apart_users (category_id1);

create index idx_apart_users_user_id
    on apart_users (user_id);

create table aparts
(
    id           int auto_increment comment '아파트 번호 (PK)'
        primary key,
    address_id   int                                  null comment '행정구역코드',
    address_id1  int                                  null comment '시군구 코드',
    name         varchar(100)                         not null comment '아파트명',
    hos_cnt      int                                  null comment '세대수',
    gx_cnt       int                                  null comment 'GX가용인원',
    run_cnt      int                                  null comment '런링머신수',
    wet_cnt      int                                  null comment '웨이트머신수',
    inby_yn      tinyint(1) default 0                 null comment '인바디여부 (0:미보유, 1:보유)',
    golf_cnt     int                                  null comment '총타석수',
    scr_cnt      int                                  null comment '스크린타석수',
    scr_golf_cnt int                                  null comment '스크린골프타석수',
    user_id      int                                  null comment '생성자',
    activated    int        default 1                 not null comment '삭제 여부 (0:삭제, 1:사용중)',
    created_at   datetime   default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at   datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '최종 수정일시',
    constraint fk_aparts_address_id
        foreign key (address_id) references addresses (id)
            on delete cascade,
    constraint fk_aparts_address_id1
        foreign key (address_id1) references addresses (id)
            on delete cascade
)
    comment '아파트관리' charset = utf8mb4;

create table boards
(
    id          int auto_increment
        primary key,
    name        varchar(191)         null,
    code        varchar(191)         null,
    user_id     int                  null,
    cover_id    int                  null,
    kindof      int        default 0 not null,
    notes_count int        default 0 not null,
    activated   int        default 1 not null,
    commented   tinyint(1) default 0 not null comment '댓글 사용 여부',
    created_at  datetime             not null,
    updated_at  datetime             not null,
    anon        int        default 0 not null
)
    charset = utf8mb4;

create index idx_board_by_code
    on boards (code);

create table categories
(
    id         int auto_increment
        primary key,
    parent_id  int                                null,
    name       varchar(191)                       null,
    activated  int      default 1                 not null,
    position   int                                null,
    depth      int                                null comment '깊이',
    created_at datetime default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '최종 수정일시'
)
    comment '강습카테고리관리' charset = utf8mb4;

create index idx_category_by_pnp
    on categories (parent_id, position);

create index idx_category_by_pos
    on categories (position);

create table category_details
(
    id          int                                not null comment '강습 카테고리 ID'
        primary key,
    price       int      default 0                 not null comment '금액',
    description text                               null comment '카테고리 설명',
    usage_info  text                               null comment '이용 방법',
    cover_id    int                                null comment '첫번재 COVERID',
    cover_id1   int                                null comment '두번재 COVERID',
    created_at  datetime default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at  datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '최종 수정일시',
    constraint fk_category_details_category
        foreign key (id) references categories (id)
            on delete cascade
)
    comment '강습카테고리상세관리' charset = utf8mb4;

create table clips
(
    id                int auto_increment
        primary key,
    user_id           int          null,
    hashkey           varchar(191) null,
    original_filename varchar(191) null,
    filename          varchar(191) null,
    content_type      varchar(191) null,
    filesize          varchar(191) null,
    caption           varchar(191) null,
    created_at        datetime     not null,
    updated_at        datetime     not null,
    ext_url           varchar(191) null
)
    charset = utf8mb4;

create index idx_clips_by_uid
    on clips (user_id);

create table covers
(
    id                int auto_increment
        primary key,
    user_id           int           null,
    hashkey           varchar(191)  null,
    original_filename varchar(191)  null,
    filename          varchar(191)  null,
    content_type      varchar(191)  null,
    filesize          varchar(191)  null,
    dimensions        varchar(191)  null,
    positions         varchar(191)  null,
    details           varchar(191)  null,
    keywords          text          null,
    colors            text          null,
    articles_count    int default 0 not null,
    created_at        datetime      not null,
    updated_at        datetime      not null,
    ext_url           varchar(191)  null,
    revision          int default 0 not null
)
    charset = utf8mb4;

create table lesson_confirmed
(
    id         bigint auto_increment
        primary key,
    year       char(4)                            not null comment '년도',
    month      char(2)                            not null comment '월',
    apart_id   bigint                             not null comment '아파트 ID',
    confirmed  int      default 0                 not null comment '확정여부 (0:등록, 1:확정)',
    activated  int      default 1                 not null comment '삭제여부 (0:삭제, 1:사용)',
    created_id bigint                             null comment '등록 사용자 ID',
    updated_id bigint                             null comment '수정 사용자 ID',
    created_at datetime default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '최종 수정일시'
)
    comment '월별아파트강습등록확청처리' charset = utf8mb4;

create table lessons
(
    id            bigint auto_increment
        primary key,
    year          char(4)                                  not null comment '년도',
    month         char(2)                                  not null comment '월',
    apart_id      bigint                                   not null comment '아파트 ID',
    user_id       bigint                                   not null comment '사용자 ID',
    category_id   bigint                                   null comment '강습종목 대분류',
    category_id1  bigint                                   null comment '강수종목 소분류',
    weekday_code  int                                      null comment '요일선택',
    time_code     varchar(10)                              null comment '시간선택',
    commission    decimal(12, 2) default 0.00              null comment '수수료',
    capacity      int            default 0                 null comment '강습정원',
    min_capacity  int            default 0                 null comment '최소정원',
    lesson_price  decimal(12, 2) default 0.00              null comment '강습요금',
    lesson_cnt    int            default 0                 null comment '강습횟수',
    activated     int            default 1                 not null comment '운영 여부 (0:폐강, 1:운영)',
    cancel_reason varchar(200)                             null comment '폐강사유',
    created_at    datetime       default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at    datetime       default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '최종 수정일시'
)
    comment '월별 아파트 강습관리' charset = utf8mb4;

create table members
(
    id         bigint auto_increment
        primary key,
    login      varchar(191)                       not null,
    password   varchar(191)                       null,
    name       varchar(191)                       null,
    email      varchar(191)                       null,
    mobile     varchar(191)                       null,
    aprat_id   bigint                             null comment '아파트 ID',
    address    text                               null comment '아파트 동호수',
    zipcode    varchar(191)                       null,
    sex        varchar(191)                       null,
    birthday   varchar(50)                        null,
    confirmed  int      default 0                 not null comment '인증여부 (0:미인증, 1:인증)',
    activated  int      default 1                 not null comment '삭제여부 (0:삭제, 1:사용)',
    created_at datetime default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '최종 수정일시'
)
    comment '회원정보' charset = utf8mb4;

create index idx_member_aprat_id
    on members (aprat_id);

create table notes
(
    id             int auto_increment
        primary key,
    user_id        int           null,
    content        mediumtext    null,
    note_id        int default 0 not null,
    recommended    int default 0 not null,
    created_at     datetime      not null,
    updated_at     datetime      not null,
    comments_count int default 0 not null,
    keywords       text          null,
    board_id       int default 0 not null,
    title          varchar(191)  null,
    sticky         int default 0 not null,
    hits_count     int default 0 not null,
    kindof         int default 0 not null,
    anon           int default 0 not null,
    ext_guid       varchar(191)  null,
    ext_author     varchar(191)  null,
    deleted        int default 0 not null,
    division       int           null comment '분류(1:서비스, 2:유료/결제, 3:해지/환불/탈퇴, 9:기타)'
)
    charset = utf8mb4;

create index idx_notes_by_bid
    on notes (board_id);

create index idx_notes_by_bid_n_stk
    on notes (board_id, sticky);

create table notes_clips
(
    id         int auto_increment
        primary key,
    note_id    int default 0 not null,
    clip_id    int default 0 not null,
    created_at datetime      not null,
    updated_at datetime      not null
)
    charset = utf8mb4;

create index idx_notes_clips_by_aid
    on notes_clips (note_id);

create index idx_notes_clips_by_eid
    on notes_clips (clip_id);

create table notes_comments
(
    id         int auto_increment
        primary key,
    note_id    int                                not null comment '게시글 ID',
    parent_id  int                                null comment '부모 댓글 ID (대댓글)',
    user_id    int                                null comment '작성자 ID',
    writer     varchar(100)                       null comment '작성자명',
    content    text                               not null comment '댓글 내용',
    created_at datetime default CURRENT_TIMESTAMP not null comment '등록일',
    updated_at datetime                           null on update CURRENT_TIMESTAMP comment '수정일'
)
    comment '게시글 댓글' charset = utf8mb4;

create index idx_note_comments_note_id
    on notes_comments (note_id);

create index idx_note_comments_parent_id
    on notes_comments (parent_id);

create index idx_note_comments_user_id
    on notes_comments (user_id);

create table occupation_positions
(
    id            bigint auto_increment
        primary key,
    occupation_id bigint not null,
    position_id   bigint not null,
    constraint uq_occ_pos
        unique (occupation_id, position_id)
)
    charset = utf8mb4;

create table occupations
(
    id         bigint auto_increment
        primary key,
    code       varchar(64)          not null,
    name       varchar(64)          not null,
    activated  tinyint(1) default 1 not null,
    created_at timestamp            not null,
    updated_at timestamp            not null
)
    charset = utf8mb4;

create table orders
(
    id              bigint auto_increment
        primary key,
    order_no        varchar(50)                           not null comment '주문번호',
    member_id       bigint                                not null comment '회원 ID',
    apart_id        bigint                                null comment '아파트 ID',
    lesson_id       bigint                                null comment '강습 ID',
    order_name      varchar(200)                          not null comment '주문명',
    order_amount    int                                   not null comment '주문금액',
    discount_amount int         default 0                 not null comment '할인금액',
    payment_amount  int                                   not null comment '최종 결제금액',
    order_status    varchar(30) default 'READY'           not null comment 'READY, PAYMENT_PENDING, PAID, CANCELLED, REFUNDED',
    ordered_at      datetime    default CURRENT_TIMESTAMP not null,
    created_at      datetime    default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at      datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '최종 수정일시',
    constraint uk_orders_order_no
        unique (order_no)
)
    comment '주문정보';

create index idx_orders_lesson_id
    on orders (lesson_id);

create index idx_orders_member_id
    on orders (member_id);

create index idx_orders_status
    on orders (order_status);

create table payment_cards
(
    id            bigint auto_increment
        primary key,
    member_id     bigint                               not null,
    billing_key   varchar(200)                         not null,
    card_company  varchar(30)                          null,
    card_bin      varchar(8)                           null,
    card_last4    varchar(4)                           null,
    card_type     varchar(10)                          null,
    is_default    tinyint(1) default 0                 not null,
    is_deleted    tinyint(1) default 0                 not null,
    registered_at datetime   default CURRENT_TIMESTAMP not null,
    deleted_at    datetime                             null,
    created_at    datetime   default CURRENT_TIMESTAMP not null,
    updated_at    datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint uq_payment_cards_billing_key
        unique (billing_key)
);

create index idx_payment_cards_member
    on payment_cards (member_id);

create table payment_methods
(
    id         bigint auto_increment
        primary key,
    code       varchar(10)                          not null,
    name       varchar(50)                          not null,
    is_active  tinyint(1) default 1                 not null,
    sort_order int        default 0                 not null,
    created_at datetime   default CURRENT_TIMESTAMP not null,
    updated_at datetime   default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint code
        unique (code)
);

create table payments
(
    id                bigint auto_increment
        primary key,
    order_id          bigint                                not null comment '주문 ID',
    payment_method_id bigint                                not null,
    payment_card_id   bigint                                null comment 'CARD 결제(빌링키 사용) 시에만 값 존재',
    pg_company        varchar(30) default 'HECTO'           not null comment 'PG사',
    mcht_id           varchar(100)                          null comment '상점 ID',
    mcht_trd_no       varchar(64)                           not null comment '가맹점 거래번호 (요청 시 우리가 채번, 유일값)',
    trd_no            varchar(64)                           null comment '헥토 발급 거래번호(TID) — 승인 후 채워짐',
    payment_method    varchar(30)                           not null comment 'CARD, BANK, VBANK, MOBILE',
    transaction_type  varchar(20)                           not null comment 'PAYMENT, CANCEL, PARTIAL_CANCEL',
    payment_status    varchar(20)                           not null comment 'READY, IN_PROGRESS, DONE, FAILED, CANCELLED',
    amount            int                                   not null comment '결제금액',
    vact_bank_cd      varchar(10)                           null comment '가상계좌은행',
    vact_no           varchar(30)                           null comment '가상계좌번호',
    vact_in_dt        datetime                              null comment '입금기한',
    pkt_hash          varchar(200)                          null comment '해쉬값',
    requested_at      datetime                              not null,
    trd_dt            varchar(8)                            null comment '헥토 응답 거래일자(YYYYMMDD), 원본 보관',
    trd_tm            varchar(6)                            null comment '헥토 응답 거래시각(HHMMSS), 원본 보관',
    approved_at       datetime                              null comment '승인일시',
    result_code       varchar(50)                           null comment 'PG 결과코드',
    result_message    varchar(500)                          null comment 'PG 결과메시지',
    raw_response      json                                  null comment 'PG 응답 원본',
    created_at        datetime    default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at        datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '최종 수정일시',
    constraint mcht_trd_no
        unique (mcht_trd_no),
    constraint fk_payments_card
        foreign key (payment_card_id) references payment_cards (id),
    constraint fk_payments_method
        foreign key (payment_method_id) references payment_methods (id),
    constraint fk_payments_order
        foreign key (order_id) references orders (id)
)
    comment '결제정보';

create index idx_payments_order
    on payments (order_id);

create index idx_payments_status
    on payments (payment_status);

create index idx_payments_trd_no
    on payments (trd_no);

create table permissions
(
    id          bigint auto_increment
        primary key,
    code        varchar(64)          not null,
    name        varchar(64)          not null,
    type        varchar(64)          not null,
    description varchar(255)         null,
    activated   tinyint(1) default 1 not null,
    created_at  timestamp            not null,
    updated_at  timestamp            not null,
    constraint uk_permissions_code
        unique (code)
)
    charset = utf8mb4;

create table persistent_logins_pmx
(
    series    varchar(64) not null
        primary key,
    token     varchar(64) null,
    username  varchar(64) null,
    last_used varchar(64) null
)
    charset = utf8mb4;

create table positions
(
    id         bigint auto_increment
        primary key,
    code       varchar(64)          not null,
    name       varchar(64)          not null,
    activated  tinyint(1) default 1 not null,
    created_at timestamp            not null,
    updated_at timestamp            not null
)
    charset = utf8mb4;

create table refunds
(
    id                 bigint auto_increment
        primary key,
    refund_no          varchar(50)                           not null comment '환불번호',
    payment_id         bigint                                not null comment '결제 ID',
    order_id           bigint                                not null comment '주문 ID',
    member_id          bigint                                not null comment '회원 ID',
    refund_amount      int                                   not null comment '환불금액',
    refund_reason_code varchar(30)                           null comment '환불사유 코드',
    refund_reason      varchar(500)                          null comment '환불사유',
    refund_status      varchar(30) default 'REQUESTED'       not null comment 'REQUESTED, PROCESSING, COMPLETED, FAILED',
    pg_cancel_id       varchar(100)                          null comment 'PG 취소 거래번호',
    result_code        varchar(50)                           null,
    result_message     varchar(500)                          null,
    requested_at       datetime    default CURRENT_TIMESTAMP not null,
    completed_at       datetime                              null,
    requested_by       bigint                                null comment '환불 요청자 ID',
    raw_response       json                                  null,
    created_at         datetime    default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at         datetime    default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '최종 수정일시',
    constraint uk_refunds_refund_no
        unique (refund_no),
    constraint fk_refunds_member
        foreign key (member_id) references members (id),
    constraint fk_refunds_order
        foreign key (order_id) references orders (id),
    constraint fk_refunds_payment
        foreign key (payment_id) references payments (id)
)
    comment '환불정보';

create table roles
(
    id          bigint auto_increment
        primary key,
    code        varchar(120)                         not null,
    name        varchar(200)                         not null,
    position    int        default 0                 not null comment '정렬 순서',
    description varchar(255)                         null,
    activated   tinyint(1) default 1                 not null,
    created_at  timestamp  default CURRENT_TIMESTAMP not null,
    updated_at  timestamp  default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    constraint code
        unique (code)
)
    charset = utf8mb4;

create table role_permissions
(
    id            bigint auto_increment
        primary key,
    role_id       bigint                              not null,
    permission_id bigint                              not null,
    created_at    timestamp default CURRENT_TIMESTAMP not null,
    constraint fk_role_permissions_permission_id
        foreign key (permission_id) references permissions (id)
            on delete cascade,
    constraint fk_role_permissions_role_id
        foreign key (role_id) references roles (id)
            on delete cascade
)
    charset = utf8mb4;

create table user_permissions
(
    id            bigint auto_increment
        primary key,
    user_id       bigint                             not null comment '대상 사용자 ID',
    permission_id bigint                             not null comment '권한 ID',
    mode          enum ('ALLOW', 'DENY')             not null comment '허용/거부',
    created_at    datetime default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at    datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '수정일시',
    constraint fk_userperm_permission
        foreign key (permission_id) references permissions (id)
            on delete cascade
)
    comment '사용자별 권한 부여 테이블' charset = utf8mb4;

create table users
(
    id         int auto_increment
        primary key,
    login      varchar(191)  not null,
    password   varchar(191)  null,
    level      int default 0 not null,
    role_id    int           null comment '권한 ID',
    name       varchar(191)  null,
    email      varchar(191)  null,
    mobile     varchar(191)  null,
    address    text          null,
    zipcode    varchar(191)  null,
    sex        varchar(191)  null,
    birthday   varchar(50)   null,
    activated  int default 1 not null,
    created_at datetime      not null,
    updated_at datetime      not null,
    cover_id   int           null comment '첫번재 COVERID',
    cover_id1  int           null comment '두번재 COVERID'
)
    charset = utf8mb4;

