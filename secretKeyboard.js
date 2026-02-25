(function () {
  "use strict";

  /*
    CONFIGURATION
    Adjust as needed.
  */

  const TAP_LIMIT = 3;
  const TIME_WINDOW = 800;     // ms
  const CORNER_SIZE = 80;      // px activation zone

  /*
    INTERNAL STATE
  */

  let tapCount = 0;
  let firstTapTime = 0;

  /*
    CREATE HIDDEN INPUT
  */

  const input = document.createElement("input");
  input.type = "text";
  input.autocomplete = "off";
  input.autocorrect = "off";
  input.spellcheck = false;

  Object.assign(input.style, {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "1px",
    height: "1px",
    opacity: "0",
    pointerEvents: "none",
    zIndex: "-1"
  });

  // lose focus as soon as any key is released
  input.addEventListener("keyup", function (event) {
    input.blur();  
  });

  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(input);
  });

  /*
    MULTIPLE TAP DETECTION
  */

  document.addEventListener("pointerdown", function (e) {
    const x = e.clientX;
    const y = e.clientY;

    const inTopRight =
      x > document.documentElement.clientWidth - CORNER_SIZE &&
      y < CORNER_SIZE;

    if (!inTopRight) {
      tapCount = 0;
      return;
    }

    const now = Date.now();

    if (tapCount === 0) {
      firstTapTime = now;
      tapCount = 1;
      return;
    }

    if (now - firstTapTime <= TIME_WINDOW) {
      tapCount++;
    } else {
      tapCount = 1;
      firstTapTime = now;
    }

    if (tapCount === TAP_LIMIT) {
      tapCount = 0;

      e.preventDefault();
      e.stopPropagation();

      // Must be synchronous to open keyboard
      input.focus();
    }
  });

})();