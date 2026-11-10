/* ==========================================================================
   Tarcom Showroom — main.js
   Vanilla ES6+ · لا مكتبات خارجية · بناء الواجهة ديناميكيًا من PRODUCTS
   ========================================================================== */
(() => {
  "use strict";

  /* ---------------------------------------------------------------------
     1) الثوابت والتعريفات
  --------------------------------------------------------------------- */
  const ALL = "__all__";
  const ALL_LABEL = "جميع الماركات";
  const DEFAULT_CURRENCY = "ر.س";

  /* أيقونات SVG ثابتة (محتوى موثوق من الكود فقط) */
  const ICONS = {
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    gpu: '<rect x="2" y="7" width="18" height="10" rx="2"/><circle cx="10" cy="12" r="3"/><path d="M22 9v6M5 17v3M9 17v3"/>',
    ram: '<rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 11v2M10 11v2M14 11v2M18 11v2M6 16v3M10 16v3M14 16v3M18 16v3"/>',
    ssd: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h4M7 15h.01M17 15h.01"/>',
    screen: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    battery: '<rect x="2" y="8" width="17" height="9" rx="2"/><path d="M22 11v3M6 11v3M10 11v3"/>',
    plug: '<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5"/>',
    wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a14 14 0 0 1 20 0"/><path d="M12 20h.01"/>',
    keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 4-7s2 5-2 7M14 12c4 0 7 1 7 4s-5 2-7-2M12 14c0 4-1 7-4 7s-2-5 2-7M10 12c-4 0-7-1-7-4s5-2 7 2"/>',
    weight: '<path d="M6 8h12l2 12H4z"/><circle cx="12" cy="5" r="2"/>',
    os: '<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    chevDown: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    back: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  };

  /* المواصفات المعروضة في البطاقة */
  const CARD_SPECS = [
    { icon: "cpu", label: "المعالج", get: (s) => s.cpu },
    { icon: "ram", label: "الذاكرة", get: (s) => s.ram },
    { icon: "ssd", label: "التخزين", get: (s) => s.storage },
    { icon: "gpu", label: "كرت الشاشة", get: (s) => s.gpu },
    {
      icon: "screen",
      label: "الشاشة",
      get: (s) => [s.screenSize, s.refreshRate].filter(Boolean).join(" • "),
    },
  ];

  /* المواصفات الأساسية في صفحة التفاصيل */
  const ESSENTIAL_SPECS = [
    { icon: "cpu", label: "المعالج", key: "cpu" },
    { icon: "gpu", label: "كرت الشاشة", key: "gpu" },
    { icon: "ram", label: "الذاكرة العشوائية (RAM)", key: "ram" },
    { icon: "ssd", label: "التخزين (SSD)", key: "storage" },
    { icon: "screen", label: "حجم الشاشة ودقتها", key: "screenSize" },
    { icon: "refresh", label: "معدل التحديث", key: "refreshRate" },
  ];

  /* المواصفات الموسّعة مصنّفة */
  const EXTENDED_GROUPS = [
    {
      title: "المعالج",
      icon: "cpu",
      items: [
        ["تفاصيل المعالج", "cpuDetails"],
        ["عدد الأنوية والخيوط", "cores"],
      ],
    },
    {
      title: "كرت الشاشة",
      icon: "gpu",
      items: [
        ["ذاكرة كرت الشاشة (VRAM)", "vram"],
        ["استهلاك الطاقة الرسومية (TGP)", "tgp"],
      ],
    },
    {
      title: "الذاكرة والتخزين",
      icon: "ram",
      items: [
        ["نوع وسرعة RAM", "ramType"],
        ["الحد الأقصى للذاكرة المدعومة", "maxRam"],
        ["نوع SSD ومنافذ التوسعة", "ssdType"],
      ],
    },
    {
      title: "الشاشة",
      icon: "screen",
      items: [
        ["نوع لوحة الشاشة", "panelType"],
        ["سطوع الشاشة", "brightness"],
        ["تغطية الألوان", "colorGamut"],
      ],
    },
    {
      title: "البطارية والتبريد",
      icon: "battery",
      items: [
        ["سعة البطارية", "battery"],
        ["نظام التبريد", "cooling"],
        ["إضاءة لوحة المفاتيح", "keyboard"],
      ],
    },
    {
      title: "الاتصال والمنافذ",
      icon: "wifi",
      items: [
        ["منافذ الاتصال", "ports"],
        ["إصدار Wi-Fi", "wifi"],
        ["إصدار Bluetooth", "bluetooth"],
      ],
    },
    {
      title: "عام",
      icon: "star",
      items: [
        ["الوزن", "weight"],
        ["نظام التشغيل", "os"],
        ["ميزات إضافية", "extras"],
      ],
    },
  ];

  /* ---------------------------------------------------------------------
     2) الحالة والعناصر
  --------------------------------------------------------------------- */
  const state = {
    brand: ALL,
    query: "",
    selectedId: null,
    variantIndex: 0,
    galleryIndex: 0,
    catalogScroll: 0,
    pushed: false, // هل دخلنا صفحة التفاصيل من داخل التطبيق؟
  };

  const $ = (id) => document.getElementById(id);
  const el = {
    count: $("productCount"),
    countLabel: $("productCountLabel"),
    search: $("searchInput"),
    searchClear: $("searchClear"),
    clearFilters: $("clearFilters"),
    brandFilters: $("brandFilters"),
    grid: $("productGrid"),
    empty: $("emptyState"),
    emptyReset: $("emptyReset"),
    catalog: $("catalogView"),
    details: $("detailsView"),
    toast: $("toast"),
    brandLink: $("brandLink"),
    year: $("year"),
  };

  /* ---------------------------------------------------------------------
     3) أدوات مساعدة
  --------------------------------------------------------------------- */

  /** إنشاء عنصر DOM بأمان (textContent فقط) */
  function h(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k === "dataset") Object.assign(node.dataset, v);
      else if (k === "style") node.style.cssText = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const c of [].concat(children)) {
      if (c == null || c === false) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  /** أيقونة SVG */
  function icon(name, cls = "") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    if (cls) svg.setAttribute("class", cls);
    svg.innerHTML = ICONS[name] || ""; // محتوى ثابت من الكود
    return svg;
  }

  /** نص تقني (إنجليزي/أرقام) يبقى LTR داخل الواجهة العربية */
  function ltr(text, tag = "bdi") {
    return h(tag, { class: "ltr", dir: "ltr" }, text);
  }

  /** هل النص يحتوي على حروف عربية؟ */
  const hasArabic = (s) => /[؀-ۿ]/.test(s);

  /** عرض قيمة مواصفة: العربي dir=auto، التقني LTR */
  function specValue(value) {
    const v = String(value);
    return hasArabic(v) ? h("bdi", { dir: "auto" }, v) : ltr(v);
  }

  /** تطبيع النص العربي للبحث */
  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[ً-ٰٟـ]/g, "") // التشكيل والتطويل
      .replace(/[إأآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)) // أرقام عربية → لاتينية
      .trim();
  }

  const hasPrice = (n) => n !== null && n !== undefined && n !== "";
  const formatPrice = (n) => (hasPrice(n) ? Number(n).toLocaleString("en-US") : "عند الطلب");

  /** صياغة عدّاد الأجهزة بالعربية الصحيحة */
  function countLabel(n) {
    if (n === 0) return "لا توجد أجهزة";
    if (n === 1) return "جهاز متوفر";
    if (n === 2) return "جهازان متوفران";
    if (n <= 10) return "أجهزة متوفرة";
    return "جهازًا متوفرًا";
  }

  /** صورة بديلة عند غياب الصورة (SVG مضمّن) */
  function placeholderImage(brand = "") {
    const safe = String(brand).replace(/[<>&"]/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2B7FD3"/><stop offset="1" stop-color="#07305C"/></linearGradient></defs>
      <rect x="70" y="30" width="260" height="164" rx="14" fill="#1b2a40"/>
      <rect x="80" y="40" width="240" height="144" rx="7" fill="url(#g)"/>
      <path d="M80 150 Q170 90 320 70 L320 184 L80 184Z" fill="#F58A25" opacity=".92"/>
      <path d="M30 206h340l-22 22H52z" fill="#c9d3e0"/>
      <rect x="165" y="206" width="70" height="6" rx="3" fill="#a8b5c7"/>
      <text x="200" y="124" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#fff" letter-spacing="2">${safe}</text>
    </svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /** صورة مع معالجة الفشل */
  function productImage(src, brand, alt, extra = {}) {
    const img = h("img", { alt, loading: "lazy", decoding: "async", ...extra });
    img.addEventListener(
      "error",
      () => {
        img.onerror = null;
        img.src = placeholderImage(brand);
      },
      { once: true }
    );
    img.src = src || placeholderImage(brand);
    return img;
  }

  /** مواصفات المنتج الفعلية (مع دمج التهيئة المختارة) */
  function getEffective(product) {
    const variant = product.variants?.[state.variantIndex];
    return {
      price: variant?.price ?? product.price,
      specs: { ...product.specs, ...(variant?.specs || {}) },
    };
  }

  const hasValue = (v) => v !== undefined && v !== null && String(v).trim() !== "";

  let toastTimer;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.toast.hidden = true), 2200);
  }

  /* ---------------------------------------------------------------------
     4) الفلترة
  --------------------------------------------------------------------- */
  function getFiltered() {
    const q = normalize(state.query);
    const tokens = q ? q.split(/\s+/) : [];
    return PRODUCTS.filter((p) => {
      if (state.brand !== ALL && p.brand !== state.brand) return false;
      if (!tokens.length) return true;
      const s = p.specs || {};
      const haystack = normalize(
        [p.brand, p.model, p.description, s.cpu, s.gpu, s.ram, s.storage, s.screenSize, s.os].join(" ")
      );
      return tokens.every((t) => haystack.includes(t));
    });
  }

  const isFiltering = () => state.brand !== ALL || state.query.trim() !== "";

  /* ---------------------------------------------------------------------
     5) رسم الكتالوج
  --------------------------------------------------------------------- */
  function renderBrandFilters() {
    const brands = [...new Set(PRODUCTS.map((p) => p.brand))];
    const counts = PRODUCTS.reduce((m, p) => ((m[p.brand] = (m[p.brand] || 0) + 1), m), {});
    const make = (value, label, count) =>
      h(
        "button",
        {
          class: "chip",
          type: "button",
          role: "tab",
          "aria-selected": String(state.brand === value),
          dataset: { brand: value },
        },
        [h("span", {}, value === ALL ? label : ltr(label)), h("span", { class: "chip-count" }, String(count))]
      );

    el.brandFilters.replaceChildren(
      make(ALL, ALL_LABEL, PRODUCTS.length),
      ...brands.map((b) => make(b, b, counts[b]))
    );
  }

  function updateBrandSelection() {
    el.brandFilters.querySelectorAll(".chip").forEach((chip) => {
      chip.setAttribute("aria-selected", String(chip.dataset.brand === state.brand));
    });
  }

  function buildCard(p, index) {
    const specs = p.specs || {};
    const list = h("ul", { class: "mini-specs" });
    CARD_SPECS.forEach((row) => {
      const val = row.get(specs);
      if (!hasValue(val)) return;
      list.append(
        h("li", {}, [
          icon(row.icon),
          h("span", {}, [h("span", { class: "k" }, row.label), h("span", { class: "v" }, specValue(val))]),
        ])
      );
    });

    const inStock = p.inStock !== false;
    const card = h(
      "button",
      {
        class: "card",
        type: "button",
        style: `--i:${Math.min(index, 14)}`,
        dataset: { id: p.id },
        "aria-label": `عرض تفاصيل ${p.brand} ${p.model}`,
      },
      [
        h("div", { class: "card-media" }, [
          productImage(p.image || p.images?.[0], p.brand, `${p.brand} ${p.model}`),
          h("span", { class: `badge ${inStock ? "badge-ok" : "badge-out"}` }, inStock ? "متوفر" : "غير متوفر حاليًا"),
          h("span", { class: "card-brand-tag" }, ltr(p.brand)),
        ]),
        h("div", { class: "card-body" }, [h("h3", { class: "card-title" }, ltr(p.model, "bdi")), list]),
        h("div", { class: "card-footer" }, [
          h("div", { class: "price" }, [
            h("span", { class: "price-value" }, formatPrice(getPriceForCard(p))),
            h("span", { class: "price-cur" }, hasPrice(getPriceForCard(p)) ? p.currency || DEFAULT_CURRENCY : ""),
          ]),
          h("span", { class: "card-cta" }, ["التفاصيل", icon("arrow")]),
        ]),
      ]
    );
    return card;
  }

  const getPriceForCard = (p) => p.price ?? p.variants?.[0]?.price ?? null;

  function bump(node) {
    node.classList.remove("bump");
    void node.offsetWidth;
    node.classList.add("bump");
    setTimeout(() => node.classList.remove("bump"), 300);
  }

  function renderCatalog() {
    const items = getFiltered();
    el.grid.replaceChildren(...items.map(buildCard));
    el.grid.hidden = items.length === 0;
    el.empty.hidden = items.length !== 0;

    el.count.textContent = String(items.length);
    el.countLabel.textContent = countLabel(items.length);
    bump(el.count);

    el.clearFilters.hidden = !isFiltering();
    el.searchClear.hidden = state.query === "";
  }

  function resetFilters(silent = false) {
    state.brand = ALL;
    state.query = "";
    el.search.value = "";
    updateBrandSelection();
    renderCatalog();
    if (!silent) toast("تم مسح الفلاتر");
  }

  /* ---------------------------------------------------------------------
     6) صفحة التفاصيل
  --------------------------------------------------------------------- */
  function buildDetails(p) {
    const { price, specs } = getEffective(p);
    const inStock = p.inStock !== false;
    const gallery = (p.images?.length ? p.images : [p.image]).filter(Boolean);
    const currentImg = gallery[state.galleryIndex] || gallery[0];

    /* --- المعرض --- */
    const main = h("div", { class: "gallery-main" }, [
      productImage(currentImg, p.brand, `${p.brand} ${p.model}`, { loading: "eager" }),
    ]);
    const galleryEl = h("div", { class: "gallery" }, [main]);
    if (gallery.length > 1) {
      galleryEl.append(
        h(
          "div",
          { class: "thumbs" },
          gallery.map((src, i) =>
            h(
              "button",
              {
                class: "thumb",
                type: "button",
                "aria-label": `الصورة ${i + 1}`,
                "aria-current": String(i === state.galleryIndex),
                onclick: () => {
                  state.galleryIndex = i;
                  showDetails(p.id, { keepScroll: true });
                },
              },
              productImage(src, p.brand, "")
            )
          )
        )
      );
    }

    /* --- نظرة عامة --- */
    const overview = h("div", { class: "overview" }, [
      h("span", { class: "overview-brand" }, ltr(p.brand)),
      h("h2", { class: "overview-title", id: "detailsTitle", tabindex: "-1" }, ltr(p.model)),
      h("div", { class: "overview-price-row" }, [
        h("div", { class: "price" }, [
          h("span", { class: "price-value" }, formatPrice(price)),
          h("span", { class: "price-cur" }, hasPrice(price) ? p.currency || DEFAULT_CURRENCY : ""),
        ]),
        h("span", { class: `status ${inStock ? "status-ok" : "status-out"}` }, inStock ? "متوفر في المعرض" : "غير متوفر حاليًا"),
      ]),
    ]);

    if (p.variants?.length > 1) {
      overview.append(
        h(
          "div",
          { class: "variants", role: "group", "aria-label": "اختر التهيئة" },
          p.variants.map((v, i) =>
            h(
              "button",
              {
                class: "variant-btn",
                type: "button",
                "aria-pressed": String(i === state.variantIndex),
                onclick: () => {
                  state.variantIndex = i;
                  showDetails(p.id, { keepScroll: true });
                },
              },
              v.label
            )
          )
        )
      );
    }
    if (hasValue(p.description)) overview.append(h("p", { class: "overview-desc" }, p.description));

    /* --- المواصفات الأساسية --- */
    const tiles = [];
    ESSENTIAL_SPECS.forEach((row) => {
      const val = specs[row.key];
      if (!hasValue(val)) return;
      tiles.push(
        h("div", { class: "tile", style: `--i:${tiles.length}` }, [
          h("div", { class: "tile-icon" }, icon(row.icon)),
          h("div", {}, [h("div", { class: "tile-label" }, row.label), h("div", { class: "tile-value" }, specValue(val))]),
        ])
      );
    });

    /* --- المواصفات الموسعة (فقط ما له قيمة) --- */
    const groups = EXTENDED_GROUPS.map((g) => {
      const rows = g.items.filter(([, key]) => hasValue(specs[key]));
      if (!rows.length) return null;
      return h("section", { class: "spec-group" }, [
        h("h3", {}, [icon(g.icon), g.title]),
        h(
          "dl",
          { class: "spec-rows" },
          rows.map(([label, key]) =>
            h("div", { class: "spec-row" }, [h("dt", {}, label), h("dd", {}, specValue(specs[key]))])
          )
        ),
      ]);
    }).filter(Boolean);

    const frag = document.createDocumentFragment();
    frag.append(
      h("div", { class: "details-nav" }, [
        h(
          "button",
          { class: "btn btn-ghost", type: "button", id: "backBtn", onclick: goBack },
          [icon("back"), "العودة إلى الأجهزة"]
        ),
      ]),
      h("article", { class: "details-hero", "aria-labelledby": "detailsTitle" }, [galleryEl, overview])
    );

    if (tiles.length) {
      frag.append(h("h3", { class: "section-title" }, "المواصفات الأساسية"), h("div", { class: "essentials" }, tiles));
    }

    if (groups.length) {
      const panelId = "extendedSpecs";
      const panel = h("div", { class: "extended", id: panelId }, h("div", { class: "extended-inner" }, h("div", { class: "spec-groups" }, groups)));
      const btn = h(
        "button",
        { class: "btn btn-accent more-btn", type: "button", "aria-expanded": "false", "aria-controls": panelId },
        [h("span", { class: "more-label" }, "عرض المزيد من المواصفات"), icon("chevDown", "chev")]
      );
      btn.addEventListener("click", () => {
        const open = panel.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
        btn.querySelector(".more-label").textContent = open ? "إخفاء المواصفات الإضافية" : "عرض المزيد من المواصفات";
        if (open) setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "nearest" }), 150);
      });
      frag.append(h("div", { class: "more-wrap" }, btn), panel);
    }
    return frag;
  }

  function showDetails(id, { keepScroll = false } = {}) {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return showCatalog();

    if (state.selectedId !== id) {
      state.variantIndex = 0;
      state.galleryIndex = 0;
    }
    if (!state.selectedId) state.catalogScroll = window.scrollY;
    state.selectedId = id;

    el.details.replaceChildren(buildDetails(product));
    swapView(el.catalog, el.details, () => {
      if (!keepScroll) window.scrollTo({ top: 0, behavior: "auto" });
      if (!keepScroll) $("detailsTitle")?.focus({ preventScroll: true });
    });
    document.title = `${product.brand} ${product.model} | Tarcom`;
  }

  function showCatalog() {
    state.selectedId = null;
    swapView(el.details, el.catalog, () => {
      window.scrollTo({ top: state.catalogScroll, behavior: "auto" });
    });
    document.title = "معرض اللابتوبات | Tarcom";
  }

  /** انتقال سلس بين الشاشتين */
  function swapView(from, to, after) {
    if (!from.hidden && from !== to) {
      from.classList.add("leaving");
      setTimeout(() => {
        from.classList.remove("leaving");
        from.hidden = true;
        to.hidden = false;
        after?.();
      }, 180);
    } else {
      to.hidden = false;
      after?.();
    }
  }

  /* ---------------------------------------------------------------------
     7) التنقل (Hash router) — يحافظ على الفلاتر والبحث لأن الحالة في الذاكرة
  --------------------------------------------------------------------- */
  function openProduct(id) {
    state.pushed = true;
    location.hash = `#/product/${encodeURIComponent(id)}`;
  }

  function goBack() {
    if (state.pushed) history.back();
    else location.hash = "";
  }

  function route() {
    const m = location.hash.match(/^#\/product\/(.+)$/);
    if (m) showDetails(decodeURIComponent(m[1]));
    else if (state.selectedId || !el.details.hidden) showCatalog();
  }

  /* ---------------------------------------------------------------------
     8) الأحداث
  --------------------------------------------------------------------- */
  function bindEvents() {
    el.brandFilters.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state.brand = chip.dataset.brand;
      updateBrandSelection();
      renderCatalog();
      chip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });

    el.grid.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (card) openProduct(card.dataset.id);
    });

    el.search.addEventListener("input", () => {
      state.query = el.search.value;
      renderCatalog();
    });
    el.searchClear.addEventListener("click", () => {
      el.search.value = "";
      state.query = "";
      renderCatalog();
      el.search.focus();
    });

    el.clearFilters.addEventListener("click", () => resetFilters());
    el.emptyReset.addEventListener("click", () => resetFilters());

    el.brandLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (state.selectedId) goBack();
      else {
        resetFilters(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.selectedId) goBack();
    });

    window.addEventListener("hashchange", route);
  }

  /* ---------------------------------------------------------------------
     9) التشغيل
  --------------------------------------------------------------------- */
  function init() {
    if (!Array.isArray(window.PRODUCTS) && typeof PRODUCTS === "undefined") return;
    el.year.textContent = new Date().getFullYear();
    renderBrandFilters();
    renderCatalog();
    bindEvents();
    route(); // يدعم فتح رابط منتج مباشرة
  }

  init();
})();
