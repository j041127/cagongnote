document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("surveyForm");
  const q2Canvas = document.getElementById("q2Chart");
  const q5Canvas = document.getElementById("q5Chart");

  let q2Chart, q5Chart;
  let dataStore = {
    q2: { "스타벅스": 0, "투썸 플레이스": 0, "메가커피": 0, "이디야": 0, "커피빈": 0 },
    q5: { "조용한 카페 지도": 0, "실시간 자리 정보": 0, "집중 타이머": 0, "사용자 후기 공유": 0, "기타": 0 }
  };

  // 제출 시 로컬에서 집계 (실제 서비스라면 서버 저장)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const q2 = formData.get("q2");
    const q5 = formData.getAll("q5");

    if (q2) dataStore.q2[q2] += 1;
    q5.forEach(opt => dataStore.q5[opt] += 1);

    alert("응답이 제출되었습니다! 결과가 업데이트됩니다 :)");
    form.reset();
    renderCharts();
  });

  function renderCharts() {
    if (q2Chart) q2Chart.destroy();
    if (q5Chart) q5Chart.destroy();

    q2Chart = new Chart(q2Canvas, {
      type: "bar",
      data: {
        labels: Object.keys(dataStore.q2),
        datasets: [{
          label: "선호 카페 응답 수",
          data: Object.values(dataStore.q2),
          backgroundColor: "#D9B89B"
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });

    q5Chart = new Chart(q5Canvas, {
      type: "pie",
      data: {
        labels: Object.keys(dataStore.q5),
        datasets: [{
          data: Object.values(dataStore.q5),
          backgroundColor: ["#E8DCC7", "#D9B89B", "#C49A6C", "#A1724E", "#8B5E3C"]
        }]
      }
    });
  }

  renderCharts();
});
