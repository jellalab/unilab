// assets/js/youtube.js

const API_KEY = "AIzaSyDICRiga6hneijUckMkOdphEWoXg3nhrR8";

const ids = [
  "nknLUJLmgU4",
  "rANtRuIFZf8",
  "7HQXQR76jUg"
].join(",");

const url = `https://www.googleapis.com/youtube/v3/videos
  ?part=snippet
  &id=${ids}
  &key=${API_KEY}`.replace(/\s/g, "");

async function getData_YT() {
  try {
    const response = await fetch(url);
    const results = await response.json();

    console.log(results);

    const element = document.querySelector("ul.video_list");
    if (!element) return;

    element.innerHTML = "";

    results.items.forEach(video => {
      element.innerHTML += `
        <li class="video-item">
          <iframe
            width="275"
            height="250"
            src="https://www.youtube.com/embed/${video.id}"
            title="${video.snippet.title}"
            frameborder="0"
            loading="lazy"
            allowfullscreen>
          </iframe>
          <p class="video-title">
            ${video.snippet.title}
          </p>
        </li>
      `;
    });
  } catch (error) {
    console.error("YouTube API error:", error);
  }
}

document.addEventListener("DOMContentLoaded", getData_YT);
