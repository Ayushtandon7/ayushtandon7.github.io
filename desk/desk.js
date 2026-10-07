(() => {
  const REPO = "Ayushtandon7/portfolio-desk";
  const API = `https://api.github.com/repos/${REPO}`;
  const WORKFLOW = "sync.yml";
  const TOKEN_KEY = "desk-token";
  const PAGE = 40;
  const TZ = "Europe/Berlin";

  const $ = (id) => document.getElementById(id);
  const lock = $("lock");
  const desk = $("desk");
  let visits = [];
  let shown = PAGE;

  const getToken = () => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || "";

  const setToken = (token, remember) => {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    if (token) (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  };

  const say = (el, text, kind = "") => {
    el.textContent = text;
    el.className = `msg${el.id === "desk-msg" ? " banner" : ""}${kind ? ` ${kind}` : ""}`;
  };

  async function gh(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
      cache: "no-store",
      ...options,
      headers: {
        Accept: options.raw ? "application/vnd.github.raw+json" : "application/vnd.github+json",
        Authorization: `Bearer ${getToken()}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (res.status === 401) throw new Error("auth");
    if (res.status === 403 || res.status === 404) throw new Error("access");
    if (!res.ok) throw new Error(`http ${res.status}`);
    if (res.status === 204) return null;
    return options.raw ? JSON.parse(await res.text()) : res.json();
  }

  const file = (name) => gh(`/contents/${name}?ref=main&t=${Date.now()}`, { raw: true });

  async function load() {
    const [visitDoc, changes, state] = await Promise.all([file("visits.json"), file("changes.json"), file("state.json")]);
    visits = (visitDoc.visits || []).slice().sort((a, b) => String(b.iso).localeCompare(String(a.iso)));
    shown = PAGE;
    render(changes || [], state || {});
  }

  const dayKey = (date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
  const fmt = (iso, opts = { dateStyle: "medium", timeStyle: "short" }) => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...opts }).format(date);
  };

  function device(v) {
    const ua = v.user_agent || "";
    const os = /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Android/.test(ua)
        ? "Android"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Windows/.test(ua)
            ? "Windows"
            : /Linux/.test(ua)
              ? "Linux"
              : v.platform || "Other";
    const browser = /Edg\//.test(ua)
      ? "Edge"
      : /OPR\//.test(ua)
        ? "Opera"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Chrome\//.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Browser";
    return `${os} · ${browser}`;
  }

  const refHost = (ref) => {
    if (!ref || ref === "direct") return "Direct";
    try {
      return new URL(ref).hostname.replace(/^www\./, "");
    } catch {
      return ref;
    }
  };

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function render(changes, state) {
    const now = new Date();
    const today = dayKey(now);
    const weekAgo = now.getTime() - 7 * 864e5;
    $("s-total").textContent = visits.length;
    $("s-unique").textContent = new Set(visits.map((v) => v.anonymous_id).filter(Boolean)).size;
    $("s-today").textContent = visits.filter((v) => dayKey(new Date(v.iso)) === today).length;
    $("s-week").textContent = visits.filter((v) => new Date(v.iso).getTime() >= weekAgo).length;
    $("s-last").textContent = visits[0] ? fmt(visits[0].iso) : "—";
    $("synced").textContent = state.checked_at ? `Synced ${fmt(state.checked_at)}` : "";

    renderChart(now);
    renderTop("top-ref", visits.map((v) => refHost(v.referrer)));
    renderTop("top-dev", visits.map(device));
    renderTop("top-tz", visits.map((v) => v.timezone || "Unknown"));
    renderVisits();
    renderChanges(changes);
  }

  function renderChart(now) {
    const chart = $("chart");
    chart.replaceChildren();
    const days = [];
    for (let i = 13; i >= 0; i--) days.push(new Date(now.getTime() - i * 864e5));
    const counts = days.map((d) => visits.filter((v) => dayKey(new Date(v.iso)) === dayKey(d)).length);
    const max = Math.max(1, ...counts);
    days.forEach((d, i) => {
      const bar = el("div", "bar");
      bar.title = `${fmt(d.toISOString(), { dateStyle: "medium" })}: ${counts[i]}`;
      bar.append(el("b", "", counts[i] || ""));
      const fill = el("i");
      fill.style.height = `${(counts[i] / max) * 100}%`;
      bar.append(fill, el("span", "", fmt(d.toISOString(), { day: "2-digit", month: "short" })));
      chart.append(bar);
    });
  }

  function renderTop(id, values) {
    const list = $(id);
    list.replaceChildren();
    const counts = new Map();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (!rows.length) {
      list.append(el("li", "empty", "No visits yet"));
      return;
    }
    rows.forEach(([label, count]) => {
      const li = el("li");
      li.style.setProperty("--w", `${(count / rows[0][1]) * 100}%`);
      li.append(el("span", "", label), el("b", "", count));
      list.append(li);
    });
  }

  const FIELDS = [
    ["Time", "when"],
    ["Anonymous id", "anonymous_id"],
    ["Page", "page"],
    ["Referrer", "referrer"],
    ["Language", "language"],
    ["Languages", "languages"],
    ["Timezone", "timezone"],
    ["Platform", "platform"],
    ["Vendor", "vendor"],
    ["Browser", "browser"],
    ["Screen", "screen"],
    ["Viewport", "viewport"],
    ["Color depth", "color_depth"],
    ["Touch points", "touch_points"],
    ["CPU cores", "cpu_cores"],
    ["Device memory (GB)", "device_memory_gb"],
    ["Cookies enabled", "cookies_enabled"],
    ["User agent", "user_agent"],
  ];

  function renderVisits() {
    const box = $("visits");
    box.replaceChildren();
    const q = $("search").value.trim().toLowerCase();
    const list = q ? visits.filter((v) => JSON.stringify(v).toLowerCase().includes(q)) : visits;
    if (!list.length) {
      box.append(el("p", "empty", q ? "No visits match that search." : "No accepted visits yet."));
      $("more").hidden = true;
      return;
    }
    list.slice(0, shown).forEach((v) => {
      const item = el("details", "visit");
      const sum = el("summary");
      sum.append(
        el("span", "", fmt(v.iso)),
        el("span", "id", v.anonymous_id || "—"),
        el("span", "ellip", `${refHost(v.referrer)} → ${v.page || ""}`),
        el("span", "dev", device(v))
      );
      const dl = el("dl");
      FIELDS.forEach(([label, key]) => dl.append(el("dt", "", label), el("dd", "", v[key] || "—")));
      item.append(sum, dl);
      box.append(item);
    });
    $("more").hidden = list.length <= shown;
  }

  function renderChanges(changes) {
    const list = $("changes");
    list.replaceChildren();
    if (!changes.length) {
      list.append(el("li", "empty", "No changes found"));
      return;
    }
    changes.forEach((c) => {
      const li = el("li");
      const time = el("time", "", fmt(c.when));
      const body = el("div");
      const link = el("a", "", c.message || c.sha);
      if (/^https:\/\/github\.com\//.test(c.url || "")) {
        link.href = c.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      const files = (c.files || []).join(", ") + (c.extra ? ` +${c.extra}` : "");
      body.append(link, el("small", "", files));
      li.append(time, body);
      list.append(li);
    });
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function refresh() {
    const btn = $("refresh");
    const msg = $("desk-msg");
    btn.disabled = true;
    const started = Date.now() - 5000;
    try {
      say(msg, "Checking for new visits… this usually takes under a minute.");
      await gh(`/actions/workflows/${WORKFLOW}/dispatches`, { method: "POST", body: JSON.stringify({ ref: "main" }) });
      const deadline = Date.now() + 180000;
      let run = null;
      while (Date.now() < deadline) {
        await sleep(4000);
        const data = await gh(`/actions/workflows/${WORKFLOW}/runs?event=workflow_dispatch&per_page=5`);
        run = (data.workflow_runs || []).find((r) => new Date(r.created_at).getTime() >= started) || null;
        if (run && run.status === "completed") break;
      }
      if (!run || run.status !== "completed") throw new Error("slow");
      if (run.conclusion !== "success") throw new Error("failed");
      await sleep(1500);
      await load();
      say(msg, "Up to date.", "ok");
    } catch (err) {
      const text =
        err.message === "auth"
          ? "Your token was rejected. Lock and unlock with a new one."
          : err.message === "access"
            ? "This token cannot run the refresh. It needs Actions: read and write on portfolio-desk."
            : err.message === "slow"
              ? "GitHub is still working on it. Try Refresh again in a minute."
              : "Refresh failed. Try again in a minute.";
      say(msg, text, "err");
    } finally {
      btn.disabled = false;
    }
  }

  async function open() {
    try {
      await load();
      lock.hidden = true;
      desk.hidden = false;
      return true;
    } catch (err) {
      setToken("");
      say(
        $("lock-msg"),
        err.message === "auth" || err.message === "access"
          ? "That token cannot open the private dashboard repo."
          : "Could not load the dashboard. Check your connection and try again.",
        "err"
      );
      return false;
    }
  }

  $("unlock-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = $("token").value.trim();
    if (!token) return;
    setToken(token, $("remember").checked);
    $("token").value = "";
    say($("lock-msg"), "Opening…");
    if (await open()) say($("lock-msg"), "");
  });

  $("lock-btn").addEventListener("click", () => {
    setToken("");
    visits = [];
    desk.hidden = true;
    lock.hidden = false;
    $("token").focus();
  });

  $("refresh").addEventListener("click", refresh);
  $("search").addEventListener("input", () => {
    shown = PAGE;
    renderVisits();
  });
  $("more").addEventListener("click", () => {
    shown += PAGE;
    renderVisits();
  });

  if (getToken()) open();
})();
