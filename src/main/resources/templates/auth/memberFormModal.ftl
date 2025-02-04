        <script src="/static/js/pages/auth/memberFormModal.js"></script>
        <!-- modal form -->
        <div id="modal_form" class="bootbox modal fade" data-backdrop="false" tabindex="-1" role="dialog" style="display: none;" aria-modal="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header pb-3">
                        <h4 class="modal-title">편성표 관리</h4>
                        <button type="button" class="close action-close">×</button>
                    </div>
                    <div class="modal-body py-0">
                        <!-- 편성표 직접 입력 -->
                        <div class="card mb-2">
                            <form name="memberForm" id="memberForm"  method="POST">
                                <div class="card-header">
                                    <h5 class="card-title2 font-weight-black"><i class="fas fa-calendar-plus"></i>회원가입</h5>
                                </div>
                                <div class="card-body py-2 px-4">
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>회원구분</label>
                                        <div class="col-sm-10">
                                            <div class="row">
                                                <div class="col-sm-auto">
                                                    <div class="form-check pl-0">
                                                        <label class="form-check-label">
                                                            <input type="radio" name="role" id="role"  value="3" class="mr-1" checked>메니져
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-sm-auto">
                                                    <div class="form-check pl-0">
                                                        <label class="form-check-label">
                                                            <input type="radio" name="role"  id="role" value="1" class="mr-1 ">강사
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>아이디</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <input type="text" name="login" id="login" class="form-control form-control-sm" placeholder="아이디" maxlength="20">
                                                    <button type="button" id="idCheckBtn" class="btns btn_st5" onclick="checkLoginId();" style="width: 20%; float: right;">중복 확인</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>비밀번호</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <input type="password" name="password" id="password"  class="form-control form-control-sm" placeholder="비밀번호" maxlength="30" >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>비밀번호 재입력</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <input type="password" name="password" id="passwordCheck"  class="form-control form-control-sm" placeholder="비밀번호 재입력" maxlength="30" >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                     <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>이름</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <input type="text" name="name" id="name"  class="form-control form-control-sm" placeholder="이름" maxlength="30" >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>성별</label>
                                        <div class="col-sm-10">
                                            <div class="row">
                                                <div class="col-sm-auto">
                                                    <div class="form-check pl-0">
                                                        <label class="form-check-label">
                                                            <input type="radio" name="role" id="sex"  value="M" class="mr-1" checked>남
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-sm-auto">
                                                    <div class="form-check pl-0">
                                                        <label class="form-check-label">
                                                            <input type="radio" name="role"  id="sex" value="F" class="mr-1 ">여
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>생년월일</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <input type="number" name="brithday" id="brithday"  class="form-control form-control-sm" placeholder="숫자 8자리 입력" maxlength="8" >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>주소</label>
                                        <div class="col-sm-10">
                                            <div class="row">
                                                <div class="col-sm-2">
                                                    <div class="row">
                                                        <div class="col-sm-2">
                                                            <input type="number" id="zipcode" name="zipcode" placeholder="숫자 5자리 입력" maxlength="5"/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-sm-8">
                                                    <div class="row">
                                                        <div class="col-sm-8">
                                                            <input type="text" id="address" name="address" class="form-control form-control-sm" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>이메일</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <input type="text" name="email" id="email"  class="form-control form-control-sm" placeholder="숫자 8자리 입력" maxlength="8" >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label class="col-form-label col-sm-2 font-weight-bolder"><i class="icon-arrow-right13"></i>휴대전화</label>
                                        <div class="col-sm-10" >
                                            <div class="row">
                                                <div class="col-sm-4">
                                                    <input type="number" name="tel1" placeholder="" />
                                                    <input type="number" name="tel2" placeholder="" />
                                                    <input type="number" name="tel3" placeholder="" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- button -->
                                <div class="card-bottom px-4">
                                    <div class="row card-btn2">
                                        <div class="col-sm-12">
                                            <div class="breadcrumb justify-content-center">
                                                <a  href="#" class="btn bg-primary submit-modal-form-btn mr-2">
                                                    <i class="icon-floppy-disk mr-1"></i>가입</a>
                                                <a href="#" class="btn btn-light action-close">
                                                    <i class="icon-cross2"></i> 취소</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- /button -->
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- /modal form -->
