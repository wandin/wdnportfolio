const glow = document.querySelector(".cursor-glow");

let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
let glowX = mouseX;
let glowY = mouseY;

window.addEventListener("pointermove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

function animateGlow() {
  glowX += (mouseX - glowX) * 0.08;
  glowY += (mouseY - glowY) * 0.08;

  if (glow) {
    glow.style.transform = `translate(${glowX - 240}px, ${glowY - 240}px)`;
  }

  requestAnimationFrame(animateGlow);
}

animateGlow();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const cards = document.querySelectorAll(".glass-card, .project-card, .experience-card");

cards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(57,217,255,.12), transparent 34%), var(--panel)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.background = "";
  });
});

const carousels = document.querySelectorAll(".exp-carousel");

carousels.forEach((carousel) => {
  const track = carousel.querySelector(".exp-carousel-track");
  const slides = Array.from(carousel.querySelectorAll(".exp-slide"));
  const prevButton = carousel.querySelector(".carousel-btn-prev");
  const nextButton = carousel.querySelector(".carousel-btn-next");
  const dotsContainer = carousel.querySelector(".carousel-dots");

  if (!track || slides.length <= 1) {
    prevButton?.remove();
    nextButton?.remove();
    dotsContainer?.remove();
    return;
  }

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Go to media ${index + 1}`);

    dot.addEventListener("click", () => {
      track.scrollTo({
        left: index * track.clientWidth,
        behavior: "smooth",
      });
    });

    dotsContainer.appendChild(dot);
    return dot;
  });

  function getCurrentIndex() {
    return Math.round(track.scrollLeft / track.clientWidth);
  }

  function updateDots() {
    const currentIndex = getCurrentIndex();

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  prevButton.addEventListener("click", () => {
    const currentIndex = getCurrentIndex();
    const nextIndex = currentIndex <= 0 ? slides.length - 1 : currentIndex - 1;

    track.scrollTo({
      left: nextIndex * track.clientWidth,
      behavior: "smooth",
    });
  });

  nextButton.addEventListener("click", () => {
    const currentIndex = getCurrentIndex();
    const nextIndex = currentIndex >= slides.length - 1 ? 0 : currentIndex + 1;

    track.scrollTo({
      left: nextIndex * track.clientWidth,
      behavior: "smooth",
    });
  });

  track.addEventListener("scroll", () => {
    window.requestAnimationFrame(updateDots);
  });

  updateDots();
});

const lightbox = document.querySelector("#imageLightbox");
const lightboxImage = lightbox?.querySelector(".lightbox-image");
const lightboxClose = lightbox?.querySelector(".lightbox-close");

function openLightbox(image) {
  if (!lightbox || !lightboxImage) return;

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || "Expanded portfolio image";

  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;

  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  document.body.style.overflow = "";
}

document.querySelectorAll(".exp-slide img, .project-media img").forEach((image) => {
  image.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openLightbox(image);
  });
});

lightboxClose?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});