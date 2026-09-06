import { loadDataTable } from "../common/datatable-handler.js";
import { fillSelect, initSearchAddressCascader } from "../common/search-filters.js";

const PageState = {
    selectedApartId: null,
};

document.addEventListener("DOMContentLoaded", async () => {
    initYearMonthSearch();
    await initSearchAddressCascader({
        apartOptions: getLessonApartOptions(),
        onApartChange: (apartId) => {
            PageState.selectedApartId = apartId;
            updateSearchButtonState();
        },
    });
    bindSearchEvents();
    updateSearchButtonState();
    reloadConfirmedTable();
});

// 연도/월/아파트가 모두 선택되어야 검색 가능
function canSearch() {
    const year = getVal("search-year");
    const month = getVal("search-month");
    return Boolean(year) && Boolean(month) ;
    // const apartId = PageState.selectedApartId ?? toNumOrNull(getVal("search-target-apart"));
    // return Boolean(year) && Boolean(month) && apartId != null;
}

function updateSearchButtonState() {
    const btn = $id("btn-search");
    if (!btn) return;

    const enabled = canSearch();
    btn.disabled = !enabled;
    btn.title = enabled ? "" : "연도, 월, 아파트를 모두 선택해 주세요.";
}

function getLessonApartOptions() {
    return {
        apiUrl: "/api/lessons/confirmed/lesson",
        idKey: "apartId",
        nameKey: "apartName",
        length: 200,
        keywordId: "target-text",
        extraParams: () => ({
            search_YEAR_IS: getVal("search-year"),
            search_MONTH_IS: getVal("search-month"),
        }),
    };
}

function initYearMonthSearch() {
    const now = new Date();
    setVal("search-year", now.getFullYear());

    const monthSelect = $id("search-month");
    if (!monthSelect) return;

    monthSelect.innerHTML = "";
    for (let i = 1; i <= 12; i += 1) {
        const value = String(i).padStart(2, "0");
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = `${i}월`;
        monthSelect.appendChild(opt);
    }
    monthSelect.value = String(now.getMonth() + 1).padStart(2, "0");
}

function bindSearchEvents() {
    const runSearch = () => {
        if (!canSearch()) return;
        reloadConfirmedTable(true);
    };

    $id("btn-search")?.addEventListener("click", runSearch);
    $id("btn-reset")?.addEventListener("click", async () => {
        setVal("search-target-depth1", "-");
        setVal("search-target-apart", "-");
        fillSelect("search-target-depth2", [], { placeholder: "전체", placeholderValue: "-" });
        setVal("search-target-lesson-type", "-");
        setVal("search-target-confirmed", "-");
        setVal("target-text", "");
        initYearMonthSearch();
        PageState.selectedApartId = null;
        await initSearchAddressCascader({
            apartOptions: getLessonApartOptions(),
            onApartChange: (apartId) => {
                PageState.selectedApartId = apartId;
                updateSearchButtonState();
            },
        });
        updateSearchButtonState();
        reloadConfirmedTable(true);
    });

    $id("target-text")?.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        runSearch();
    });

    $id("search-year")?.addEventListener("input", updateSearchButtonState);
    $id("search-month")?.addEventListener("change", updateSearchButtonState);
    $id("search-target-apart")?.addEventListener("change", updateSearchButtonState);
}

function reloadConfirmedTable(resetPage = false) {
    const tableId = "apartConfirmedDataTable";
    const $table = $(`#${tableId}`);

    if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().ajax.reload(null, resetPage);
        return;
    }

    loadDataTable({
        tableId,
        ajaxUrl: "/api/lessons/confirmed/lesson",
        columns: getConfirmedTableColumns(),
        defaultOrderIndex: null,
        minTableWidth: 900,
        getExtraDataFn: getConfirmedSearchParams,
        enableOrdering: false,
        mobileBreakpoint: 640,
        enableCardView: true,
        enableResponsive: false,
        titleColumnName: "아파트",
        onDrawCallbackList: [bindConfirmedTableLinkEvents],
        extraOptions: {
            dom: "rtip",
            pageLength: 10,
        },
    });
}

function getConfirmedSearchParams() {
    const apartId = PageState.selectedApartId ?? toNumOrNull(getVal("search-target-apart"));
    const addressId = toNumOrNull(getVal("search-target-depth1"));
    const addressId1 = toNumOrNull(getVal("search-target-depth2"));

    const keyword = getVal("target-text");
    const params = {
        search_YEAR_IS: getVal("search-year"),
        search_MONTH_IS: getVal("search-month"),
    };
    if (apartId != null) {
        params.search_APART_ID_IS = apartId;
    }
    if (addressId != null) {
        params.search_ADDRESS_ID_IS = addressId;
    }
    if (addressId1 != null) {
        params.search_ADDRESS1_ID_IS = addressId1;
    }
    if (keyword) {
        params.search_NAME_LIKE = keyword;
    }
    return params;
}

function getConfirmedTableColumns() {
    return [
        textColumn("addressName", "지역", "8%"),
        textColumn("addressName1", "시군구", "8%"),
        {
            data: "apartName",
            title: "아파트",
            width: "28%",
            render: (value, type, row) => {
                if (value == null || value === "") return "-";
                return `
                    <a href="${escapeAttr(buildLessonLink(row))}" class="link-primary fw-semibold">
                        ${escapeHtml(value)}
                    </a>
                `;
            },
        },
        textColumn("year", "연도", "12%"),
        textColumn("month", "월", "10%"),
        textColumn("gxConfirmedName", "GX" , "10%"),
        textColumn("healthConfirmedName", "핼스", "10%"),
        textColumn("golfConfirmedName", "골프" ,"10%"),
        textColumn("tuniConfirmedName", "트니트니" , "10%"),

    ];
}

function buildLessonLink(row) {
    const params = new URLSearchParams();
    const year = row?.year ?? getVal("search-year");
    const month = row?.month ?? getVal("search-month");
    const apartId = row?.apartId;
    const confirmed = row?.confirmed;

    if (year != null && year !== "") params.set("year", String(year));
    if (month != null && month !== "") params.set("month", String(month));
    if (apartId != null && apartId !== "") params.set("apartId", String(apartId));
    params.set("confirmed", confirmed == null ? "" : String(confirmed));

    const query = params.toString();
    return `/lesson/lesson${query ? `?${query}` : ""}`;
}

function bindConfirmedTableLinkEvents(api) {
    const tableId = "apartConfirmedDataTable";
    document.querySelectorAll(`#${tableId} tbody tr`).forEach((tr) => {
        if (tr.classList.contains("child")) return;

        const rowData = api.row(tr).data();
        if (!rowData) return;

        const href = buildLessonLink(rowData);
        tr.style.cursor = "pointer";
        tr.querySelectorAll("td").forEach((cell) => {
            cell.onclick = (e) => {
                if (e.target.closest("a, button, input, select, textarea")) return;
                window.location.href = href;
            };
        });
    });
}

function confirmedStatusColumn(data, title) {
    const badgeClassByStatus = {
        마감: "bg-success",
        확정: "bg-success",
        등록: "bg-success",
    };

    return {
        data,
        title,
        width: "14%",
        render: (value) => {
            const status = value || "미등록";
            const badgeClass = badgeClassByStatus[status] ?? "bg-secondary";
            return `<span class="badge ${badgeClass}">${escapeHtml(status)}</span>`;
        },
    };
}

function textColumn(data, title, width, formatter = null) {
    return {
        data,
        title,
        width,
        defaultContent: "-",
        render: (value) => {
            const rendered = formatter ? formatter(value) : value;
            return rendered == null || rendered === "" ? "-" : escapeHtml(rendered);
        },
    };
}

function setVal(id, value) {
    const el = $id(id);
    if (el) el.value = value ?? "";
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
    return escapeHtml(value);
}

const $id = (id) => document.getElementById(id);
const getVal = (id) => $id(id)?.value?.trim() ?? "";
const toNumOrNull = (value) => value === "" || value === "-" || value == null ? null : Number(value);
