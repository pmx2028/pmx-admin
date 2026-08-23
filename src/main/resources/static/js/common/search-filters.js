// /js/common/search-filters.js
// 검색영역(지역/시군구/아파트 등) 셀렉트 공통 로직 - 여러 페이지(apart, order, member, lesson ...)에서 재사용

const $id = (id) => document.getElementById(id);
const getVal = (id) => $id(id)?.value?.trim() ?? "";
const toNumOrNull = (v) => (v === "" || v === "-" ? null : Number(v));

async function fetchJson(url) {
    const token = document.querySelector('meta[name="_csrf"]')?.getAttribute("content");
    const header = document.querySelector('meta[name="_csrf_header"]')?.getAttribute("content") || "X-CSRF-TOKEN";
    const res = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            ...(token ? { [header]: token } : {}),
        },
        credentials: "include",
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.message || `${res.status} ${res.statusText}`);
    return data;
}

// <select> 옵션 채우기 (placeholder + 목록)
export function fillSelect(selectId, items, { placeholder = "전체", placeholderValue = "-" } = {}) {
    const sel = $id(selectId);
    if (!sel) return;
    sel.innerHTML = "";
    const opt0 = document.createElement("option");
    opt0.value = placeholderValue;
    opt0.textContent = placeholder;
    sel.appendChild(opt0);
    (items || []).forEach((item) => {
        const opt = document.createElement("option");
        opt.value = String(item.id);
        opt.textContent = String(item.name);
        sel.appendChild(opt);
    });
}

// API 응답을 {id, name, ...} 리스트로 정규화
export function normalizeList(resp, key) {
    const data = resp?.data?.[key] ?? resp?.data ?? [];
    if (!Array.isArray(data)) return [];
    return data.map((x) => ({
        id: x.id ?? x.value ?? x.key,
        name: x.name ?? x.compName ?? x.title ?? String(x.id ?? ""),
        type: x.type,
        active: x.active,
        virtual: x.virtual,
    }));
}

// 지역(1depth) 조회
export async function loadAddressSelect(selectId, options = {}) {
    const resp = await fetchJson("/api/address");
    const items = normalizeList(resp, "address").map((x) => ({ id: x.id, name: x.name }));
    fillSelect(selectId, items, { placeholder: "전체", placeholderValue: "-", ...options });
}

// 시군구(2depth) 조회
export async function loadAddress1Select(addressId, selectId, options = {}) {
    if (!addressId) {
        fillSelect(selectId, [], { placeholder: "전체", placeholderValue: "-", ...options });
        return;
    }
    const resp = await fetchJson(`/api/address/${addressId}/`);
    const items = normalizeList(resp, "address").map((x) => ({ id: x.id, name: x.name }));
    fillSelect(selectId, items, { placeholder: "시군구를 선택해 주세요", placeholderValue: "-", ...options });
}

// 검색영역 지역/시군구 cascader 초기화
// - 기존 선택값 유지, depth1 변경 시 depth2 목록 재조회
export async function initSearchAddressCascader({
    depth1Id = "search-target-depth1",
    depth2Id = "search-target-depth2",
} = {}) {
    const selectedAddress = getVal(depth1Id);
    const selectedAddress1 = getVal(depth2Id);

    await loadAddressSelect(depth1Id, { placeholder: "전체", placeholderValue: "-" });
    if (selectedAddress && selectedAddress !== "-") {
        $id(depth1Id).value = selectedAddress;
        await loadAddress1Select(selectedAddress, depth2Id, { placeholder: "전체", placeholderValue: "-" });
        $id(depth2Id).value = selectedAddress1 || "-";
    } else {
        fillSelect(depth2Id, [], { placeholder: "전체", placeholderValue: "-" });
    }

    const depth1El = $id(depth1Id);
    if (depth1El) {
        depth1El.onchange = async () => {
            const addressId = toNumOrNull(getVal(depth1Id));
            await loadAddress1Select(addressId, depth2Id, { placeholder: "전체", placeholderValue: "-" });
        };
    }
}

// search-apart-filters 프래그먼트의 "아파트" select 조회
// - 지역/시군구/검색어 + 페이지별 추가 파라메터(extraParams)로 강습 등록된 아파트 목록을 조회해 채움
// - 기존 선택값이 목록에 남아있으면 유지, 없으면 null 반환
export async function loadLessonApartSelect({
    selectId = "search-target-apart",
    depth1Id = "search-target-depth1",
    depth2Id = "search-target-depth2",
    keywordId = "target-text",
    apiUrl = "/api/lessons/confirmed/lesson",
    extraParams = {},
    previousValue = null,
} = {}) {
    const params = new URLSearchParams({
        draw: "1",
        start: "0",
        length: "200",
        ...extraParams,
    });

    const keyword = getVal(keywordId);
    const addressId = getVal(depth1Id);
    const addressId1 = getVal(depth2Id);

    if (keyword) params.set("search_NAME_LIKE", keyword);
    if (addressId && addressId !== "-") params.set("search_ADDRESS_ID_IS", addressId);
    if (addressId1 && addressId1 !== "-") params.set("search_ADDRESS1_ID_IS", addressId1);

    const resp = await fetchJson(`${apiUrl}?${params.toString()}`);
    const data = resp?.data ?? [];
    const items = (Array.isArray(data) ? data : []).map((item) => ({
        id: item.apartId,
        name: item.apartName,
    }));

    fillSelect(selectId, items, { placeholder: "아파트 선택", placeholderValue: "-" });

    const prevId = previousValue != null && previousValue !== "-" ? String(previousValue) : null;
    if (prevId && items.some((item) => String(item.id) === prevId)) {
        $id(selectId).value = prevId;
        return toNumOrNull(prevId);
    }
    return null;
}
