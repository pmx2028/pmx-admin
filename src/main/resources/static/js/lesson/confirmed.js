import { loadDataTable } from "../common/datatable-handler.js";
import { loadLessonApartSelect } from "../common/search-filters.js";

const PageState = {
    selectedApartId: null,
};

document.addEventListener("DOMContentLoaded", async () => {
    initYearMonthSearch();
    await initSearchAddressCascader();
    fillSelect("search-target-apart", [], { placeholder: "아파트 선택", placeholderValue: "-" });
    bindSearchEvents();
    reloadConfirmedTable();
});

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

async function initSearchAddressCascader() {
    await loadAddressSelect("search-target-depth1", { placeholder: "전체", placeholderValue: "-" });
    fillSelect("search-target-depth2", [], { placeholder: "전체", placeholderValue: "-" });

    $id("search-target-depth1")?.addEventListener("change", async () => {
        const addressId = toNumOrNull(getVal("search-target-depth1"));
        await loadAddress1Select(addressId, "search-target-depth2", { placeholder: "전체", placeholderValue: "-" });
    });

    // 시군구 선택 시 해당 지역의 아파트 목록으로 갱신
    $id("search-target-depth2")?.addEventListener("change", async () => {
        await reloadApartSelect();
    });
}

function bindSearchEvents() {
    const runSearch = async () => {
        await reloadApartSelect();
        reloadConfirmedTable(true);
    };

    $id("btn-search")?.addEventListener("click", runSearch);
    $id("btn-reset")?.addEventListener("click", async () => {
        setVal("search-target-depth1", "-");
        fillSelect("search-target-depth2", [], { placeholder: "전체", placeholderValue: "-" });
        setVal("search-target-apart", "-");
        setVal("search-target-confirmed", "-");
        setVal("target-text", "");
        initYearMonthSearch();
        PageState.selectedApartId = null;
        await reloadApartSelect();
        reloadConfirmedTable(true);
    });

    $id("target-text")?.addEventListener("keydown", async (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        await runSearch();
    });
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
    const confirmed = getVal("search-target-confirmed");
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
    if (confirmed !== "-") {
        params.search_CONFIRMED_IS = confirmed;
    }
    return params;
}

function getConfirmedTableColumns() {
    return [
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
        textColumn("addressId", "지역", "8%"),
        textColumn("addressId1", "시군구", "8%"),
        textColumn("year", "연도", "12%"),
        textColumn("month", "월", "10%"),
        {
            data: "confirmed",
            title: "확정여부",
            width: "14%",
            render: (value) => {
                if (Number(value) === 1) {
                    return '<span class="badge bg-success">확정</span>';
                }else if (Number(value) === 0) {
                    return '<span class="badge bg-success">등록</span>';
                }
                return '<span class="badge bg-secondary">미등록</span>';
            },
        },
        textColumn("confirmedActivated", "상태", "10%", (value) => {
            if (value == null) return "-";
            return Number(value) === 1 ? "사용" : "삭제";
        }),
        textColumn("createdAt", "등록일", "18%"),
        textColumn("updatedAt", "수정일", "18%"),
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

async function reloadApartSelect() {
    const previousApartId = getVal("search-target-apart");
    const confirmed = getVal("search-target-confirmed");

    const selectedApartId = await loadLessonApartSelect({
        extraParams: confirmed !== "-" ? { search_CONFIRMED_IS: confirmed } : {},
        previousValue: previousApartId,
    });

    PageState.selectedApartId = selectedApartId;
}

async function loadAddressSelect(selectId, options = {}) {
    const resp = await fetchJson("/api/address");
    const items = normalizeList(resp).map((item) => ({
        id: item.id,
        name: item.name,
    }));
    fillSelect(selectId, items, { placeholder: "전체", placeholderValue: "-", ...options });
}

async function loadAddress1Select(addressId, selectId, options = {}) {
    if (!addressId) {
        fillSelect(selectId, [], { placeholder: "전체", placeholderValue: "-", ...options });
        return;
    }

    const resp = await fetchJson(`/api/address/${addressId}/`);
    const items = normalizeList(resp).map((item) => ({
        id: item.id,
        name: item.name,
    }));
    fillSelect(selectId, items, { placeholder: "전체", placeholderValue: "-", ...options });
}

async function fetchJson(url) {
    const csrf = getCsrf();
    const res = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            ...(csrf ? { [csrf.header]: csrf.token } : {}),
        },
        credentials: "include",
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.message || `${res.status} ${res.statusText}`);
    return data;
}

function getCsrf() {
    const token = document.querySelector('meta[name="_csrf"]')?.getAttribute("content");
    const header = document.querySelector('meta[name="_csrf_header"]')?.getAttribute("content") || "X-CSRF-TOKEN";
    return token ? { header, token } : null;
}

function normalizeList(resp) {
    const data = resp?.data ?? [];
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
        id: item.id ?? item.value ?? item.key,
        name: item.name ?? item.title ?? String(item.id ?? ""),
        ...item,
    }));
}

function fillSelect(selectId, items, { placeholder = "전체", placeholderValue = "-" } = {}) {
    const select = $id(selectId);
    if (!select) return;

    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = placeholderValue;
    defaultOption.textContent = placeholder;
    select.appendChild(defaultOption);

    (items || []).forEach((item) => {
        const option = document.createElement("option");
        option.value = String(item.id);
        option.textContent = String(item.name);
        select.appendChild(option);
    });
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
