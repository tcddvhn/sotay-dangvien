(function initSotayAdapter() {
  function stripHtml(html) {
    return String(html || "")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeText(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  }

  function getNodeType(node) {
    const rawTag = normalizeText(node.tag);
    if (rawTag.includes("hoi dap")) return "faq";
    if (rawTag.includes("bieu mau") || node.fileUrl) return "form";
    return "rule";
  }

  function countDescendants(node) {
    if (!node.children || !node.children.length) return 1;
    return node.children.reduce((total, child) => total + countDescendants(child), 1);
  }

  function buildPdfRefs(node) {
    const refs = Array.isArray(node.pdfRefs)
      ? node.pdfRefs
        .filter((ref) => ref && ref.doc && ref.page)
        .map((ref) => ({ doc: ref.doc, page: ref.page }))
      : [];

    if (!refs.length && node.pdfPage) {
      refs.push({ doc: "hd02", page: node.pdfPage });
    }

    return refs;
  }

  function mapTree(nodes, options, ancestors, flat, nodesById, parentById) {
    return (nodes || []).map((node, index) => {
      const currentAncestors = [...ancestors, node];
      const pathTitles = currentAncestors.map((item) => item.title).filter(Boolean);
      const summaryPlain = stripHtml(node.summary);
      const detailPlain = stripHtml(node.detail);
      const type = getNodeType(node);
      const mapped = {
        ...node,
        id: node.id || `node-${Date.now()}-${index}`,
        pathTitles,
        pathText: pathTitles.join(" > "),
        summaryPlain,
        detailPlain,
        type,
        pdfRefs: buildPdfRefs(node),
        pdfPage: node.pdfPage || "",
        forceAccordion: Boolean(node.forceAccordion),
        children: []
      };

      nodesById.set(mapped.id, mapped);
      if (ancestors.length) parentById.set(mapped.id, ancestors[ancestors.length - 1].id);
      flat.push(mapped);
      mapped.children = mapTree(node.children || [], options, currentAncestors, flat, nodesById, parentById);
      return mapped;
    });
  }

  function buildCategories(tree) {
    return tree.map((node) => ({
      id: node.id,
      title: node.title,
      description: node.summaryPlain || `Khám phá nội dung thuộc nhóm ${node.title.toLowerCase()}.`,
      count: countDescendants(node)
    }));
  }

  function buildFaqList(flat) {
    return flat
      .filter((node) => node.type === "faq")
      .map((node) => ({
        id: node.id,
        title: node.title,
        meta: node.pathText || "Hỏi đáp nghiệp vụ",
        excerpt: node.summaryPlain || node.detailPlain || "Mở chi tiết để xem nội dung đầy đủ.",
        breadcrumb: node.pathTitles
      }));
  }

  function buildFormList(flat) {
    return flat
      .filter((node) => node.type === "form")
      .map((node) => ({
        id: node.id,
        title: node.fileName || node.title,
        meta: node.pathText || "Biểu mẫu",
        excerpt: node.summaryPlain || node.detailPlain || "Biểu mẫu tải về.",
        url: node.fileUrl || "",
        breadcrumb: node.pathTitles
      }));
  }

  function buildSearchIndex(flat) {
    return flat.map((node) => ({
      id: node.id,
      title: node.title,
      type: node.type,
      tag: node.tag || "",
      pathText: node.pathText,
      summaryPlain: node.summaryPlain,
      detailPlain: node.detailPlain,
      normalizedTitle: normalizeText(node.title),
      normalizedTag: normalizeText(node.tag),
      normalizedSummary: normalizeText(node.summaryPlain),
      normalizedDetail: normalizeText(node.detailPlain)
    }));
  }

  function buildStats(flat, categories, faq, forms) {
    return {
      totalNodes: flat.length,
      categoryCount: categories.length,
      faqCount: faq.length,
      formCount: forms.length
    };
  }

  function buildDataset(treeInput) {
    const nodesById = new Map();
    const parentById = new Map();
    const flat = [];
    const tree = mapTree(treeInput || [], {}, [], flat, nodesById, parentById);
    const categories = buildCategories(tree);
    const faq = buildFaqList(flat);
    const forms = buildFormList(flat);
    const searchIndex = buildSearchIndex(flat);
    const stats = buildStats(flat, categories, faq, forms);

    return {
      tree,
      flat,
      faq,
      forms,
      categories,
      searchIndex,
      nodesById,
      parentById,
      stats
    };
  }

  window.SotayAdapter = {
    buildDataset,
    normalizeText,
    stripHtml,
    getNodeType
  };
})();
