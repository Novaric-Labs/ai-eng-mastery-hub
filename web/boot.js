/* boot.js — turns the static study app into a gated product.
   Runs AFTER the rendering engine. Responsibilities:
   1. Cover the app immediately (no empty-state flash).
   2. Supabase auth: magic link + Google.
   3. Fetch content (RLS returns public + paid-if-entitled), hydrate the engine's
      data globals, gate locked modules behind a paywall.
   4. Sync progress to the DB instead of localStorage.
   Reads window.APP_CONFIG (from config.js) and the engine globals (BLOCKS,
   MODULES, QUIZ, DEEP, DEPTH, PLAIN, GLOSSARY, CARDS, SCENARIOS, S, render…),
   which are visible across classic <script> tags. */
(function () {
  var cfg = window.APP_CONFIG || {};
  var sb = null;          // supabase client
  var ENTITLED = false;   // does the current user have access?
  var USER = null;
  var gatesInstalled = false; // wrapper installers must run once — re-auth
  var syncInstalled = false;  // events would otherwise stack the wrappers

  // ---------- overlay ----------
  function cover(html) {
    var el = document.getElementById("bootcover");
    if (!el) {
      el = document.createElement("div");
      el.id = "bootcover";
      document.body.appendChild(el);
    }
    el.innerHTML = html || '<div class="bc-spin"></div>';
    el.style.display = "flex";
  }
  function uncover() {
    var el = document.getElementById("bootcover");
    if (el) el.style.display = "none";
  }

  // ---------- auth screens ----------
  function authScreen(msg) {
    cover(
      '<div class="bc-card">' +
        '<div class="bc-logo">⚡ AI Engineering Mastery Hub</div>' +
        '<p class="bc-sub">Sign in to start. New here? The same step creates your account.</p>' +
        (msg ? '<div class="bc-msg">' + msg + "</div>" : "") +
        '<input id="bc-email" type="email" placeholder="you@email.com" autocomplete="email">' +
        '<button id="bc-magic" class="bc-btn">Email me a sign-in link</button>' +
        '<div class="bc-or">or</div>' +
        '<button id="bc-google" class="bc-btn bc-ghost">Continue with Google</button>' +
      "</div>"
    );
    document.getElementById("bc-magic").onclick = function () {
      var email = document.getElementById("bc-email").value.trim();
      if (!email) return;
      this.disabled = true; this.textContent = "Sending…";
      sb.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: window.location.origin + window.location.pathname },
      }).then(function (r) {
        authScreen(r.error ? "Error: " + r.error.message
          : "Check your email for a sign-in link to <b>" + email + "</b>.");
      });
    };
    document.getElementById("bc-google").onclick = function () {
      sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + window.location.pathname },
      });
    };
  }

  // ---------- content hydration ----------
  function hydrate(rows) {
    var byId = {};
    rows.forEach(function (r) { byId[r.id] = r.data; });

    BLOCKS = byId["meta:blocks"] || [];
    PLAIN = byId["plain"] || {};
    GLOSSARY = byId["glossary"] || [];
    CARDS = byId["cards"] || [];
    SCENARIOS = byId["scenarios"] || [];
    QUIZ = {}; DEEP = {}; DEPTH = {}; PATTERNS = {};

    // MODULES: start from the public catalog (all modules, light), then upgrade
    // each one we actually received a full body for. Missing body => locked.
    var catalog = byId["meta:catalog"] || [];
    MODULES = catalog.map(function (c) {
      var full = byId["module:" + c.id];
      if (full && full.mod) {
        if (full.deep) DEEP[c.id] = full.deep;
        if (full.depth) DEPTH[c.id] = full.depth;
        if (full.patterns) PATTERNS[c.id] = full.patterns;
        if (byId["quiz:" + c.id]) QUIZ[c.id] = byId["quiz:" + c.id];
        var m = full.mod;
        if (m.estMin == null) m.estMin = c.estMin;
        return m;
      }
      c.__locked = true; // catalog-only: title/tag/why for the upsell, no body
      return c;
    });
  }

  // ---------- paywall ----------
  function buy() {
    cover('<div class="bc-card"><div class="bc-spin"></div><p class="bc-sub">Opening secure checkout…</p></div>');
    sb.auth.getSession().then(function (s) {
      var token = s.data.session && s.data.session.access_token;
      return fetch(cfg.FUNCTIONS_BASE + "/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      });
    }).then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.url) window.location.href = d.url;
        else { uncover(); alert("Could not start checkout: " + (d.error || "unknown")); }
      })
      .catch(function (e) { uncover(); alert("Checkout error: " + e); });
  }

  window.__redeemCode = function (code) {
    if (!code) return;
    sb.rpc("redeem_access_code", { p_code: code.trim() }).then(function (r) {
      var v = r.data;
      if (v === "ok") { cover(); reloadEntitled(); }
      else alert({
        invalid: "That code isn't valid.",
        expired: "That code has expired.",
        exhausted: "That code has been fully used.",
        not_authenticated: "Please sign in first.",
      }[v] || ("Could not redeem: " + (r.error ? r.error.message : v)));
    });
  };
  window.__buy = buy;

  function paywallCard(title, blurb) {
    return (
      '<div class="card" style="border-color:var(--accent2)">' +
      '<b style="color:var(--accent2)">🔒 ' + (title || "Full course") + "</b>" +
      '<p style="color:var(--dim);margin:6px 0 12px">' + (blurb ||
        "This is part of the full curriculum. Unlock lifetime access to all 21 modules, quizzes, flashcards, scenarios, and code patterns.") + "</p>" +
      '<button class="btn" onclick="window.__buy()">Unlock full access</button>' +
      '<button class="btn ghost" onclick="var c=prompt(\'Enter your access code\');if(c)window.__redeemCode(c)">I have a code</button>' +
      "</div>"
    );
  }

  // Wrap the engine's renderers to enforce the paywall for non-entitled users.
  // Idempotent: onAuthed fires on every auth event (sign-in, code redemption via
  // reloadEntitled), and re-wrapping would stack wrappers (duplicate upserts,
  // duplicate sidebar buttons). renderMod checks ENTITLED dynamically, so a
  // single install keeps gating correct across entitlement changes.
  function installGates() {
    if (gatesInstalled) return;
    gatesInstalled = true;
    var __rm = renderMod;
    renderMod = function (id) {
      var m = MODULES.find(function (x) { return x.id === id; });
      if (!ENTITLED && m && m.__locked) {
        return '<h2>' + (m.title || "Module") + "</h2>" +
          '<p class="tagline">' + (m.tag || "") + "</p>" +
          (m.why ? '<div class="card"><b>Why this matters</b><p style="margin-top:6px;color:var(--dim)">' + m.why + "</p></div>" : "") +
          paywallCard("Unlock " + (m.title || "this module"),
            "You're viewing the free preview. Get this module plus the full course.");
      }
      return __rm(id);
    };
    // Like renderMod above, these check ENTITLED at CALL time, not install
    // time — installing them conditionally would freeze the first user's
    // entitlement into the wrappers (sign-out -> different user sign-in in
    // the same tab would then show the wrong paywall/upsell state).
    var __rcards = renderCards;
    renderCards = function () {
      if (!ENTITLED && !CARDS.length) return "<h2>Flashcards</h2>" + paywallCard("Flashcards",
        "Spaced-repetition flashcards unlock with full access.");
      return __rcards();
    };
    var __rscen = renderScen;
    renderScen = function () {
      if (!ENTITLED && !SCENARIOS.length) return "<h2>Scenario Challenges</h2>" + paywallCard("Scenarios",
        "Production-judgment scenarios unlock with full access.");
      return __rscen();
    };
    // upsell button in the sidebar
    var __rs = renderSide;
    renderSide = function () {
      __rs();
      if (ENTITLED) return;
      var side = document.getElementById("side");
      var b = document.createElement("button");
      b.className = "navbtn"; b.style.cssText = "color:var(--accent2);font-weight:600";
      b.textContent = "🔓 Unlock full access";
      b.onclick = buy;
      side.insertBefore(b, side.firstChild);
    };
  }

  // ---------- progress sync (replaces localStorage) ----------
  // Idempotent for the same reason as installGates: a stacked save wrapper
  // means one debounced upsert per stack level on every save().
  function installProgressSync() {
    if (syncInstalled) return;
    syncInstalled = true;
    var saveTimer = null;
    var __save = save;
    save = function () {
      __save(); // keep localStorage as an offline cache
      if (!USER) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        sb.from("progress").upsert({ user_id: USER.id, state: S, updated_at: new Date().toISOString() }).then(function () {});
      }, 800);
    };
  }

  // ---------- session lifecycle ----------
  function reloadEntitled() { if (USER) onAuthed(USER); }

  function onAuthed(user) {
    USER = user;
    cover();
    Promise.all([
      sb.from("content").select("id,tier,data"),
      sb.from("entitlements").select("active").maybeSingle(),
      sb.from("progress").select("state").maybeSingle(),
    ]).then(function (res) {
      var content = res[0].data || [];
      ENTITLED = !!(res[1].data && res[1].data.active);
      hydrate(content);
      if (res[2].data && res[2].data.state) {
        try { S = Object.assign(S, res[2].data.state); } catch (e) {}
      }
      installGates();
      installProgressSync();
      window.__READY = true;
      uncover();
      // the engine's hash router already parsed the initial route from the URL
      // into the global `route` at load; just render it now that data is ready.
      if (!route || !route.page) route = { page: "dash", tab: "learn" };
      render();
    });
  }

  function start() {
    if (!cfg.SUPABASE_URL || !window.supabase) {
      cover('<div class="bc-card"><b>Setup needed</b><p class="bc-sub">config.js / Supabase not loaded. See docs/DEPLOY.md.</p></div>');
      return;
    }
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    window.__sb = sb;
    sb.auth.getSession().then(function (s) {
      var user = s.data.session && s.data.session.user;
      if (user) onAuthed(user);
      else authScreen("");
    });
    sb.auth.onAuthStateChange(function (_e, session) {
      var u = session && session.user;
      if (u && (!USER || USER.id !== u.id)) onAuthed(u);
      if (!u && USER) { USER = null; ENTITLED = false; window.__READY = false; authScreen(""); }
    });
  }

  // cover instantly to hide the engine's empty load-time render, then boot.
  cover();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
