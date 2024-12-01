                                            
                                            <#-- 페이징 parameter 조합 -->
                                            <#assign pageParam = "?">
                                            <#if searchRequest??>
                                                <#list searchRequest as key, value>
                                                    <#if value?? && key != "page">
                                                        <#if key?index = 0>
                                                            <#assign pageParam = pageParam+key+"="+value />
                                                        <#else>
                                                            <#assign pageParam = pageParam+"&"+key+"="+value />
                                                        </#if>
                                                    <#else>
                                                    </#if>
                                                </#list>
                                            </#if>
                                            <#if pageParam != "?" >
                                                <#assign pageUrl = pageUrl+pageParam+"&" />
                                            <#else>
                                                <#assign pageUrl = pageUrl+pageParam />
                                            </#if>

                                            <div class="dataTables_paginate flex-align-self-center">
                                                <ul class="pagination pagination-flat pagination-rounded">
                                                    <#if 1 < paging.nowPageNo?c?number>
                                                        <li class="page-item"><a href="${pageUrl}" class="page-link page-link-small"><i class="fa fa-small fa-angle-double-left"></i></a></li>
                                                    <#else>
                                                        <li class="page-item disabled"><a href="#" class="page-link page-link-small"><i class="fa fa-small fa-angle-double-left"></i></a></li>
                                                    </#if>

                                                    <#if 0 < paging.prevPageNumber?c?number>
                                                        <li class="page-item"><a href="${pageUrl}page=${paging.prevPageNumber?c}" class="page-link page-link-small"><i class="fa fa-small fa-angle-left"></i></a></li>
                                                    <#else>
                                                        <li class="page-item disabled"><a href="#" class="page-link page-link-small"><i class="fa fa-small fa-angle-left"></i></a></li>
                                                    </#if>

                                                    <#list paging.minPageNumber..paging.maxPageNumber as n>
                                                        <#if paging.nowPageNo = n>
                                                            <li class="page-item active"><a href="#" class="page-link page-link-small">${n}</a></li>
                                                        <#else>
                                                            <li class="page-item"><a href="${pageUrl}page=${n?c}" class="page-link page-link-small">${n}</a></li>
                                                        </#if>
                                                    </#list>
                                                    
                                                    <#if 0 < paging.nextPageNumber?c?number>
                                                        <li class="page-item"><a href="${pageUrl}page=${paging.nextPageNumber?c}" class="page-link page-link-small"><i class="fa fa-small fa-angle-right"></i></a></li>
                                                    <#else>
                                                        <li class="page-item disabled"><a href="#" class="page-link page-link-small"><i class="fa fa-small fa-angle-right"></i></a></li>
                                                    </#if>

                                                    <#if paging.nowPageNo?c?number < paging.lastPageNumber?c?number>
                                                        <li class="page-item"><a href="${pageUrl}page=${paging.lastPageNumber?c}" class="page-link page-link-small"><i class="fa fa-small fa-angle-double-right"></i></a></li>
                                                    <#else>
                                                        <li class="page-item disabled"><a href="#" class="page-link page-link-small"><i class="fa fa-small fa-angle-double-right"></i></a></li>
                                                    </#if>
                                                </ul>
                                            </div>