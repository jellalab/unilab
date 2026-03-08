let chart = null;
let dataByCountry = {};
let years = [];
let currentCountry = null;

Papa.parse("child_marriage_data.csv", {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    const data = results.data;

    if (!data || data.length === 0) {
      console.error("CSV loaded but contains no data");
      return;
    }

    years = Object.keys(data[0])
      .map(k => k.trim())
      .filter(k => /^\d{4}$/.test(k))
      .sort((a, b) => Number(a) - Number(b));

    data.forEach(row => {
      const rawCountry = row["Country"] ?? row[" Country"] ?? row.country;
      if (!rawCountry || !rawCountry.trim()) return;

      const country = rawCountry.trim();

      dataByCountry[country] = years.map(year => {
        const raw = row[year];
        const s = (raw ?? "").toString().trim();
        if (!s) return null;

        const n = parseFloat(s.replace(",", "."));
        return Number.isFinite(n) ? n : null;
      });
    });

    const countries = Object.keys(dataByCountry).sort();
    if (countries.length === 0) {
      console.error("No countries parsed");
      return;
    }

    populateDropdown(countries);
    setupViewToggle();

    const defaultCountry = countries.includes("Angola") ? "Angola" : countries[0];
    document.getElementById("countrySelect").value = defaultCountry;
    setCountry(defaultCountry);

    setView("graph");
  }
});

function populateDropdown(countries) {
  const select = document.getElementById("countrySelect");
  if (!select) return;

  select.innerHTML = "";
  countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    setCountry(this.value);
  });
}

function setupViewToggle() {
  const btnGraph = document.getElementById("btnGraph");
  const btnTable = document.getElementById("btnTable");
  if (!btnGraph || !btnTable) return;

  btnGraph.addEventListener("click", () => setView("graph"));
  btnTable.addEventListener("click", () => setView("table"));
}

function setView(view) {
  const graphView = document.getElementById("graphView");
  const tableView = document.getElementById("tableView");
  const btnGraph = document.getElementById("btnGraph");
  const btnTable = document.getElementById("btnTable");

  if (!graphView || !tableView || !btnGraph || !btnTable) return;

  const isGraph = view === "graph";

  graphView.style.display = isGraph ? "block" : "none";
  tableView.style.display = isGraph ? "none" : "block";

  btnGraph.classList.toggle("active", isGraph);
  btnTable.classList.toggle("active", !isGraph);

  if (!currentCountry) return;

  if (isGraph) drawChart(currentCountry);
  else drawTable(currentCountry);
}

function setCountry(country) {
  currentCountry = country;

  const graphView = document.getElementById("graphView");
  const isGraphVisible = graphView && graphView.style.display !== "none";

  if (isGraphVisible) drawChart(country);
  else drawTable(country);
}

function drawChart(country) {
  const canvas = document.getElementById("childMarriageChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: `${country} – % married under 18`,
          data: dataByCountry[country],
          borderWidth: 2,
          tension: 0.25,
          spanGaps: true,
          pointRadius: 2,
          pointHoverRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      normalized: true,
      scales: {
        x: {
          ticks: { autoSkip: true, maxTicksLimit: 10 },
          title: { display: true, text: "Year" }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Percentage (%)" }
        }
      }
    }
  });
}

function drawTable(country) {
  const table = document.getElementById("childMarriageTable");
  if (!table) return;

  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  if (!thead || !tbody) return;

  const values = dataByCountry[country] ?? [];

  thead.innerHTML = `
    <tr>
      <th>Country</th>
      <th>Year</th>
      <th>Percent (%)</th>
    </tr>
  `;

  const rows = years.map((year, i) => {
    const v = values[i];
    const shown = v === null ? "—" : v;
    return `<tr><td>${escapeHtml(country)}</td><td>${escapeHtml(year)}</td><td>${escapeHtml(String(shown))}</td></tr>`;
  });

  tbody.innerHTML = rows.join("");
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
