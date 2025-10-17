document.addEventListener("DOMContentLoaded", () => {
  // === 여기에 본인 웹앱 URL을 넣으세요 ===
  const WEB_APP_URL = "https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycbxbPXtqrslaIqnZVL4iSeW6ziovck1fy_0HRYp457h_MhBYZyb8P30agacOcza1h8En-g/exec/exec";

  const form = document.getElementById("surveyForm");
  const q2Canvas = document.getElementById("q2Chart");
  const q5Canvas = document.getElementById("q5Chart");
  let q2Chart, q5Chart;

  // 제출 시 Google Sheets로 데이터 전송
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const q1 = formData.get("q1");
    const q2 = formData.get("q2");
    const q3 = formData.get("q3");
    const q4 = formData.get("q4");
    const q5 = formData.getAll("q5");

    const payload = {
      timestamp: new Date().toISOString(),
      q1,
      q2,
      q3,
      q4,
      q5: q5.join(", ")
    };

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      alert("응답이 제출되었습니다!");
      form.reset();
      loadResults(); // 새로고침 없이 결과 업데이트
    } catch (error) {
      console.error(error);
      alert("데이터 저장 중 오류가 발생했습니다.");
    }
  });

  // 결과 불러오기
  async function loadResults() {
    try {
      const res = await fetch(WEB_APP_URL + "?action=getData");
      const rows = await res.json();

      // rows는 [{timestamp, q1, q2, q3, q4, q5}, ...] 형태
      const q2Counts = {};
      const q5Counts = {};

      rows.forEach((r) => {
        if (r.q2) q2Counts[r.q2] = (q2Counts[r.q2] || 0) + 1;
        if (r.q5) {
          r.q5.split(",").forEach((opt) => {
            const trimmed = opt.trim();
            if (trimmed) q5Counts[trimmed] = (q5Counts[trimmed] || 0) + 1;
          });
        }
      });

      renderCharts(q2Counts, q5Counts);
    } catch (err) {
      console.error(err);
    }
  }

  // 차트 렌더링
  function renderCharts(q2Counts, q5Counts) {
    if (q2Chart) q2Chart.destroy();
    if (q5Chart) q5Chart.destroy();

    const q2Labels = Object.keys(q2Counts);
    const q2Data = Object.values(q2Counts);

    const q5Labels = Object.keys(q5Counts);
    const q5Data = Object.values(q5Counts);

    q2Chart = new Chart(q2Canvas, {
      type: "bar",
      data: {
        labels: q2Labels,
        datasets: [
          {
            label: "선호 카페 응답 수",
            data: q2Data,
            backgroundColor: "#D9B89B",
          },
        ],
      },
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } },
      },
    });

    q5Chart = new Chart(q5Canvas, {
      type: "pie",
      data: {
        labels: q5Labels,
        datasets: [
          {
            data: q5Data,
            backgroundColor: [
              "#E8DCC7",
              "#D9B89B",
              "#C49A6C",
              "#A1724E",
              "#8B5E3C",
            ],
          },
        ],
      },
    });
  }

  // 초기 실행
  loadResults();
});
