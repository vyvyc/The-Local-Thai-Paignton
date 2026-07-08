const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hero = document.querySelector("[data-hero]");
const header = document.querySelector(".site-header");

const showEverything = () => {
  revealItems.forEach((item) => item.classList.add("is-visible"));
};

const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
const sectionsById = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (navLinks.length && sectionsById.length) {
  const setCurrentNav = (sectionId) => {
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${sectionId}`;
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const getHashTargetId = () => {
    if (!window.location.hash) return null;
    try {
      const target = document.querySelector(window.location.hash);
      const section = target?.closest("section");
      return section?.id || target?.id || null;
    } catch (_error) {
      return null;
    }
  };

  const getActiveSectionId = () => {
    const hashTargetId = getHashTargetId();
    if (hashTargetId && sectionsById.some((section) => section.id === hashTargetId)) {
      const target = document.getElementById(hashTargetId);
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.45 && rect.bottom > 80) {
        return hashTargetId;
      }
    }

    const headerOffset = header?.getBoundingClientRect().height || 0;
    const probeY = window.scrollY + headerOffset + Math.min(window.innerHeight * 0.34, 260);
    return sectionsById.reduce((current, section) => (
      section.offsetTop <= probeY ? section : current
    ), sectionsById[0]).id;
  };

  let navFrame = null;
  const queueNavUpdate = () => {
    if (navFrame) return;
    navFrame = window.requestAnimationFrame(() => {
      navFrame = null;
      setCurrentNav(getActiveSectionId());
    });
  };

  window.addEventListener("scroll", queueNavUpdate, { passive: true });
  window.addEventListener("resize", queueNavUpdate);
  window.addEventListener("hashchange", () => {
    const hashTargetId = getHashTargetId();
    if (hashTargetId) {
      setCurrentNav(hashTargetId);
      window.setTimeout(queueNavUpdate, 220);
    }
  });
  window.addEventListener("load", queueNavUpdate);
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href").slice(1);
      setCurrentNav(targetId);
      window.setTimeout(queueNavUpdate, 260);
    });
  });

  queueNavUpdate();
}

if (hero && header && "IntersectionObserver" in window) {
  const headerObserver = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle("is-compact", !entry.isIntersecting);
    },
    { threshold: 0.18 }
  );
  headerObserver.observe(hero);
}

const menuTabs = Array.from(document.querySelectorAll("[data-menu-tab]"));
const menuPanels = Array.from(document.querySelectorAll("[data-menu-panel]"));

menuTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.menuTab;

    menuTabs.forEach((candidate) => {
      const isActive = candidate === tab;
      candidate.classList.toggle("is-active", isActive);
      candidate.setAttribute("aria-selected", String(isActive));
      candidate.tabIndex = isActive ? 0 : -1;
    });

    menuPanels.forEach((panel) => {
      const isActive = panel.dataset.menuPanel === target;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
  });

  tab.addEventListener("keydown", (event) => {
    const currentIndex = menuTabs.indexOf(tab);
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % menuTabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + menuTabs.length) % menuTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = menuTabs.length - 1;
    }

    menuTabs[nextIndex].focus();
    menuTabs[nextIndex].click();
  });
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  showEverything();
} else {
  document.body.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  revealItems.forEach((item) => revealObserver.observe(item));
}
