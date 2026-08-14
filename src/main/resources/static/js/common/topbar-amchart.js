document.addEventListener('DOMContentLoaded', function() {
    const chartCollapseElement = document.getElementById('chart-bar');
    const chartContainer = document.getElementById('chartdiv');
    if (!chartCollapseElement) return;

    if (chartContainer) {
        chartContainer.addEventListener('wheel', function (event) {
            event.preventDefault();
            event.stopPropagation();
        }, { passive: false });
    }

    document.addEventListener('click', function (event) {
        if (!chartCollapseElement.classList.contains('show')) {
            return;
        }

        const clickedToggle = event.target.closest('[data-bs-target="#chart-bar"], [aria-controls="chart-bar"]');
        const clickedInsideChart = chartCollapseElement.contains(event.target);

        if (!clickedToggle && !clickedInsideChart) {
            bootstrap.Collapse.getOrCreateInstance(chartCollapseElement, { toggle: false }).hide();
        }
    });

    // 1. 초기화: 기존 차트 인스턴스 제거
    chartCollapseElement.addEventListener('show.bs.collapse', function () {
        if (window.myChartRoot) {
            window.myChartRoot.dispose();
            window.myChartRoot = null;
        }
    });

    // 2. 실행: 열린 후 데이터 로드 및 렌더링
    chartCollapseElement.addEventListener('shown.bs.collapse', function () {
        const userDeptIdInput = document.getElementById("loginUserDepartmentId");
        const userDeptId = userDeptIdInput ? userDeptIdInput.value : "";

        fetch('/api/topbar/chart')
            .then(response => response.json())
            .then(res => {
                const apiData = res.data || []; // ResponseDto의 data 필드 접근

                // 06:00 ~ 19:00 고정 레이아웃 생성
                const hours = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

                const chartData = hours.map(h => {
                    const found = apiData.find(d => d.time === h);
                    // 부서 카운트 추출 (userDeptId가 키값임)
                    let myDeptCount = 0;
                    if (found && found.depts) {
                        myDeptCount = found.depts[userDeptId] || 0;
                    }

                    return {
                        Time: h,
                        value1: found ? found.total : 0,
                        value2: myDeptCount
                    };
                });

                // 데이터가 준비된 후 차트 생성
                renderTopbarAmChart(chartData);
            })
            .catch(error => console.error('[TopbarChart] Fetch Error:', error));
    });
});

function renderTopbarAmChart(data) {
    am5.ready(function() {
        var root = am5.Root.new("chartdiv");
        window.myChartRoot = root;

        root.setThemes([am5themes_Animated.new(root)]);

        var chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: true, panY: true, wheelX: "panX", wheelY: "zoomX", pinchZoomX: true,
            paddingLeft: 0, paddingRight: 1
        }));

        var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
        cursor.lineY.set("visible", false);

        var xRenderer = am5xy.AxisRendererX.new(root, {
            minGridDistance: 30,
            minorGridEnabled: true,
            cellStartLocation: 0.15,
            cellEndLocation: 0.85
        });

        xRenderer.labels.template.setAll({
            fontFamily: "Noto Sans KR", fontSize: "0.8rem",
            paddingTop: 10, paddingBottom: 10
        });

        var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
            maxDeviation: 0, categoryField: "Time", renderer: xRenderer, tooltip: am5.Tooltip.new(root, {})
        }));
        xAxis.data.setAll(data);

        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            maxDeviation: 0,
            renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 })
        }));

        // 예시 스타일을 100% 반영한 시리즈 추가 함수
        function addChartSeries(name, field, color) {
            var series = chart.series.push(am5xy.ColumnSeries.new(root, {
                name: name,
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: field,
                categoryXField: "Time",
                sequencedInterpolation: true,
                tooltip: am5.Tooltip.new(root, {
                    labelText: "[bold]{name}[/]: {valueY}" // 예시와 동일한 굵은 글씨 툴팁
                })
            }));

            // 툴팁 내부 폰트 상세 설정
            series.get("tooltip").label.setAll({
                fontFamily: "Noto Sans KR", fontSize: "0.64rem"
            });

            series.columns.template.setAll({
                cornerRadiusTL: 5, cornerRadiusTR: 5,
                strokeOpacity: 0, fill: am5.color(color)
            });

            series.data.setAll(data);
            series.appear(1000);
        }

        addChartSeries("전체", "value1", 0x6771dc);
        addChartSeries("소속팀", "value2", 0x35b5ac);

        chart.appear(1000, 100);
    });
}
