// assets/js/book.js
async function createInfobox() {
  const response = await fetch(
    "https://openlibrary.org/search.json?q=Female+Genital+Mutilation"
  );
  const data = await response.json();

  const content = document.getElementById("content");
  if (!content) return;

  data.docs.slice(0, 8).forEach(book => {
    const box = document.createElement("div");
    box.className = "infoBox";

    let coverHTML;
    if (book.cover_i) {
      coverHTML = `
        <img 
          class="cover" 
          src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" 
          alt="Book cover"
        >
      `;
    } else {
      coverHTML = `<div class="no-cover"><em>No cover available</em></div>`;
    }

    box.innerHTML = `
      ${coverHTML}
      <div><strong>Title:</strong> ${book.title ?? "Unknown"}</div>
      <div><strong>Author:</strong> ${book.author_name?.[0] ?? "Unknown"}</div>
      <div><strong>First published:</strong> ${book.first_publish_year ?? "Unknown"}</div>
    `;

    content.appendChild(box);
  });
}

document.addEventListener("DOMContentLoaded", createInfobox);
