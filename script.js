document.addEventListener("DOMContentLoaded", () => {
  // === 여기에 본인 웹앱 URL을 넣으세요 ===
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxwEHR3KVGOH9y0eRiufTqHA-iCXmimjDoK3U2dLlp5D_KPAlZROdv67IxAYjeNjo5HUg/exec";

  const form = document.getElementById("surveyForm");
  const q2Canvas = document.getElementById("q2Chart");
  const q5Canvas = document.getElementById("q5Chart");
  let q2Chart, q5Chart;

  // iframe 생성 (CORS 회피용)
  const iframe = document.createElement("iframe");
  iframe.name = "hidden_iframe";
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  // form 속성 수정
  form.action = WEB_APP_URL;
  form.method = "POST";
  form.target = "hidden_iframe";

  // 제출 시 처리
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // 기본 submit 막기

    const formData = new FormData(form);
    const q1 = formData.get("q1");
    const q2 = formData.get("q2");
    const q3 = formData.get("q3");
    const q4 = formData.get("q4");
    const q5 = formData.getAll("q5");

    // iframe에 hidden form을 이용해 전송
    const payload = {
      timestamp: new Date().toISOString(),
      q1,
      q2,
      q3,
      q4,
      q5: q5.join(", ")
    };

    // iframe POST 전송
    const hiddenForm = document.createElement("form");
    hiddenForm.style.display = "none";
    hiddenForm.action = WEB_APP_URL;
    hiddenForm.method = "POST";
    hiddenForm.target = "hidden_iframe";

    for (const key in payload) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = payload[key];
      hiddenForm.appendChild(input);
    }

    document.body.appendChild(hiddenForm);
    hiddenForm.submit();
    document.body.removeChild(hiddenForm);

    alert("응답이 제출되었습니다!");
    form.reset();
    loadResults(); // 제출 후 차트 업데이트
  });

  // 결과 불러오기
  async function loadResults() {
    try {
      const res = await fetch(WEB_APP_URL + "?action=getData");
      const rows = await res.json();

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
