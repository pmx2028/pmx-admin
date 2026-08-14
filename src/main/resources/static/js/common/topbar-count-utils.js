export async function loadDeskArticleState() {
    // 데스크용 기사상태 카운트 로딩
    try {
        const res = await fetch('/api/topbar/desk/articles/stats');
        const result = await res.json();
        const data = result.data;

        // profile dropdown 데일리 기사 state 수
        document.querySelectorAll('.desk-state [data-state]').forEach(tab => {
            const state = tab.getAttribute('data-state');
            // console.log(tab);
            tab.textContent = data[state] || 0;
        });

    } catch (err) {
        console.error('상태 카운트 로딩 실패:', err);
    }
}

export async function loadReporterArticleState() {
    // daily 기사상태 로딩
    try {
        const res = await fetch('/api/topbar/reporter/articles/stats');
        const result = await res.json();
        const data = result.data;

        // topbar 데일리 기사 state 수
        document.querySelectorAll('#bar-state [data-state]').forEach(tab => {
            const state = tab.getAttribute('data-state');
            tab.textContent = data[state] || 0;
        });

    } catch (err) {
        console.error('상태 카운트 로딩 실패:', err);
    }
}