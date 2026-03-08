// assets/js/nytimes.js

const NYT_API_KEY = "iN0YgaQGL7L8AYnaQpAIgrGozuYpS8mWqv9NsAZQSwzZPSb5";

async function loadNYTimesArticles() {
  const container = document.getElementById("nyt-articles");
  if (!container) return;

  container.innerHTML = "";

  const params = new URLSearchParams({
    q: '(female genital mutilation OR FGM OR child marriage OR forced marriage OR genital mutilation)',
    sort: "newest",
    "api-key": NYT_API_KEY,
    fq: 'news_desk:("World" "Health")'
  });


  const url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`NYT HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    const docs = data?.response?.docs ?? [];

    if (docs.length === 0) {
      container.innerHTML = "<p>No NYT articles found for this search.</p>";
      return;
    }

    docs.slice(0, 8).forEach(doc => {
      const title = doc.headline?.main ?? "Untitled";
      const snippet = doc.snippet ?? "";
      const link = doc.web_url ?? "#";

      const card = document.createElement("div");
      card.className = "article-card";
      card.innerHTML = `
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(snippet)}</p>
        <a href="${link}" target="_blank" rel="noopener noreferrer">Read full article</a>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("NYTimes API error:", err);
    container.innerHTML = `<p>NYT articles failed to load. Open the console for details.</p>`;
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", loadNYTimesArticles);