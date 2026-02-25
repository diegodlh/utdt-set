(function () {
  "use strict";

  const btn = document.createElement("button");
  btn.innerHTML = "⛶"; // fullscreen icon
  btn.id = "fs-toggle-btn";

  Object.assign(btn.style, {
    position: "fixed",
    bottom: "16px",
    right: "16px",
    zIndex: "9999",
    padding: "10px 14px",
    fontSize: "20px",
    borderRadius: "8px",
    border: "none",
    background: "rgba(0,0,0,0.7)",
    color: "#fff",
    cursor: "pointer"
  });

  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(btn);
  });

  btn.addEventListener("click", function () {
    if (isFullscreen()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  });

  function isFullscreen() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement
    );
  }

  function enterFullscreen() {
    const body = document.body
    if (body.requestFullscreen) {
      body.requestFullscreen().catch(console.error);
    } else if (body.webkitRequestFullscreen) {
      body.webkitRequestFullscreen();
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }

  function updateButtonVisibility() {
    btn.style.display = isFullscreen() ? "none" : "block";
  }
  
  document.addEventListener("fullscreenchange", updateButtonVisibility);
  document.addEventListener("webkitfullscreenchange", updateButtonVisibility);

  updateButtonVisibility();
})();