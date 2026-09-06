// /js/common/search-filters.js
// 검색영역(지역/시군구/아파트) 공통 캐스케이딩 로직 - 여러 페이지(apart, order, member, lesson ...)에서 재사용
// 지역 선택 -> 시군구 목록 조회, 시군구 선택 -> 아파트 목록 조회까지만 담당한다.
// 각 화면은 select에 남아있는 선택값을 그대로 읽어서 검색 버튼 클릭 시 자체 검색을 실행한다.

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

// 아파트 select 조회 (범용) - 페이지마다 아파트 목록 API/응답 필드가 다를 수 있어 옵션으로 흡수한다.
// - idKey/nameKey: 응답 아이템에서 select value/label로 쓸 필드명
// - useAddressFilters: depth1Id/depth2Id 현재 선택값을 조회 조건으로 사용할지 여부
export async function loadApartSelect({
    selectId = "search-target-apart",
    depth1Id = "search-target-depth1",
    depth2Id = "search-target-depth2",
    keywordId = null,
    apiUrl = "/api/aparts",
    idKey = "id",
    nameKey = "name",
    length = 500,
    useAddressFilters = true,
    extraParams = {},
    placeholder = "아파트 선택",
    previousValue = null,
} = {}) {
    if (!$id(selectId)) {
        return null;
    }

    if (!apiUrl) {
        fillSelect(selectId, [], { placeholder, placeholderValue: "-" });
        return null;
    }

    const resolvedExtraParams = typeof extraParams === "function" ? extraParams() : extraParams;
    const params = new URLSearchParams({
        draw: "1",
        start: "0",
        length: String(length),
        ...resolvedExtraParams,
    });

    if (useAddressFilters) {
        const addressId = getVal(depth1Id);
        const addressId1 = getVal(depth2Id);
        if (addressId && addressId !== "-") params.set("search_ADDRESS_ID_IS", addressId);
        if (addressId1 && addressId1 !== "-") params.set("search_ADDRESS1_ID_IS", addressId1);
    }

    if (keywordId) {
        const keyword = getVal(keywordId);
        if (keyword) params.set("search_NAME_LIKE", keyword);
    }

    const resp = await fetchJson(`${apiUrl}?${params.toString()}`);
    const data = resp?.data ?? [];
    const items = (Array.isArray(data) ? data : []).map((item) => ({
        id: item[idKey],
        name: item[nameKey],
    }));

    fillSelect(selectId, items, { placeholder, placeholderValue: "-" });

    const prevId = previousValue != null && previousValue !== "-" ? String(previousValue) : null;
    if (prevId && items.some((item) => String(item.id) === prevId)) {
        $id(selectId).value = prevId;
        return toNumOrNull(prevId);
    }
    return null;
}

// 검색영역 지역/시군구/아파트 캐스케이딩 초기화
// - 지역(depth1) 변경 -> 시군구(depth2) 목록 재조회 (+ 아파트 select 초기화)
// - 시군구(depth2) 변경 -> 아파트(apartId) 목록 재조회
// - apartId에 해당하는 select가 페이지에 없으면 아파트 관련 동작은 전부 건너뜀
// - onApartChange(selectedApartId)로 각 페이지의 PageState 등에 선택된 아파트 id를 동기화할 수 있음
// - initialApartValue: 최초 진입시 미리 선택돼 있어야 하는 아파트 id (예: URL 쿼리파라미터로 넘어온 apartId)
// - 지역(depth1) select 자체가 화면에 없으면(강사/매니저 - search-apart-filters.html 참고) 주소 필터 없이
//   restrictedApartApiUrl(본인이 등록된 아파트만 반환)로 아파트 select를 바로 구성한다.
export async function initSearchAddressCascader({
    depth1Id = "search-target-depth1",
    depth2Id = "search-target-depth2",
    apartId = "search-target-apart",
    apartOptions = {},
    restrictedApartApiUrl = "/api/apart-user/userApart",
    initialApartValue = null,
    onApartChange = null,
} = {}) {
    const selectedAddress = getVal(depth1Id);
    const selectedAddress1 = getVal(depth2Id);
    const selectedApart = initialApartValue != null ? initialApartValue : getVal(apartId);
    const hasApartSelect = Boolean($id(apartId));
    const hasAddressSelect = Boolean($id(depth1Id));

    if (hasAddressSelect) {
        await loadAddressSelect(depth1Id, { placeholder: "전체", placeholderValue: "-" });
        if (selectedAddress && selectedAddress !== "-") {
            $id(depth1Id).value = selectedAddress;
            await loadAddress1Select(selectedAddress, depth2Id, { placeholder: "전체", placeholderValue: "-" });
            $id(depth2Id).value = selectedAddress1 || "-";
        } else {
            fillSelect(depth2Id, [], { placeholder: "전체", placeholderValue: "-" });
        }
    }

    const resolvedApartOptions = hasAddressSelect
        ? apartOptions
        : {
            apiUrl: restrictedApartApiUrl,
            idKey: "id",
            nameKey: "name",
            useAddressFilters: false,
            placeholder: apartOptions.placeholder ?? "아파트 선택",
        };

    const reloadApart = async (previousValue) => {
        const selectedApartId = await loadApartSelect({
            selectId: apartId,
            depth1Id,
            depth2Id,
            previousValue,
            ...resolvedApartOptions,
        });
        onApartChange?.(selectedApartId);
        return selectedApartId;
    };

    if (hasApartSelect) {
        await reloadApart(selectedApart);
    }

    const depth1El = $id(depth1Id);
    if (depth1El) {
        depth1El.onchange = async () => {
            const addressId = toNumOrNull(getVal(depth1Id));
            await loadAddress1Select(addressId, depth2Id, { placeholder: "전체", placeholderValue: "-" });
            if (hasApartSelect) {
                await reloadApart(null);
            }
        };
    }

    const depth2El = $id(depth2Id);
    if (depth2El && hasApartSelect) {
        depth2El.onchange = async () => {
            await reloadApart(null);
        };
    }
}
