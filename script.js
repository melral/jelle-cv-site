const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealElements = document.querySelectorAll(".reveal");
const spotlightItems = document.querySelectorAll(".spotlight");
const hero = document.querySelector(".hero");
const heroStage = document.querySelector("#hero-stage");
const motionLayers = document.querySelectorAll(".motion-layer");
const supportsIntersectionObserver = "IntersectionObserver" in window;

if (!prefersReducedMotion && supportsIntersectionObserver) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12,
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  const spotlightObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    {
      threshold: 0.7,
      rootMargin: "-10% 0px -10% 0px",
    }
  );

  spotlightItems.forEach((item) => spotlightObserver.observe(item));

  let rafId = null;
  let pointerX = 0;
  let pointerY = 0;

  const updateMotion = () => {
    if (!heroStage) {
      rafId = null;
      return;
    }

    motionLayers.forEach((layer) => {
      const depth = Number.parseFloat(layer.dataset.depth || "0");
      const offsetX = pointerX * depth;
      const offsetY = pointerY * depth;
      layer.style.transform = `${getBaseTransform(layer)} translate3d(${offsetX.toFixed(
        2
      )}px, ${offsetY.toFixed(2)}px, 0)`;
    });

    rafId = null;
  };

  const queueMotionUpdate = () => {
    if (rafId === null) {
      rafId = window.requestAnimationFrame(updateMotion);
    }
  };

  const getBaseTransform = (element) => {
    if (element.classList.contains("stage-document")) {
      return `translate3d(0, calc(var(--hero-progress) * -24px), 0) rotate(7deg)`;
    }

    if (element.classList.contains("stage-portrait")) {
      return `translate3d(0, calc(var(--hero-progress) * 16px), 0) rotate(-8deg)`;
    }

    if (element.classList.contains("stage-chip")) {
      return `translate3d(0, calc(var(--hero-progress) * 14px), 0)`;
    }

    return "translate3d(0, 0, 0)";
  };

  if (heroStage) {
    heroStage.addEventListener("pointermove", (event) => {
      const rect = heroStage.getBoundingClientRect();
      const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
      const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
      pointerX = normalizedX * 30;
      pointerY = normalizedY * 30;
      queueMotionUpdate();
    });

    heroStage.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
      queueMotionUpdate();
    });
  }

  const syncHeroProgress = () => {
    if (!hero) {
      return;
    }

    const rect = hero.getBoundingClientRect();
    const viewport = window.innerHeight || 1;
    const progress = Math.min(Math.max((viewport - rect.top) / (viewport + rect.height), 0), 1);
    document.documentElement.style.setProperty("--hero-progress", progress.toFixed(3));
  };

  syncHeroProgress();
  window.addEventListener("scroll", syncHeroProgress, { passive: true });
  window.addEventListener("resize", syncHeroProgress);
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}
