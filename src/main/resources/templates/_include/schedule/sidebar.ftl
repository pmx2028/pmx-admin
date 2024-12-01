<div class="sidebar sidebar-dark sidebar-main sidebar-expand-lg">
    <!-- Sidebar content -->
    <div class="sidebar-content">
        <!-- Main navigation -->
        <div class="sidebar-section">
            <ul class="nav nav-sidebar" data-nav-type="accordion">

                <!-- Main -->
                <li class="nav-item"  data-toggle="tooltip" data-placement="top" title="schedule">
                    <a href="/" class="nav-link ${_selfUri?starts_with('/')?string('active','')}"><i class="icon-tv"></i>PMX</a>
                </li>
                <!-- /main -->
                <li class="nav-item  ${_selfUri?starts_with('/tvcms/schedule/schedule')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="강사/메니져관리">
                    <a href="/tvcms/schedule/schedule" class="nav-link"><i class="icon-calendar2"></i>강사/메니져관리</a>
                </li>

                <li class="nav-item  ${_selfUri?starts_with('/tvcms/schedule/search')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="회원관리">
                    <a href="/tvcms/schedule/search" class="nav-link"><i class="icon-search4"></i>회원관리</a>
                </li>
                <li class="nav-item ${_selfUri?starts_with('/tvcms/schedule/form')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="아파트관리">
                    <a href="/tvcms/schedule/form" class="nav-link"><i class="far fa-calendar-plus"></i>아파트관리</a>
                </li>
                <li class="nav-item  ${_selfUri?starts_with('/tvcms/tvPrograms')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="아파트회원관리">
                    <a href="/tvcms/tvPrograms" class="nav-link"><i class="icon-tree6"></i>아파트회원관리</a>
                </li>

                <li class="nav-item ${_selfUri?starts_with('/tvcms/tvVods')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="강습관리">
                    <a href="/tvcms/tvVods" class="nav-link" ><i class="icon-video-camera3"></i>강습관리</a>
                </li>
                 <li class="nav-item ${_selfUri?starts_with('/tvcms/tvVods')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="환불관리">
                    <a href="/tvcms/tvVods" class="nav-link" ><i class="icon-video-camera3"></i>환불관리</a>
                </li>
                 <li class="nav-item ${_selfUri?starts_with('/tvcms/tvVods')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="정산관리">
                    <a href="/tvcms/tvVods" class="nav-link" ><i class="icon-video-camera3"></i>정산관리</a>
                </li>
                 <li class="nav-item ${_selfUri?starts_with('/tvcms/tvVods')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="공지관리">
                    <a href="/tvcms/tvVods" class="nav-link" ><i class="icon-video-camera3"></i>공지관리</a>
                </li>
                 <li class="nav-item ${_selfUri?starts_with('/tvcms/tvVods')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="커뮤니티관리">
                    <a href="/tvcms/tvVods" class="nav-link" ><i class="icon-video-camera3"></i>커뮤니티관리</a>
                </li>
                 <li class="nav-item ${_selfUri?starts_with('/tvcms/tvVods')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="통계관리">
                    <a href="/tvcms/tvVods" class="nav-link" ><i class="icon-video-camera3"></i>통계관리</a>
                </li>

               <#--  <li class="nav-item ${_selfUri?starts_with('/schedule/excel')?string('nav-item-expanded nav-item-open','')}" data-toggle="tooltip" data-placement="top" title="엑셀 일괄 업로드">
                    <a href="#" class="nav-link" onclick="location.href='/schedule/excel';"><i class="icon-file-upload2"></i>엑셀 일괄 업로드</a>
                </li>  -->

            </ul>
        </div>
        <!-- /main navigation -->
    </div>
    <div class="calculator"></div>
    <!-- /sidebar content -->
</div>
