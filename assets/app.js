(function initSotayApp() {
  const bootstrap = window.SOTAY_BOOTSTRAP || {};
  const pdfCollection = window.SOTAY_PDF_COLLECTION || {};

  function buildDataset(treeData) {
    return window.SotayAdapter.buildDataset(treeData || window.SOTAY_DEMO_TREE || []);
  }

  const state = {
    dataset: buildDataset(bootstrap.treeData),
    activeTab: "home",
    currentSearchType: "all",
    currentSearchQuery: "",
    currentBreadcrumbNodeId: null,
    currentDetailNodeId: null,
    selectedRating: "",
    openModalId: null,
    hasLiveData: false,
    lastFocusedElement: null,
    searchHistory: JSON.parse(localStorage.getItem("sotay_v3_search_history") || "[]"),
    recentViews: JSON.parse(localStorage.getItem("sotay_v3_recent_views") || "[]")
  };

  const dom = {
    root: document.documentElement,
    tabs: [...document.querySelectorAll("[role='tab']")],
    panels: [...document.querySelectorAll("[data-panel]")],
    categoryGrid: document.getElementById("categoryGrid"),
    rulesRoot: document.getElementById("rulesRoot"),
    faqList: document.getElementById("faqList"),
    formsList: document.getElementById("formsList"),
    featuredFaq: document.getElementById("featuredFaq"),
    featuredForms: document.getElementById("featuredForms"),
    breadcrumb: document.getElementById("breadcrumb"),
    stats: {
      total: document.getElementById("statTotal"),
      categories: document.getElementById("statCategories"),
      forms: document.getElementById("statForms"),
      faq: document.getElementById("statFaq")
    },
    searchModal: document.getElementById("searchDialog"),
    searchInput: document.getElementById("modalSearchInput"),
    searchType: document.getElementById("searchType"),
    searchResults: document.getElementById("searchResults"),
    heroSearchInput: document.getElementById("heroSearchInput"),
    searchHistory: document.getElementById("searchHistory"),
    detailModal: document.getElementById("detailDialog"),
    detailTitle: document.getElementById("detailTitle"),
    detailMeta: document.getElementById("detailMeta"),
    detailContent: document.getElementById("detailContent"),
    feedbackForm: document.getElementById("feedbackForm"),
    feedbackText: document.getElementById("feedbackText"),
    feedbackStatus: document.getElementById("feedbackStatus"),
    themeToggle: document.querySelector("[data-action='toggle-theme']"),
    themeToggleIcon: document.getElementById("themeToggleIcon"),
    ratingButtons: [...document.querySelectorAll("[data-action='set-rating']")],
    recentPanel: document.getElementById("recentPanel"),
    recentViews: document.getElementById("recentViews"),
    toast: document.getElementById("toast"),
    toastMessage: document.getElementById("toastMessage")
  };

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function sanitizeUrl(url) {
    const value = String(url || "").trim();
    if (!value) return "";
    if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
    if (value.startsWith("#") || value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) return value;
    return "";
  }

  function buildPdfHref(ref) {
    if (!ref || !ref.doc) return "";

    const pdf = pdfCollection[ref.doc];
    if (!pdf) return "";

    const directUrl = sanitizeUrl(pdf.url);
    if (directUrl) {
      if (ref.page && !directUrl.includes("#page=")) {
        return `${directUrl}#page=${encodeURIComponent(String(ref.page))}`;
      }
      return directUrl;
    }

    const viewerUrl = sanitizeUrl(bootstrap.pdfViewerUrl);
    const fileName = String(pdf.file || "").trim();
    const basePath = String(bootstrap.pdfBasePath || "..").trim().replace(/\/+$/, "");
    if (!viewerUrl || !fileName) return "";

    let href = `${viewerUrl}?file=${encodeURIComponent(`${basePath}/${fileName}`)}`;
    if (ref.page) href += `#page=${encodeURIComponent(String(ref.page))}`;
    return href;
  }

  function sanitizeRichHtml(input) {
    if (!input) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${input}</div>`, "text/html");
    const allowedTags = new Set(["A", "B", "BLOCKQUOTE", "BR", "DIV", "EM", "I", "LI", "OL", "P", "SPAN", "STRONG", "TABLE", "TBODY", "TD", "TH", "THEAD", "TR", "U", "UL"]);
    const allowedAttrs = new Set(["class", "colspan", "href", "rowspan", "target", "title"]);

    doc.body.querySelectorAll("*").forEach((element) => {
      if (!allowedTags.has(element.tagName)) {
        element.replaceWith(...element.childNodes);
        return;
      }

      [...element.attributes].forEach((attribute) => {
        if (!allowedAttrs.has(attribute.name)) {
          element.removeAttribute(attribute.name);
        }
      });

      if (element.tagName === "A") {
        const safeHref = sanitizeUrl(element.getAttribute("href"));
        if (safeHref) {
          element.setAttribute("href", safeHref);
          element.setAttribute("rel", "noopener noreferrer");
        } else {
          element.removeAttribute("href");
        }
      }
    });

    return doc.body.firstElementChild ? doc.body.firstElementChild.innerHTML : doc.body.innerHTML;
  }

  function highlightText(text, keyword) {
    if (!keyword) return escapeHtml(text);
    const safe = escapeHtml(text);
    const normalizedKeyword = String(keyword || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return safe.replace(new RegExp(`(${normalizedKeyword})`, "gi"), "<mark>$1</mark>");
  }

  function getTypeLabel(type) {
    if (type === "faq") return "Hỏi đáp";
    if (type === "form") return "Biểu mẫu";
    return "Quy định";
  }

  function formatCount(value) {
    return Number(value || 0).toLocaleString("vi-VN");
  }

  function collectFocusableElements(modal) {
    return [...modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter((element) => !element.disabled);
  }

  function showToast(message) {
    dom.toastMessage.textContent = message;
    dom.toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      dom.toast.hidden = true;
    }, 3200);
  }

  function getThemeIcon(theme) {
    if (theme === "dark") {
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path>
      </svg>
    `;
  }

  function openModal(modal, initialFocusSelector) {
    state.openModalId = modal.id;
    state.lastFocusedElement = document.activeElement;
    modal.hidden = false;
    const target = initialFocusSelector ? modal.querySelector(initialFocusSelector) : collectFocusableElements(modal)[0];
    if (target) target.focus();
  }

  function closeModal(modal) {
    modal.hidden = true;
    if (state.openModalId === modal.id) state.openModalId = null;
    if (modal.id === "detailDialog") state.currentDetailNodeId = null;
    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === "function") {
      state.lastFocusedElement.focus();
    }
  }

  function saveRecentViews() {
    localStorage.setItem("sotay_v3_recent_views", JSON.stringify(state.recentViews.slice(0, 6)));
  }

  function addRecentView(node) {
    const item = {
      id: node.id,
      title: node.fileName || node.title,
      type: getTypeLabel(node.type)
    };
    state.recentViews = state.recentViews.filter((entry) => entry.id !== item.id);
    state.recentViews.unshift(item);
    saveRecentViews();
    renderRecentViews();
  }

  function saveSearchHistory() {
    localStorage.setItem("sotay_v3_search_history", JSON.stringify(state.searchHistory.slice(0, 6)));
  }

  function pushSearchHistory(query) {
    const trimmed = String(query || "").trim();
    if (!trimmed || trimmed.length < 2) return;
    state.searchHistory = state.searchHistory.filter((item) => item !== trimmed);
    state.searchHistory.unshift(trimmed);
    saveSearchHistory();
    renderSearchHistory();
  }

  function buildBreadcrumb(node) {
    return (node.pathTitles || []).map((title, index, list) => {
      const currentClass = index === list.length - 1 ? " breadcrumb__item--current" : "";
      const separator = index < list.length - 1 ? '<span class="breadcrumb__sep">/</span>' : "";
      return `<span class="breadcrumb__item${currentClass}">${escapeHtml(title)}</span>${separator}`;
    }).join("");
  }

  function splitSectionTitle(title) {
    const match = String(title || "").trim().match(/^(PHẦN\s+\d+)\s*:\s*(.+)$/i);
    if (!match) return null;
    return {
      prefix: match[1].toUpperCase(),
      name: match[2].trim()
    };
  }

  function renderCategoryTitle(title, headingId) {
    const parsed = splitSectionTitle(title);
    if (!parsed) {
      return `<h3 id="${headingId}" class="category-heading">${escapeHtml(title)}</h3>`;
    }

    return `
      <h3 id="${headingId}" class="category-heading category-heading--split">
        <span class="category-heading__prefix">${escapeHtml(parsed.prefix)}</span>
        <span class="category-heading__name">${escapeHtml(parsed.name)}</span>
      </h3>
    `;
  }

  function shouldShowNodeTag(node) {
    if (!node.tag) return false;
    const normalizedTag = window.SotayAdapter.normalizeText(node.tag);
    return normalizedTag !== "quy dinh";
  }

  function renderStats() {
    dom.stats.total.textContent = formatCount(state.dataset.stats.totalNodes);
    dom.stats.categories.textContent = formatCount(state.dataset.stats.categoryCount);
    dom.stats.forms.textContent = formatCount(state.dataset.stats.formCount);
    dom.stats.faq.textContent = formatCount(state.dataset.stats.faqCount);
  }

  function renderCategories() {
    dom.categoryGrid.innerHTML = state.dataset.categories.map((item) => `
      <article class="card" aria-labelledby="${item.id}-title">
        ${renderCategoryTitle(item.title, `${item.id}-title`)}
        <p class="card-description">${escapeHtml(item.description)}</p>
        <div class="card-footer">
          <span class="chip">${formatCount(item.count)} mục</span>
          <button class="btn btn-muted" type="button" data-action="open-category" data-node-id="${item.id}">Xem nội dung</button>
        </div>
      </article>
    `).join("");
  }

  function renderRecentViews() {
    if (!state.recentViews.length) {
      dom.recentPanel.hidden = true;
      dom.recentViews.innerHTML = "";
      return;
    }

    dom.recentPanel.hidden = false;
    dom.recentViews.innerHTML = state.recentViews.map((item) => `
      <button class="chip" type="button" data-action="open-detail" data-node-id="${item.id}">
        ${escapeHtml(item.type)}: ${escapeHtml(item.title)}
      </button>
    `).join("");
  }

  function renderSearchHistory() {
    if (!state.searchHistory.length) {
      dom.searchHistory.innerHTML = "";
      return;
    }

    dom.searchHistory.innerHTML = state.searchHistory.map((item) => `
      <button class="chip" type="button" data-action="repeat-search" data-keyword="${escapeHtml(item)}">${escapeHtml(item)}</button>
    `).join("");
  }

  function renderFeaturedLists() {
    const featuredFaq = state.dataset.faq.slice(0, 3);
    const featuredForms = state.dataset.forms.slice(0, 3);

    dom.featuredFaq.innerHTML = featuredFaq.length ? featuredFaq.map((item) => `
      <article class="list-item">
        <div class="list-item__title">${escapeHtml(item.title)}</div>
        <div class="list-item__meta">${escapeHtml(item.meta)}</div>
        <p style="margin:0;">${escapeHtml(item.excerpt)}</p>
        <div class="meta-row">
          <button class="mini-btn" type="button" data-action="open-detail" data-node-id="${item.id}">Xem nhanh</button>
          <button class="mini-btn" type="button" data-action="switch-tab" data-tab="faq">Mở tab Hỏi đáp</button>
        </div>
      </article>
    `).join("") : '<div class="empty-state">Chưa có nội dung hỏi đáp nổi bật.</div>';

    dom.featuredForms.innerHTML = featuredForms.length ? featuredForms.map((item) => `
      <article class="list-item">
        <div class="list-item__title">${escapeHtml(item.title)}</div>
        <div class="list-item__meta">${escapeHtml(item.meta)}</div>
        <p style="margin:0;">${escapeHtml(item.excerpt)}</p>
        <div class="meta-row">
          <button class="mini-btn" type="button" data-action="open-detail" data-node-id="${item.id}">Xem nhanh</button>
          <button class="mini-btn" type="button" data-action="switch-tab" data-tab="forms">Mở tab Biểu mẫu</button>
        </div>
      </article>
    `).join("") : '<div class="empty-state">Chưa có biểu mẫu nổi bật.</div>';
  }

  function renderFaqList() {
    dom.faqList.innerHTML = state.dataset.faq.length ? state.dataset.faq.map((item) => `
      <article class="list-item">
        <div class="list-item__title">${escapeHtml(item.title)}</div>
        <div class="list-item__meta">${escapeHtml(item.meta)}</div>
        <p style="margin:0;">${escapeHtml(item.excerpt)}</p>
        <div class="meta-row">
          <button class="btn btn-muted" type="button" data-action="open-detail" data-node-id="${item.id}">Xem chi tiết</button>
          <button class="mini-btn" type="button" data-action="go-to-node" data-node-id="${item.id}">Đi tới vị trí</button>
        </div>
      </article>
    `).join("") : '<div class="empty-state">Chưa có dữ liệu hỏi đáp.</div>';
  }

  function renderFormsList() {
    dom.formsList.innerHTML = state.dataset.forms.length ? state.dataset.forms.map((item) => `
      <article class="list-item">
        <div class="list-item__title">${escapeHtml(item.title)}</div>
        <div class="list-item__meta">${escapeHtml(item.meta)}</div>
        <p style="margin:0;">${escapeHtml(item.excerpt)}</p>
        <div class="meta-row">
          <button class="btn btn-muted" type="button" data-action="open-detail" data-node-id="${item.id}">Xem chi tiết</button>
          ${sanitizeUrl(item.url) ? `<a class="btn btn-primary" href="${sanitizeUrl(item.url)}" download rel="noopener noreferrer">Tải biểu mẫu</a>` : ""}
        </div>
      </article>
    `).join("") : '<div class="empty-state">Chưa có biểu mẫu.</div>';
  }

  function renderRuleActions(node) {
    const buttons = [];
    buttons.push(`<button class="mini-btn" type="button" data-action="open-detail" data-node-id="${node.id}">Xem chi tiết</button>`);

    if (sanitizeUrl(node.fileUrl)) {
      buttons.push(`<a class="mini-btn mini-btn--download" href="${sanitizeUrl(node.fileUrl)}" download rel="noopener noreferrer">Tải biểu mẫu</a>`);
    }

    (node.pdfRefs || []).forEach((ref) => {
      const pdf = pdfCollection[ref.doc];
      if (!pdf) return;
      const href = buildPdfHref(ref);
      if (!href) return;
      buttons.push(`<a class="mini-btn mini-btn--pdf" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(pdf.shortName)} - Tr.${escapeHtml(ref.page)}</a>`);
    });

    return buttons.length ? `<div class="rule-actions">${buttons.join("")}</div>` : "";
  }

  function renderRuleLeaf(node, level) {
    const levelClass = Math.min(level, 4);
    const summaryHtml = node.summary
      ? `<div class="rule-entry__summary">${sanitizeRichHtml(node.summary)}</div>`
      : '<div class="rule-entry__summary rule-entry__summary--empty">Mở chi tiết để xem đầy đủ nội dung.</div>';

    return `
      <article class="rule-entry rule-entry--level-${levelClass}" data-node-id="${node.id}">
        ${shouldShowNodeTag(node) ? `<div class="rule-entry__meta"><span class="chip">${escapeHtml(node.tag)}</span></div>` : ""}
        <button class="rule-entry__title" type="button" data-action="open-detail" data-node-id="${node.id}">
          ${escapeHtml(node.title)}
        </button>
        ${summaryHtml}
        ${renderRuleActions(node)}
      </article>
    `;
  }

  function renderRuleGroupIntro(node, level) {
    const hasIntro = Boolean(node.summary || node.detail || sanitizeUrl(node.fileUrl) || (node.pdfRefs || []).length);
    if (!hasIntro) return "";

    return `
      <div class="rule-group__intro rule-entry rule-entry--level-${Math.min(level, 4)}" data-node-id="${node.id}">
        ${shouldShowNodeTag(node) ? `<div class="rule-entry__meta"><span class="chip">${escapeHtml(node.tag)}</span></div>` : ""}
        <button class="rule-entry__title" type="button" data-action="open-detail" data-node-id="${node.id}">
          ${escapeHtml(node.title)}
        </button>
        ${node.summary ? `<div class="rule-entry__summary">${sanitizeRichHtml(node.summary)}</div>` : ""}
        ${renderRuleActions(node)}
      </div>
    `;
  }

  function renderRuleNode(node, level = 1) {
    const panelId = `${node.id}-panel`;
    const triggerId = `${node.id}-trigger`;
    const childrenHtml = (node.children || []).map((child) => renderRuleNode(child, level + 1)).join("");
    if (!childrenHtml) {
      return renderRuleLeaf(node, level);
    }

    const useAccordion = level >= 3 || node.forceAccordion;
    if (!useAccordion) {
      return `
        <section class="rule-block" data-node-id="${node.id}">
          <div class="rule-block__header">
            <button class="rule-block__title" type="button" data-action="open-detail" data-node-id="${node.id}">
              ${escapeHtml(node.title)}
            </button>
          </div>
          ${renderRuleGroupIntro(node, level)}
          <div class="rule-children">
            ${childrenHtml}
          </div>
        </section>
      `;
    }

    const summary = node.summaryPlain || `${node.children.length} mục con`;
    return `
      <section class="accordion-item rule-subgroup" data-open="false" data-node-id="${node.id}">
        <h3 style="margin:0;">
          <button
            id="${triggerId}"
            class="accordion-trigger rule-subgroup__header"
            type="button"
            aria-expanded="false"
            aria-controls="${panelId}"
            data-action="toggle-accordion"
            data-node-id="${node.id}"
          >
            <span>
              <span class="accordion-title">${escapeHtml(node.title)}</span>
              <span class="rule-summary">${escapeHtml(summary)}</span>
            </span>
            <span class="accordion-icon" aria-hidden="true">⌄</span>
          </button>
        </h3>
        <div id="${panelId}" class="accordion-panel rule-subgroup__body" role="region" aria-labelledby="${triggerId}" hidden>
          ${renderRuleGroupIntro(node, level)}
          <div class="rule-children">
            ${childrenHtml}
          </div>
        </div>
      </section>
    `;
  }

  function renderRules() {
    dom.rulesRoot.innerHTML = state.dataset.tree.length ? state.dataset.tree.map((node) => `
      <section class="rule-section" id="section-${node.id}">
        <header class="rule-section__header">
          <div class="section-head" style="margin-bottom:0;">
            <div>
              <h2>${escapeHtml(node.title)}</h2>
              <p>${escapeHtml(node.summaryPlain || `Khám phá nội dung thuộc nhóm ${node.title.toLowerCase()}.`)}</p>
            </div>
            <button class="btn btn-muted" type="button" data-action="open-detail" data-node-id="${node.id}">Xem tổng quan phần này</button>
          </div>
        </header>
        <div class="rule-list">
          ${node.children && node.children.length ? node.children.map((child) => renderRuleNode(child, 1)).join("") : '<div class="empty-state">Chưa có nội dung con trong phần này.</div>'}
        </div>
      </section>
    `).join("") : '<div class="empty-state">Chưa có dữ liệu quy định.</div>';
  }

  function setActiveTab(tabName) {
    state.activeTab = tabName;
    dom.tabs.forEach((tab) => {
      const selected = tab.dataset.tab === tabName;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    dom.panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== tabName;
    });
  }

  function openCategory(nodeId) {
    setActiveTab("rules");
    const section = document.getElementById(`section-${nodeId}`);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateBreadcrumb(node) {
    if (!node || !node.pathTitles || !node.pathTitles.length) {
      state.currentBreadcrumbNodeId = null;
      dom.breadcrumb.hidden = true;
      dom.breadcrumb.innerHTML = "";
      return;
    }

    state.currentBreadcrumbNodeId = node.id;
    dom.breadcrumb.hidden = false;
    dom.breadcrumb.innerHTML = buildBreadcrumb(node);
  }

  function openAccordionPath(nodeId) {
    let currentId = nodeId;
    while (currentId) {
      const article = document.querySelector(`.accordion-item[data-node-id="${currentId}"]`);
      const trigger = article ? article.querySelector("[data-action='toggle-accordion']") : null;
      const panel = trigger ? document.getElementById(trigger.getAttribute("aria-controls")) : null;
      if (article && trigger && panel) {
        article.dataset.open = "true";
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
      currentId = state.dataset.parentById.get(currentId);
    }
  }

  function goToNode(nodeId) {
    const node = state.dataset.nodesById.get(nodeId);
    if (!node) return;
    setActiveTab("rules");
    updateBreadcrumb(node);
    openAccordionPath(nodeId);

    const target = document.querySelector(`.rule-entry[data-node-id="${nodeId}"]`)
      || document.querySelector(`.rule-block[data-node-id="${nodeId}"]`)
      || document.querySelector(`.accordion-item[data-node-id="${nodeId}"]`)
      || document.getElementById(`section-${nodeId}`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openDetail(nodeId) {
    const node = state.dataset.nodesById.get(nodeId);
    if (!node) return;
    state.currentDetailNodeId = node.id;

    const safeSummary = sanitizeRichHtml(node.summary);
    const safeDetail = sanitizeRichHtml(node.detail);
    const safeFileUrl = sanitizeUrl(node.fileUrl);
    const pdfButtons = (node.pdfRefs || []).map((ref) => {
      const pdf = pdfCollection[ref.doc];
      const href = buildPdfHref(ref);
      if (!pdf || !href) return "";
      return `<a class="mini-btn mini-btn--pdf" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(pdf.shortName)} - Tr.${escapeHtml(ref.page)}</a>`;
    }).join("");

    dom.detailTitle.innerHTML = escapeHtml(node.fileName || node.title);
    dom.detailMeta.innerHTML = `
      <div class="meta-row">
        <span class="accent-tag">${escapeHtml(getTypeLabel(node.type))}</span>
        ${node.tag ? `<span class="chip">${escapeHtml(node.tag)}</span>` : ""}
      </div>
      <div class="breadcrumb" style="margin-top: 12px;">${buildBreadcrumb(node)}</div>
    `;

    dom.detailContent.innerHTML = `
      <div class="detail__content">
        ${safeSummary ? `<div class="detail__summary">${safeSummary}</div>` : ""}
        <div class="detail__actions">
          ${safeFileUrl ? `<a class="mini-btn mini-btn--download" href="${safeFileUrl}" download rel="noopener noreferrer">Tải về</a>` : ""}
          ${pdfButtons}
          <button class="mini-btn" type="button" data-action="go-to-node" data-node-id="${node.id}">Đi tới vị trí</button>
        </div>
        <div class="detail__body">
          ${safeDetail || `<p class="feedback-note">Nội dung chi tiết chưa được cập nhật. Bạn vẫn có thể xem tóm tắt và tải biểu mẫu/căn cứ liên quan.</p>`}
        </div>
      </div>
    `;

    addRecentView(node);
    openModal(dom.detailModal, "[data-close-detail]");
  }

  function scoreSearchResult(item, normalizedQuery) {
    let score = 0;
    if (item.normalizedTitle.includes(normalizedQuery)) score += 6;
    if (item.normalizedTag.includes(normalizedQuery)) score += 4;
    if (item.normalizedSummary.includes(normalizedQuery)) score += 2;
    if (item.normalizedDetail.includes(normalizedQuery)) score += 1;
    return score;
  }

  function runSearch(query, type, options = {}) {
    const normalizedQuery = window.SotayAdapter.normalizeText(query);
    state.currentSearchQuery = query;
    state.currentSearchType = type;
    dom.searchType.value = type;
    dom.searchInput.value = query;

    if (!normalizedQuery) {
      dom.searchResults.innerHTML = '<div class="empty-state">Nhập từ khóa để bắt đầu tìm kiếm.</div>';
      return;
    }

    if (options.remember !== false) pushSearchHistory(query);

    const results = state.dataset.searchIndex
      .filter((item) => (type === "all" ? true : item.type === type))
      .map((item) => ({ ...item, score: scoreSearchResult(item, normalizedQuery) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "vi"));

    if (!results.length) {
      dom.searchResults.innerHTML = '<div class="empty-state">Không tìm thấy kết quả phù hợp.</div>';
      return;
    }

    dom.searchResults.innerHTML = results.map((item) => `
      <article class="result-card">
        <div class="result-card__type">${escapeHtml(getTypeLabel(item.type))}</div>
        <h3 style="margin:0;">${highlightText(item.title, query)}</h3>
        <p class="result-card__path">${escapeHtml(item.pathText || "Nội dung chính")}</p>
        <p>${highlightText(item.summaryPlain || item.detailPlain || "Mở để xem thêm nội dung.", query)}</p>
        <div class="meta-row">
          <button class="mini-btn" type="button" data-action="open-detail" data-node-id="${item.id}">Mở chi tiết</button>
          <button class="mini-btn" type="button" data-action="go-to-node" data-node-id="${item.id}">Đi tới vị trí</button>
        </div>
      </article>
    `).join("");
  }

  function submitFeedback(event) {
    event.preventDefault();
    const value = dom.feedbackText.value.trim();
    if (!value && !state.selectedRating) {
      dom.feedbackStatus.textContent = "Mời bạn chọn mức độ hài lòng hoặc nhập nội dung góp ý trước khi gửi.";
      dom.feedbackStatus.dataset.state = "error";
      return;
    }

    dom.feedbackStatus.textContent = "Đang gửi góp ý...";
    dom.feedbackStatus.dataset.state = "";

    const endpoint = sanitizeUrl(bootstrap.feedbackEndpoint);
    const transport = String(bootstrap.feedbackTransport || "").trim();
    if (!endpoint) {
      dom.feedbackStatus.textContent = "Đã ghi nhận đánh giá/góp ý. Hãy cấu hình endpoint để gửi lên hệ thống thật.";
      dom.feedbackStatus.dataset.state = "success";
      dom.feedbackText.value = "";
      setSelectedRating("");
      return;
    }

    const request = transport === "legacy-query"
      ? sendLegacyFeedback(endpoint, { content: value, rating: state.selectedRating })
      : fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value, rating: state.selectedRating, source: "sotay-v3" })
      });

    request
      .then((response) => {
        if (response && "ok" in response && !response.ok) throw new Error("feedback_failed");
        dom.feedbackStatus.textContent = "Đã gửi góp ý thành công.";
        dom.feedbackStatus.dataset.state = "success";
        dom.feedbackText.value = "";
        setSelectedRating("");
      })
      .catch(() => {
        dom.feedbackStatus.textContent = "Chưa thể gửi tới hệ thống. Dữ liệu đang được giữ lại ở trình duyệt.";
        dom.feedbackStatus.dataset.state = "error";
      });
  }

  function sendLegacyFeedback(endpoint, payload) {
    const requests = [];
    if (payload.rating) {
      requests.push(fetch(`${endpoint}?action=survey&content=${encodeURIComponent(payload.rating)}`, { method: "GET", mode: "no-cors" }));
    }
    if (payload.content) {
      requests.push(fetch(`${endpoint}?action=feedback&content=${encodeURIComponent(payload.content)}`, { method: "GET", mode: "no-cors" }));
    }
    return Promise.all(requests);
  }

  function setSelectedRating(value) {
    state.selectedRating = value;
    dom.ratingButtons.forEach((button) => {
      const active = button.dataset.rating === value;
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.classList.toggle("is-active", active);
    });

    if (value) {
      dom.feedbackStatus.textContent = `Đã chọn: ${value}. Bạn có thể gửi ngay hoặc nhập thêm góp ý chi tiết.`;
      dom.feedbackStatus.dataset.state = "success";
    }
  }

  function setTheme(theme) {
    dom.root.dataset.theme = theme;
    localStorage.setItem("sotay_v3_theme", theme);
    if (dom.themeToggle) {
      dom.themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      dom.themeToggle.setAttribute("aria-label", theme === "dark" ? "Chuyển giao diện sáng" : "Chuyển giao diện tối");
      dom.themeToggle.setAttribute("title", theme === "dark" ? "Giao diện sáng" : "Giao diện tối");
    }
    if (dom.themeToggleIcon) {
      dom.themeToggleIcon.innerHTML = getThemeIcon(theme);
    }
  }

  function toggleTheme() {
    setTheme(dom.root.dataset.theme === "dark" ? "light" : "dark");
  }

  function initTheme() {
    const savedTheme = localStorage.getItem("sotay_v3_theme");
    if (savedTheme) {
      setTheme(savedTheme);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }

  function handleAdminAction() {
    const adminUrl = sanitizeUrl(bootstrap.adminUrl);
    if (adminUrl) {
      window.location.href = adminUrl;
      return;
    }
    showToast("Hãy cấu hình `SOTAY_BOOTSTRAP.adminUrl` nếu bạn muốn đổi sang một trang quản trị khác.");
  }

  function handleDocumentClick(event) {
    const target = event.target;
    const actionButton = target.closest("[data-action]");
    const overlay = target.closest(".modal");

    if (overlay && target === overlay) {
      closeModal(overlay);
      return;
    }

    if (!actionButton) return;

    const action = actionButton.dataset.action;
    if (action === "switch-tab") setActiveTab(actionButton.dataset.tab);
    if (action === "open-category") openCategory(actionButton.dataset.nodeId);
    if (action === "open-search") openModal(dom.searchModal, "#modalSearchInput");
    if (action === "close-search") closeModal(dom.searchModal);
    if (action === "close-detail") {
      state.currentDetailNodeId = null;
      closeModal(dom.detailModal);
    }
    if (action === "repeat-search") {
      const keyword = actionButton.dataset.keyword || "";
      dom.heroSearchInput.value = keyword;
      openModal(dom.searchModal, "#modalSearchInput");
      runSearch(keyword, "all", { remember: true });
    }
    if (action === "keyword-search") {
      const keyword = actionButton.dataset.keyword || "";
      dom.heroSearchInput.value = keyword;
      openModal(dom.searchModal, "#modalSearchInput");
      runSearch(keyword, "all", { remember: true });
    }
    if (action === "toggle-accordion") {
      const article = actionButton.closest(".accordion-item");
      const panel = document.getElementById(actionButton.getAttribute("aria-controls"));
      const expanded = actionButton.getAttribute("aria-expanded") === "true";
      actionButton.setAttribute("aria-expanded", String(!expanded));
      article.dataset.open = String(!expanded);
      panel.hidden = expanded;
      if (!expanded) updateBreadcrumb(state.dataset.nodesById.get(actionButton.dataset.nodeId));
    }
    if (action === "open-detail") {
      if (state.openModalId === "searchDialog") closeModal(dom.searchModal);
      openDetail(actionButton.dataset.nodeId);
    }
    if (action === "go-to-node") {
      closeModal(dom.searchModal);
      closeModal(dom.detailModal);
      goToNode(actionButton.dataset.nodeId);
    }
    if (action === "set-rating") {
      setSelectedRating(actionButton.dataset.rating || "");
    }
    if (action === "toggle-theme") toggleTheme();
    if (action === "open-admin") handleAdminAction();
  }

  function handleTabKeydown(event) {
    const currentIndex = dom.tabs.findIndex((tab) => tab === document.activeElement);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % dom.tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + dom.tabs.length) % dom.tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = dom.tabs.length - 1;
    if (nextIndex !== currentIndex) {
      event.preventDefault();
      dom.tabs[nextIndex].focus();
      setActiveTab(dom.tabs[nextIndex].dataset.tab);
    }
  }

  function handleModalKeyboard(event) {
    if (event.key === "Escape" && state.openModalId) {
      const modal = document.getElementById(state.openModalId);
      if (modal) closeModal(modal);
      return;
    }

    if (event.key !== "Tab" || !state.openModalId) return;
    const modal = document.getElementById(state.openModalId);
    if (!modal) return;
    const focusables = collectFocusableElements(modal);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function bindEvents() {
    document.addEventListener("click", handleDocumentClick);

    dom.tabs.forEach((tab) => {
      tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
      tab.addEventListener("keydown", handleTabKeydown);
    });

    document.getElementById("heroSearchForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const query = String(formData.get("q") || "");
      openModal(dom.searchModal, "#modalSearchInput");
      runSearch(query, "all", { remember: true });
    });

    document.getElementById("modalSearchForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      runSearch(String(formData.get("q") || ""), String(formData.get("type") || "all"), { remember: true });
    });

    dom.searchType.addEventListener("change", () => {
      runSearch(dom.searchInput.value, dom.searchType.value, { remember: false });
    });

    dom.searchInput.addEventListener("input", () => {
      if (dom.searchInput.value.trim().length >= 2 || !dom.searchInput.value.trim()) {
        runSearch(dom.searchInput.value, dom.searchType.value, { remember: false });
      }
    });

    dom.feedbackForm.addEventListener("submit", submitFeedback);
    document.addEventListener("keydown", handleModalKeyboard);
  }

  function renderAll() {
    renderStats();
    renderRecentViews();
    renderSearchHistory();
    renderCategories();
    renderFeaturedLists();
    renderRules();
    renderFaqList();
    renderFormsList();
    updateBreadcrumb(null);
    dom.searchResults.innerHTML = '<div class="empty-state">Nhập từ khóa để bắt đầu tìm kiếm. Bạn cũng có thể bấm vào từ khóa gợi ý ở trang chủ.</div>';
  }

  function setTreeData(treeData, options = {}) {
    bootstrap.treeData = Array.isArray(treeData) ? treeData : [];
    state.dataset = buildDataset(bootstrap.treeData);
    state.hasLiveData = state.hasLiveData || options.source === "firestore";

    const activeTab = state.activeTab;
    const breadcrumbNodeId = state.currentBreadcrumbNodeId;
    const detailNodeId = state.currentDetailNodeId;
    const searchQuery = state.currentSearchQuery;
    const searchType = state.currentSearchType;

    renderAll();
    setActiveTab(activeTab);

    if (breadcrumbNodeId && state.dataset.nodesById.has(breadcrumbNodeId)) {
      updateBreadcrumb(state.dataset.nodesById.get(breadcrumbNodeId));
      openAccordionPath(breadcrumbNodeId);
    }

    if (detailNodeId && !state.dataset.nodesById.has(detailNodeId) && state.openModalId === "detailDialog") {
      state.currentDetailNodeId = null;
      closeModal(dom.detailModal);
    }

    if (searchQuery && (state.openModalId === "searchDialog" || options.replaySearch)) {
      runSearch(searchQuery, searchType, { remember: false });
    }

    if (options.announce) {
      showToast(options.message || "Dữ liệu live đã được đồng bộ từ hệ thống cũ.");
    }
  }

  function bindLiveDataEvents() {
    window.addEventListener("sotay-v3:data-updated", (event) => {
      const detail = event.detail || {};
      setTreeData(detail.treeData, {
        source: detail.source || "external",
        announce: Boolean(detail.announce),
        message: detail.message || ""
      });
    });

    window.addEventListener("sotay-v3:live-error", () => {
      showToast("Chưa thể đồng bộ dữ liệu live. Giao diện đang dùng dữ liệu dự phòng.");
    });
  }

  function init() {
    initTheme();
    renderAll();
    bindEvents();
    bindLiveDataEvents();
    setActiveTab("home");
    window.SotayV3App = {
      setTreeData,
      getState: () => ({
        activeTab: state.activeTab,
        hasLiveData: state.hasLiveData,
        totalNodes: state.dataset.stats.totalNodes
      })
    };
  }

  init();
})();
