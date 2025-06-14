// Dummy values — replace with actual calculation logic
let productivity = 65;  // e.g., 65%
let procrastination = 35; // e.g., 35%

// Animate bar widths
document.addEventListener("DOMContentLoaded", () => {
  animateBar("productivity-bar", productivity);
  animateBar("procrastination-bar", procrastination);
  animateCount("productivity-value", productivity);
  animateCount("procrastination-value", procrastination);
});

function animateBar(id, percent) {
  const bar = document.getElementById(id);
  setTimeout(() => {
    bar.style.width = percent + "%";
  }, 200);
}

function animateCount(id, target) {
  let current = 0;
  const element = document.getElementById(id);
  const step = () => {
    if (current < target) {
      current++;
      element.textContent = current + "%";
      requestAnimationFrame(step);
    }
  };
  step();
}
