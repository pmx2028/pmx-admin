<div class="sidebar sidebar-dark sidebar-main sidebar-expand-lg">

    <!-- Sidebar content -->
    <div class="sidebar-content">
        <!-- User menu -->
        <#--  <div class="sidebar-section sidebar-user my-1">
            <div class="sidebar-section-body">
                <div class="media">
                    <a href="#" class="mr-3">
                        <img src="../../../../global_assets/images/demo/users/face11.jpg" class="rounded-circle" alt="">
                    </a>

                    <div class="media-body">
                        <div class="font-weight-semibold">Victoria Baker</div>
                        <div class="font-size-sm line-height-sm opacity-50">
                            Senior developer
                        </div>
                    </div>

                    <div class="ml-3 align-self-center">
                        <button type="button" class="btn btn-outline-light-100 text-white border-transparent btn-icon rounded-pill btn-sm sidebar-control sidebar-main-resize d-none d-lg-inline-flex">
                            <i class="icon-transmission"></i>
                        </button>

                        <button type="button" class="btn btn-outline-light-100 text-white border-transparent btn-icon rounded-pill btn-sm sidebar-mobile-main-toggle d-lg-none">
                            <i class="icon-cross2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>  -->
        <!-- /user menu -->

        <!-- Main navigation -->
        <div class="sidebar-section">
            <ul class="nav nav-sidebar" data-nav-type="accordion">

                <!-- Main -->
                <li class="nav-item"  data-toggle="tooltip" data-placement="top" title="Support">
                    <a href="/support/corporation/normal" class="nav-link ${_selfUri?starts_with('/support')?string('active','')}"><i class="icon-puzzle4"></i>CRM</a>
                </li>
                <!-- /main -->
                <li class="nav-item nav-item-submenu ${_selfUri?starts_with('/support/corporation')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="기업회원관리">
                    <a href="#" class="nav-link" onclick="location.href='/support/corporation/normal';"><i class="far fa-building mr-2"></i>기업회원관리</a>
                    <ul class="nav nav-group-sub " data-submenu-title="기업회원관리">
                        <li class="nav-item">
                            <a href="/support/corporation/normal" class="nav-link ${_selfUri?starts_with('/support/corporation/normal')?string('active','')}" data-toggle="tooltip" data-placement="top" title="기업/IR회원">
                                <i class="icon-arrow-right14"></i>기업/IR
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/support/corporation/trial" class="nav-link ${_selfUri?starts_with('/support/corporation/trial')?string('active','')}" data-toggle="tooltip" data-placement="top" title="트라이얼회원">
                                <i class="icon-arrow-right14"></i>트라이얼
                            </a>
                        </li>
                         <li class="nav-item">
                            <a href="/support/corporation/quit " class="nav-link ${_selfUri?starts_with('/support/corporation/quit')?string('active','')}" data-toggle="tooltip" data-placement="top" title="탈퇴처리회원">
                                <i class="icon-arrow-right14"></i>탈퇴
                            </a>
                        </li>
                        <#--  <li class="nav-item">
                            <a href="#" class="nav-link" onclick="alert('CMS를 이용해주세요.');" data-toggle="tooltip" data-placement="top" title="트라이얼회원">
                                <i class="icon-arrow-right14"></i>트라이얼
                            </a>
                        </li>  -->
                    </ul>
                </li>
                <li class="nav-item nav-item-submenu ${_selfUri?starts_with('/support/individual')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="D+ 개인회원관리">
                    <a href="#" class="nav-link" onclick="location.href='/support/individual/member';"><i class="icon-users4 mr-1"></i>D+ 개인회원관리</a>
                    <ul class="nav nav-group-sub " data-submenu-title="D+ 개인회원관리">
                        <li class="nav-item">
                            <a href="/support/individual/member" class="nav-link ${_selfUri?starts_with('/support/individual/member')?string('active','')}" data-toggle="tooltip" data-placement="top" title="유료회원">
                                <i class="icon-arrow-right14"></i>유료/무료
                            </a>
                        </li>
                        <#--  <li class="nav-item">
                            <a href="/support/individual/promotion" class="nav-link ${_selfUri?starts_with('/support/individual/promotion')?string('active','')}" data-toggle="tooltip" data-placement="top" title="프로모션회원">
                                <i class="icon-arrow-right14"></i>무료 (프로모션)
                            </a>
                        </li>  -->
                        <li class="nav-item">
                            <a href="/support/individual/dormancy" class="nav-link ${_selfUri?starts_with('/support/individual/dormancy')?string('active','')}" data-toggle="tooltip" data-placement="top" title="휴면회원">
                                <i class="icon-arrow-right14"></i>휴면
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/support/individual/quit" class="nav-link ${_selfUri?starts_with('/support/individual/quit')?string('active','')}" data-toggle="tooltip" data-placement="top" title="탈퇴회원">
                                <i class="icon-arrow-right14"></i>탈퇴
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/support/individual/delete" class="nav-link ${_selfUri?starts_with('/support/individual/delete')?string('active','')}" data-toggle="tooltip" data-placement="top" title="탈퇴회원">
                                <i class="icon-arrow-right14"></i>삭제된 회원
                            </a>
                        </li>
                        <#--  <li class="nav-item">
                            <a href="/datacenter/house/mez" class="nav-link ${_selfUri?starts_with('/datacenter/house/mez')?string('active','')}" data-toggle="tooltip" data-placement="top" title="메자닌">
                                <i class="icon-arrow-right14"></i>삭제예정
                            </a>
                        </li>  -->
                    </ul>
                </li>
                <li class="nav-item nav-item-submenu ${_selfUri?starts_with('/support/membership')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="D 개인회원관리">
                    <a href="#" class="nav-link" onclick="location.href='/support/membership/member';"><i class="fas fa-solid fa-user mr-1" ></i>D 개인회원관리</a>
                    <ul class="nav nav-group-sub " data-submenu-title="D 개인회원관리">
                        <li class="nav-item">
                            <a href="/support/membership/member" class="nav-link ${_selfUri?starts_with('/support/membership/member')?string('active','')}" data-toggle="tooltip" data-placement="top" title="유료회원">
                                <i class="icon-arrow-right14"></i>회원관리
                            </a>
                        </li>
                        <#--  <li class="nav-item">
                            <a href="/support/membership/dormancy" class="nav-link ${_selfUri?starts_with('/support/membership/dormancy')?string('active','')}" data-toggle="tooltip" data-placement="top" title="휴면회원">
                                <i class="icon-arrow-right14"></i>휴면
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/support/membership/quit" class="nav-link ${_selfUri?starts_with('/support/membership/quit')?string('active','')}" data-toggle="tooltip" data-placement="top" title="탈퇴회원">
                                <i class="icon-arrow-right14"></i>탈퇴
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/support/membership/delete" class="nav-link ${_selfUri?starts_with('/support/membership/delete')?string('active','')}" data-toggle="tooltip" data-placement="top" title="탈퇴회원">
                                <i class="icon-arrow-right14"></i>삭제된 회원
                            </a>
                        </li>  -->
                    </ul>
                </li>
                <li class="nav-item  ${_selfUri?starts_with('/support/promotion')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="프로모션관리">
                    <a href="#" class="nav-link" onclick="location.href='/support/promotion';"><i class="fas fa-gift"></i>프로모션관리</a>
                </li>

                <li class="nav-item nav-item-submenu ${_selfUri?starts_with('/support/coupon')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="Cert.Key관리">
                    <a href="#" class="nav-link" onclick="location.href='/support/coupon/issued';"><i class="fas fa-solid fa-key"></i>Cert.Key관리</a> 
                    <ul class="nav nav-group-sub " data-submenu-title="Cert.Key관리">
                        <li class="nav-item">
                            <a href="/support/coupon/issued" class="nav-link ${_selfUri?starts_with('/support/coupon/issued')?string('active','')}" data-toggle="tooltip" data-placement="top" title="Key 발급·등록현황">
                                <i class="icon-arrow-right14"></i>Key 발급·등록현황

                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/support/coupon/sales" class="nav-link ${_selfUri?starts_with('/support/coupon/sales')?string('active','')}" data-toggle="tooltip" data-placement="top" title="전환·매출현황">
                                <i class="icon-arrow-right14"></i>전환·매출현황
                            </a>
                        </li>
                    </ul>
                </li>

                <li class="nav-item nav-item-submenu ${_selfUri?starts_with('/support/orders')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="매출관리">
                    <a href="#" class="nav-link" onclick="location.href='/support/orders/sales';"><i class="icon-stats-growth mr-2"></i>매출관리</a> 
                    <ul class="nav nav-group-sub " data-submenu-title="매출관리">
                        <li class="nav-item">
                            <a href="/support/orders/sales" class="nav-link ${_selfUri?starts_with('/support/orders/sales')?string('active','')}" data-toggle="tooltip" data-placement="top" title="결제내역">
                                <i class="icon-arrow-right14"></i>결제내역
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="/support/orders/cancel" class="nav-link ${_selfUri?starts_with('/support/orders/cancel')?string('active','')}" data-toggle="tooltip" data-placement="top" title="결제취소">
                                <i class="icon-arrow-right14"></i>결제취소
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <!-- /main navigation -->
    </div>
    <!-- /sidebar content -->
</div>