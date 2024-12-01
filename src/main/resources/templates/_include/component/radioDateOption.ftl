<script>
    $(document).ready(function(){
        //버튼모양 그리기.
        var _innerHtml = "";
        var _zeroIdx = ""; //직접입력 index
        $.each( dtOptionJson, function( index, key ) {
            _innerHtml += '<input type="radio" id="dtOption_'+key.value+'" name="dtOption" value="'+key.value+'" class="d-none" ';
            if (_parameterDtOption == key.value){
                _innerHtml += 'checked';
            }
            _innerHtml += '>';
            _innerHtml += '<label for="dtOption_'+key.value+'" class="px-2 btn btn-outline bg-danger-400 text-danger-400 border-danger-400 font-size-xs mr-1 action-dtbox ';
            if (_parameterDtOption == key.value){
                _innerHtml += 'active';
            }
            _innerHtml += '">'+key.name+'</label>';

            if (key.value == 0) {
                _zeroIdx = index;
            }
        });
        $("#radioDateOption").html(_innerHtml);

        $("input[name='"+_startDt+"'], input[name='"+_endDt+"']").on("input", function(e) {
            resetBtnActive();
            $("input[name='dtOption']:radio[value='0']").prop("checked",true);
            $("#radioDateOption").find($(".action-dtbox")).each (function (index, el){
                if (index == _zeroIdx) {
                    $(el).addClass("active");
                }
            });
        });
        
        $(".action-dtbox").on("click", function (e) {
            resetBtnActive();

            /*** 날짜 범위값 넣기. **/
            //선택한 개월 value
            var _dtOptionVal = $("#"+$(this)[0].getAttribute("for")).val();
            var startDtVal = "";
            var endDtVal = nowDate();

            if (_dtOptionVal == "0") {
                startDtVal = "";
                endDtVal = "";

            } else {
                startDtVal = lastMonth(_dtOptionVal);
            }

            $("#"+_startDt).val(startDtVal);
            $("#"+_endDt).val(endDtVal);

            //클릭한 버튼 active
            $(this).addClass("active");
        });

        function resetBtnActive(){
            //범위 button active class 삭제
            $("#radioDateOption").find($(".action-dtbox")).each (function (index, el){
                $(el).removeClass("active");
            });
        }
    });
</script>
<div id="radioDateOption"></div>