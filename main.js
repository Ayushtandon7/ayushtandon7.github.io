(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FORM_ENDPOINT = "https://formsubmit.co/ajax/Ayushtandon717@gmail.com";
  const FALLBACK_EMAIL = "Ayushtandon717@gmail.com";

  document.getElementById("year").textContent = new Date().getFullYear();

  initNav();
  initReveal();
  initCounters();
  initRotator();
  initDeck();
  initSpotlight();
  initNetwork();
  initForms();
  initConsent();

  function initNav() {
    const nav = document.getElementById("nav");
    const progress = document.querySelector(".progress");
    const toggle = document.querySelector(".nav-toggle");
    const links = document.getElementById("nav-links");

    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("scrolled", y > 12);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      links.classList.toggle("open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });

    const byId = new Map(
      [...links.querySelectorAll('a[href^="#"]')].map((a) => [a.getAttribute("href").slice(1), a])
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          byId.forEach((a) => a.classList.remove("active"));
          byId.get(entry.target.id)?.classList.add("active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));
  }

  function initReveal() {
    const items = [...document.querySelectorAll(".reveal")];
    items.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.setProperty("--d", siblings.indexOf(el));
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  function initCounters() {
    const els = document.querySelectorAll("[data-count]");
    if (reduceMotion) return;

    const format = (n, suffix) => n.toLocaleString("en-US") + suffix;
    const run = (el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const duration = 1700;
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(Math.round(target * eased), suffix);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    els.forEach((el) => {
      el.textContent = format(0, el.dataset.suffix || "");
      io.observe(el);
    });
  }

  function initRotator() {
    const el = document.querySelector(".rotator");
    if (!el || reduceMotion) return;
    const words = JSON.parse(el.dataset.words);
    let i = 0;
    setInterval(() => {
      el.classList.add("out");
      setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove("out");
      }, 350);
    }, 2800);
  }

  function initDeck() {
    const deck = document.querySelector("[data-deck]");
    if (!deck) return;
    const track = deck.querySelector(".deck-track");
    const viewport = deck.querySelector(".deck-viewport");
    const cards = [...deck.querySelectorAll(".deck-card")];
    const dots = deck.querySelector(".deck-dots");
    let index = 0;
    let timer = 0;
    let startX = 0;
    let delta = 0;
    let dragging = false;

    cards.forEach((card, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", card.dataset.title);
      dot.addEventListener("click", () => go(i));
      dots.appendChild(dot);
    });

    const play = (card) => {
      clearTimeout(timer);
      const steps = [...card.querySelectorAll(".flow li")];
      const bar = card.querySelector(".console-bar i");
      cards.forEach((other) => {
        other.querySelectorAll(".flow li").forEach((step) => step.classList.remove("done", "current"));
        const otherBar = other.querySelector(".console-bar i");
        if (otherBar) otherBar.style.transform = "scaleX(0)";
      });
      if (reduceMotion) {
        steps.forEach((step) => step.classList.add("done"));
        if (bar) bar.style.transform = "scaleX(1)";
        return;
      }
      let stepIndex = 0;
      const tick = () => {
        if (cards[index] !== card) return;
        steps.forEach((step) => step.classList.remove("current"));
        if (stepIndex < steps.length) {
          steps[stepIndex].classList.add("current", "done");
          if (bar) bar.style.transform = `scaleX(${(stepIndex + 1) / steps.length})`;
          stepIndex += 1;
          timer = setTimeout(tick, 1300);
          return;
        }
        timer = setTimeout(() => {
          if (cards[index] !== card) return;
          steps.forEach((step) => step.classList.remove("done", "current"));
          if (bar) bar.style.transform = "scaleX(0)";
          stepIndex = 0;
          timer = setTimeout(tick, 700);
        }, 2200);
      };
      timer = setTimeout(tick, 350);
    };

    const go = (next) => {
      index = (next + cards.length) % cards.length;
      track.style.transition = "";
      track.style.transform = `translateX(-${index * 100}%)`;
      cards.forEach((card, i) => card.classList.toggle("is-active", i === index));
      [...dots.children].forEach((dot, i) => {
        dot.classList.toggle("on", i === index);
        dot.setAttribute("aria-selected", String(i === index));
      });
      play(cards[index]);
    };

    viewport.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      delta = 0;
      track.style.transition = "none";
      viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      delta = event.clientX - startX;
      track.style.transform = `translateX(calc(-${index * 100}% + ${delta}px))`;
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      if (delta <= -48) go(index + 1);
      else if (delta >= 48) go(index - 1);
      else go(index);
    };
    viewport.addEventListener("pointerup", release);
    viewport.addEventListener("pointercancel", release);

    deck.querySelector("[data-deck-prev]").addEventListener("click", () => go(index - 1));
    deck.querySelector("[data-deck-next]").addEventListener("click", () => go(index + 1));
    deck.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    });

    go(0);
  }

  function initSpotlight() {
    document.querySelectorAll(".spot").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  function initNetwork() {
    const canvas = document.getElementById("network");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;
    const LINK = 150;
    const POINTER_LINK = 190;
    const pointer = { x: -9999, y: -9999 };
    let w = 0;
    let h = 0;
    let nodes = [];
    let pulses = [];
    let running = false;
    let raf = 0;
    let lastSpawn = 0;

    const seed = () => {
      const count = Math.round(Math.min(95, Math.max(34, (w * h) / 15000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.3 + 0.7,
      }));
      pulses = [];
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = hero.clientWidth;
      const nextH = hero.clientHeight;
      const widthChanged = nextW !== w;
      w = nextW;
      h = nextH;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (widthChanged || !nodes.length) seed();
    };

    const spawnPulse = () => {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const candidates = nodes.filter((b) => b !== a && Math.hypot(a.x - b.x, a.y - b.y) < LINK);
      if (!candidates.length) return;
      const b = candidates[Math.floor(Math.random() * candidates.length)];
      pulses.push({ a, b, t: 0, speed: 0.01 + Math.random() * 0.012 });
    };

    const draw = (now) => {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            ctx.strokeStyle = `rgba(110, 150, 255, ${(1 - Math.sqrt(d2) / LINK) * 0.2})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (pd < POINTER_LINK) {
          ctx.strokeStyle = `rgba(51, 225, 199, ${(1 - pd / POINTER_LINK) * 0.45})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = "rgba(175, 198, 255, 0.75)";
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (now - lastSpawn > 240) {
        spawnPulse();
        lastSpawn = now;
      }
      pulses = pulses.filter((p) => p.t <= 1 && Math.hypot(p.a.x - p.b.x, p.a.y - p.b.y) < LINK * 1.2);
      for (const p of pulses) {
        p.t += p.speed;
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, "rgba(51, 225, 199, 0.95)");
        g.addColorStop(1, "rgba(51, 225, 199, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      if (running) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    if (reduceMotion) {
      for (let i = 0; i < 12; i += 1) spawnPulse();
      draw(0);
      return;
    }

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", () => {
      pointer.x = -9999;
      pointer.y = -9999;
    });

    new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(hero);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    start();
  }

  function initConsent() {
    const CONSENT_KEY = "ayush-consent";
    const VISITOR_KEY = "ayush-visitor";
    const SENT_KEY = "ayush-visit-sent";
    const banner = document.getElementById("consent");
    const show = () => banner.removeAttribute("hidden");
    const hide = () => banner.setAttribute("hidden", "");

    const choice = () => {
      try {
        return localStorage.getItem(CONSENT_KEY);
      } catch {
        return null;
      }
    };

    const remember = (value) => {
      try {
        localStorage.setItem(CONSENT_KEY, value);
      } catch {
        /* private browsing can block storage */
      }
    };

    const visitorId = () => {
      try {
        let id = localStorage.getItem(VISITOR_KEY);
        if (!id) {
          id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
          localStorage.setItem(VISITOR_KEY, id);
        }
        return id.slice(0, 8);
      } catch {
        return "unknown";
      }
    };

    const recordVisit = () => {
      try {
        if (sessionStorage.getItem(SENT_KEY)) return;
        sessionStorage.setItem(SENT_KEY, "1");
      } catch {
        return;
      }
      const when = new Date();
      const brands = navigator.userAgentData
        ? navigator.userAgentData.brands.map((brand) => `${brand.brand} ${brand.version}`).join(", ")
        : "";
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Site visit ${when.toISOString()}`,
          _template: "table",
          _captcha: "false",
          when: when.toLocaleString("en-GB", { timeZone: "Europe/Berlin", hour12: false }) + " Europe/Berlin",
          page: location.href,
          referrer: document.referrer || "direct",
          language: navigator.language || "",
          languages: navigator.languages ? navigator.languages.join(", ") : "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          platform: navigator.platform || "",
          vendor: navigator.vendor || "",
          browser: brands,
          user_agent: navigator.userAgent || "",
          screen: `${window.screen.width}x${window.screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          color_depth: String(window.screen.colorDepth || ""),
          touch_points: String(navigator.maxTouchPoints || 0),
          cpu_cores: String(navigator.hardwareConcurrency || ""),
          device_memory_gb: String(navigator.deviceMemory || ""),
          cookies_enabled: String(navigator.cookieEnabled),
          anonymous_id: visitorId(),
        }),
      }).catch(() => {
        try {
          sessionStorage.removeItem(SENT_KEY);
        } catch {
          /* ignore */
        }
      });
    };

    banner.addEventListener("click", (event) => {
      const decision = event.target.closest("[data-consent]")?.dataset.consent;
      if (!decision) return;
      remember(decision);
      hide();
      if (decision === "accept") recordVisit();
    });

    document.querySelectorAll("[data-open-consent]").forEach((button) => {
      button.addEventListener("click", () => {
        try {
          localStorage.removeItem(CONSENT_KEY);
          sessionStorage.removeItem(SENT_KEY);
        } catch {
          /* ignore */
        }
        show();
      });
    });

    if (choice() === "accept") recordVisit();
    else if (choice() !== "reject") show();
  }

  function initForms() {
    const dialog = document.getElementById("phone-dialog");

    document.querySelectorAll("[data-open-phone]").forEach((btn) =>
      btn.addEventListener("click", () => {
        dialog.showModal();
        dialog.querySelector('input[name="name"]').focus();
      })
    );
    dialog.querySelectorAll("[data-close]").forEach((btn) => btn.addEventListener("click", () => dialog.close()));
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });

    wireForm(
      document.getElementById("contact-form"),
      (data) => ({
        name: data.name,
        email: data.email,
        message: data.message,
        _subject: `Portfolio message from ${data.name}`,
      }),
      "Thanks, your message is on its way. I’ll reply by email."
    );

    wireForm(
      document.getElementById("phone-form"),
      (data) => ({
        request: "Phone number request",
        name: data.name,
        email: data.email,
        company: data.company || "—",
        reason: data.reason || "—",
        _subject: `Phone number request from ${data.name}`,
      }),
      "Request sent. I’ll email my number to you."
    );
  }

  function wireForm(form, buildPayload, successText) {
    const status = form.querySelector(".form-status");
    const button = form.querySelector('button[type="submit"]');
    const fields = [...form.querySelectorAll("input[required], textarea[required]")];

    fields.forEach((field) =>
      field.addEventListener("input", () => field.closest(".field")?.classList.remove("invalid"))
    );

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const invalid = fields.filter((f) => !f.value.trim() || !f.checkValidity());
      fields.forEach((f) => f.closest(".field")?.classList.toggle("invalid", invalid.includes(f)));
      if (invalid.length) {
        setStatus(status, "Please fill in your name, a valid email, and the required fields.", "err");
        invalid[0].focus();
        return;
      }

      const data = Object.fromEntries(new FormData(form));
      if (data._honey) return;

      button.disabled = true;
      button.classList.add("loading");
      setStatus(status, "Sending…", "");

      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            ...buildPayload(data),
            _replyto: data.email,
            _template: "table",
            _captcha: "false",
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || String(body.success) !== "true") throw new Error(body.message || "Send failed");
        form.reset();
        setStatus(status, successText, "ok");
      } catch {
        setStatus(status, `Couldn’t send right now. Please email ${FALLBACK_EMAIL} directly.`, "err");
      } finally {
        button.disabled = false;
        button.classList.remove("loading");
      }
    });
  }

  function setStatus(el, text, kind) {
    el.textContent = text;
    el.className = `form-status${kind ? ` ${kind}` : ""}`;
  }
})();
