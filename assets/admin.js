(function initSotayAdmin() {
  const bootstrap = window.SOTAY_BOOTSTRAP || {};
  const live = bootstrap.live || {};
  const pdfCollection = window.SOTAY_PDF_COLLECTION || {};

  const state = {
    treeData: [],
    currentNodeId: "",
    expandedNodes: new Set(),
    filterQuery: "",
    dirty: false,
    authUser: null,
    db: null,
    unsubscribeSnapshot: null
  };

  const dom = {
    loginView: document.getElementById("loginView"),
    adminView: document.getElementById("adminView"),
    loginForm: document.getElementById("loginForm"),
    loginButton: document.getElementById("loginButton"),
    username: document.getElementById("username"),
    password: document.getElementById("password"),
    loginStatus: document.getElementById("loginStatus"),
    adminWelcome: document.getElementById("adminWelcome"),
    logoutButton: document.getElementById("logoutButton"),
    treeSearch: document.getElementById("treeSearch"),
    treeRoot: document.getElementById("treeRoot"),
    treeStatus: document.getElementById("treeStatus"),
    editorPlaceholder: document.getElementById("editorPlaceholder"),
    editorForm: document.getElementById("editorForm"),
    editorStatus: document.getElementById("editorStatus"),
    addRootButton: document.getElementById("addRootButton"),
    addChildButton: document.getElementById("addChildButton"),
    deleteButton: document.getElementById("deleteButton"),
    moveUpButton: document.getElementById("moveUpButton"),
    moveDownButton: document.getElementById("moveDownButton"),
    saveButton: document.getElementById("saveButton"),
    inputs: {
      title: document.getElementById("inpTitle"),
      tag: document.getElementById("inpTag"),
      fileName: document.getElementById("inpFileName"),
      fileUrl: document.getElementById("inpFileUrl"),
      forceAccordion: document.getElementById("inpForceAccordion"),
      summary: document.getElementById("inpSummary"),
      detail: document.getElementById("inpDetail")
    }
  };

  function normalizeText(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  }

  function cloneTree(tree) {
    return JSON.parse(JSON.stringify(tree || []));
  }

  function setStatus(element, message, tone) {
    element.textContent = message || "";
    element.dataset.state = tone || "";
  }

  function setDirty(value) {
    state.dirty = value;
    if (value) {
      setStatus(dom.editorStatus, "Bạn đang có thay đổi chưa lưu.", "error");
    } else if (!dom.editorStatus.dataset.preserve) {
      setStatus(dom.editorStatus, "", "");
    }
  }

  function confirmDiscardChanges() {
    if (!state.dirty) return true;
    return window.confirm("Bạn đang có thay đổi chưa lưu. Bỏ qua và tiếp tục?");
  }

  function ensureFirebase() {
    if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
      throw new Error("firebase_unavailable");
    }

    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(live.firebaseConfig || {});
    }

    state.db = state.db || window.firebase.firestore();
  }

  function getDocRef() {
    ensureFirebase();
    return state.db.collection(live.collection || "sotay").doc(live.document || "dulieu");
  }

  function runTreeTransaction(mutator) {
    const docRef = getDocRef();
    return state.db.runTransaction((transaction) => transaction.get(docRef).then((doc) => {
      const serverTree = doc.exists && doc.data() ? cloneTree(doc.data().treeData || []) : [];
      const result = mutator(serverTree);
      transaction.set(docRef, { treeData: serverTree }, { merge: true });
      return result;
    }));
  }

  function findNodeMeta(nodes, targetId, parentArray = null, parentNode = null) {
    for (let index = 0; index < (nodes || []).length; index += 1) {
      const node = nodes[index];
      if (node.id === targetId) {
        return { node, index, parentArray: nodes, parentNode };
      }
      if (node.children && node.children.length) {
        const found = findNodeMeta(node.children, targetId, node.children, node);
        if (found) return found;
      }
    }
    return null;
  }

  function populatePdfOptions() {
    const options = ['<option value="">Chọn tài liệu</option>']
      .concat(Object.entries(pdfCollection).map(([key, value]) => `<option value="${key}">${value.shortName} - ${value.name}</option>`))
      .join("");

    for (let index = 1; index <= 5; index += 1) {
      const select = document.getElementById(`inpPdfDoc${index}`);
      if (select) select.innerHTML = options;
    }
  }

  function getCurrentNode() {
    if (!state.currentNodeId) return null;
    const meta = findNodeMeta(state.treeData, state.currentNodeId);
    return meta ? meta.node : null;
  }

  function updateEditorAvailability() {
    const hasSelection = Boolean(state.currentNodeId);
    dom.addChildButton.disabled = !hasSelection;
    dom.deleteButton.disabled = !hasSelection;
    dom.moveUpButton.disabled = !hasSelection;
    dom.moveDownButton.disabled = !hasSelection;
    dom.saveButton.disabled = !hasSelection;
  }

  function showEditor(node) {
    if (!node) {
      state.currentNodeId = "";
      dom.editorPlaceholder.hidden = false;
      dom.editorForm.hidden = true;
      updateEditorAvailability();
      return;
    }

    const refs = Array.isArray(node.pdfRefs) ? node.pdfRefs.slice(0, 5) : [];
    if (!refs.length && node.pdfPage) refs.push({ doc: "hd02", page: node.pdfPage });

    dom.editorPlaceholder.hidden = true;
    dom.editorForm.hidden = false;
    dom.inputs.title.value = node.title || "";
    dom.inputs.tag.value = node.tag || "";
    dom.inputs.fileName.value = node.fileName || "";
    dom.inputs.fileUrl.value = node.fileUrl || "";
    dom.inputs.forceAccordion.checked = Boolean(node.forceAccordion);
    dom.inputs.summary.value = node.summary || "";
    dom.inputs.detail.value = node.detail || "";

    for (let index = 1; index <= 5; index += 1) {
      const ref = refs[index - 1] || {};
      document.getElementById(`inpPdfDoc${index}`).value = ref.doc || "";
      document.getElementById(`inpPdfPage${index}`).value = ref.page || "";
    }

    updateEditorAvailability();
    setDirty(false);
  }

  function collectFormData() {
    const pdfRefs = [];
    for (let index = 1; index <= 5; index += 1) {
      const docValue = document.getElementById(`inpPdfDoc${index}`).value;
      const pageValue = document.getElementById(`inpPdfPage${index}`).value;
      if (docValue && pageValue) {
        pdfRefs.push({ doc: docValue, page: Number(pageValue) });
      }
    }

    return {
      title: dom.inputs.title.value.trim(),
      tag: dom.inputs.tag.value.trim(),
      fileName: dom.inputs.fileName.value.trim(),
      fileUrl: dom.inputs.fileUrl.value.trim(),
      forceAccordion: dom.inputs.forceAccordion.checked,
      summary: dom.inputs.summary.value.trim(),
      detail: dom.inputs.detail.value.trim(),
      pdfRefs
    };
  }

  function isNodeVisible(node) {
    if (!state.filterQuery) return true;
    const haystack = normalizeText([node.title, node.tag, node.fileName].filter(Boolean).join(" "));
    if (haystack.includes(state.filterQuery)) return true;
    return (node.children || []).some(isNodeVisible);
  }

  function renderTreeNodes(nodes, level) {
    return (nodes || [])
      .filter(isNodeVisible)
      .map((node, index) => {
        const hasChildren = Boolean(node.children && node.children.length);
        const isExpanded = state.expandedNodes.has(node.id) || level === 0 || Boolean(state.filterQuery);
        const isActive = state.currentNodeId === node.id;
        const meta = [node.tag, `${(node.children || []).length} mục con`].filter(Boolean).join(" • ");

        return `
          <div class="tree-group" data-node-id="${node.id}">
            <div class="tree-item${isActive ? " is-active" : ""}">
              <button
                class="tree-toggle${hasChildren ? "" : " tree-toggle--placeholder"}"
                type="button"
                data-action="toggle-node"
                data-node-id="${node.id}"
                ${hasChildren ? "" : "tabindex='-1' aria-hidden='true'"}
              >${isExpanded ? "−" : "+"}</button>
              <button class="tree-select" type="button" data-action="select-node" data-node-id="${node.id}">
                <span class="tree-item__title">${node.title || "Chưa đặt tên"}</span>
                <span class="tree-item__meta">${meta || `Cấp ${node.level || 0}`}</span>
              </button>
              <div class="tree-item__actions">
                <button class="tree-mini" type="button" data-action="move-up" data-node-id="${node.id}" title="Đẩy lên">▲</button>
                <button class="tree-mini" type="button" data-action="move-down" data-node-id="${node.id}" title="Đẩy xuống">▼</button>
              </div>
            </div>
            ${hasChildren && isExpanded ? `<div class="tree-children">${renderTreeNodes(node.children, level + 1)}</div>` : ""}
          </div>
        `;
      })
      .join("");
  }

  function renderTree() {
    if (!state.treeData.length) {
      dom.treeRoot.innerHTML = '<div class="empty-state">Chưa có dữ liệu nội dung.</div>';
      return;
    }
    dom.treeRoot.innerHTML = renderTreeNodes(state.treeData, 0);
  }

  function selectNode(nodeId, options = {}) {
    if (!options.force && !confirmDiscardChanges()) return;

    const meta = findNodeMeta(state.treeData, nodeId);
    if (!meta) return;

    state.currentNodeId = nodeId;
    if (meta.parentNode) state.expandedNodes.add(meta.parentNode.id);
    renderTree();
    showEditor(meta.node);
  }

  function syncSelectionAfterSnapshot() {
    if (!state.currentNodeId) {
      renderTree();
      return;
    }

    const meta = findNodeMeta(state.treeData, state.currentNodeId);
    renderTree();

    if (!meta) {
      showEditor(null);
      setStatus(dom.editorStatus, "Mục đang mở không còn tồn tại trên dữ liệu live.", "error");
      return;
    }

    if (!state.dirty) showEditor(meta.node);
    updateEditorAvailability();
  }

  function subscribeLiveTree() {
    if (state.unsubscribeSnapshot) state.unsubscribeSnapshot();
    state.unsubscribeSnapshot = getDocRef().onSnapshot((doc) => {
      state.treeData = doc.exists && doc.data() ? (doc.data().treeData || []) : [];
      syncSelectionAfterSnapshot();
      setStatus(dom.treeStatus, "Đã đồng bộ dữ liệu live từ Firestore.", "success");
    }, () => {
      setStatus(dom.treeStatus, "Không thể đồng bộ dữ liệu live. Vui lòng thử lại.", "error");
    });
  }

  function saveCurrentNode() {
    const currentNode = getCurrentNode();
    if (!currentNode) return;

    const formData = collectFormData();
    if (!formData.title) {
      setStatus(dom.editorStatus, "Tiêu đề không được để trống.", "error");
      return;
    }

    dom.saveButton.disabled = true;
    setStatus(dom.editorStatus, "Đang lưu thay đổi...", "");

    runTreeTransaction((tree) => {
      const meta = findNodeMeta(tree, state.currentNodeId);
      if (!meta) throw new Error("node_not_found");
      meta.parentArray[meta.index] = { ...meta.node, ...formData };
    }).then(() => {
      setDirty(false);
      setStatus(dom.editorStatus, "Đã lưu thay đổi thành công.", "success");
    }).catch(() => {
      setStatus(dom.editorStatus, "Không thể lưu thay đổi. Vui lòng thử lại.", "error");
    }).finally(() => {
      dom.saveButton.disabled = false;
      updateEditorAvailability();
    });
  }

  function runTreeMutation(mutator, successMessage) {
    setStatus(dom.treeStatus, "Đang cập nhật dữ liệu...", "");
    runTreeTransaction(mutator).then(() => {
      setStatus(dom.treeStatus, successMessage, "success");
      setDirty(false);
    }).catch(() => {
      setStatus(dom.treeStatus, "Không thể cập nhật dữ liệu. Vui lòng thử lại.", "error");
    });
  }

  function addRootNode() {
    if (!confirmDiscardChanges()) return;
    const newNode = {
      id: `r${Date.now()}`,
      title: "PHẦN MỚI TẠO",
      tag: "",
      summary: "",
      detail: "",
      level: 0,
      children: []
    };

    runTreeMutation((tree) => {
      tree.push(newNode);
    }, "Đã thêm phần gốc mới.");

    state.currentNodeId = newNode.id;
  }

  function addChildNode() {
    if (!state.currentNodeId) {
      setStatus(dom.treeStatus, "Hãy chọn mục cha trước khi thêm mục con.", "error");
      return;
    }
    if (!confirmDiscardChanges()) return;

    const parentNode = getCurrentNode();
    if (!parentNode) return;

    const newNode = {
      id: `n${Date.now()}`,
      title: "Mục con mới",
      tag: "",
      summary: "",
      detail: "",
      level: Number(parentNode.level || 0) + 1,
      children: []
    };

    runTreeMutation((tree) => {
      const meta = findNodeMeta(tree, state.currentNodeId);
      if (!meta) throw new Error("parent_not_found");
      meta.node.children = Array.isArray(meta.node.children) ? meta.node.children : [];
      meta.node.children.push(newNode);
    }, "Đã thêm mục con mới.");

    state.expandedNodes.add(state.currentNodeId);
    state.currentNodeId = newNode.id;
  }

  function deleteCurrentNode() {
    if (!state.currentNodeId) return;
    if (!window.confirm("Bạn có chắc muốn xóa mục này? Toàn bộ mục con bên trong cũng sẽ bị xóa.")) return;

    const deletingId = state.currentNodeId;
    runTreeMutation((tree) => {
      const meta = findNodeMeta(tree, deletingId);
      if (!meta) throw new Error("node_not_found");
      meta.parentArray.splice(meta.index, 1);
    }, "Đã xóa mục được chọn.");

    state.currentNodeId = "";
    showEditor(null);
  }

  function moveNode(nodeId, direction) {
    const targetId = nodeId || state.currentNodeId;
    if (!targetId) return;

    runTreeMutation((tree) => {
      const meta = findNodeMeta(tree, targetId);
      if (!meta) throw new Error("node_not_found");
      const siblingIndex = meta.index + direction;
      if (siblingIndex < 0 || siblingIndex >= meta.parentArray.length) return;
      const next = meta.parentArray[siblingIndex];
      meta.parentArray[siblingIndex] = meta.parentArray[meta.index];
      meta.parentArray[meta.index] = next;
    }, direction < 0 ? "Đã đẩy mục lên." : "Đã đẩy mục xuống.");
  }

  function handleTreeClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const nodeId = button.dataset.nodeId;

    if (action === "toggle-node") {
      if (state.expandedNodes.has(nodeId)) state.expandedNodes.delete(nodeId);
      else state.expandedNodes.add(nodeId);
      renderTree();
      return;
    }

    if (action === "select-node") {
      selectNode(nodeId);
      return;
    }

    if (action === "move-up") {
      event.stopPropagation();
      moveNode(nodeId, -1);
      return;
    }

    if (action === "move-down") {
      event.stopPropagation();
      moveNode(nodeId, 1);
    }
  }

  function handleEditorInput() {
    if (state.currentNodeId) setDirty(true);
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    let username = dom.username.value.trim().toLowerCase();
    const password = dom.password.value;
    if (!username || !password) {
      setStatus(dom.loginStatus, "Vui lòng nhập đầy đủ tài khoản và mật khẩu.", "error");
      return;
    }

    if (!username.includes("@")) {
      username = `${username}@${bootstrap.adminUsernameDomain || "sotay.com"}`;
    }

    ensureFirebase();
    dom.loginButton.disabled = true;
    setStatus(dom.loginStatus, "Đang xác thực tài khoản quản trị...", "");

    window.firebase.auth().signInWithEmailAndPassword(username, password)
      .then((userCredential) => {
        setStatus(dom.loginStatus, "Đăng nhập thành công.", "success");
        if (userCredential && userCredential.user) {
          showAdminView(userCredential.user);
        }
      })
      .catch(() => {
        dom.password.value = "";
        setStatus(dom.loginStatus, "Tài khoản hoặc mật khẩu không đúng.", "error");
      })
      .finally(() => {
        dom.loginButton.disabled = false;
      });
  }

  function showAdminView(user) {
    dom.loginView.hidden = true;
    dom.adminView.hidden = false;
    dom.adminWelcome.textContent = `Đăng nhập bởi: ${user.email || "quản trị viên"}. Dữ liệu đang đồng bộ trực tiếp từ Firestore.`;
    updateEditorAvailability();
    subscribeLiveTree();
  }

  function showLoginView() {
    dom.loginView.hidden = false;
    dom.adminView.hidden = true;
    state.currentNodeId = "";
    state.treeData = [];
    if (state.unsubscribeSnapshot) {
      state.unsubscribeSnapshot();
      state.unsubscribeSnapshot = null;
    }
    showEditor(null);
    renderTree();
  }

  function bindEvents() {
    dom.loginForm.addEventListener("submit", handleLoginSubmit);
    dom.logoutButton.addEventListener("click", () => {
      if (!confirmDiscardChanges()) return;
      window.firebase.auth().signOut();
    });
    dom.treeSearch.addEventListener("input", (event) => {
      state.filterQuery = normalizeText(event.target.value);
      renderTree();
    });
    dom.treeRoot.addEventListener("click", handleTreeClick);
    dom.addRootButton.addEventListener("click", addRootNode);
    dom.addChildButton.addEventListener("click", addChildNode);
    dom.deleteButton.addEventListener("click", deleteCurrentNode);
    dom.moveUpButton.addEventListener("click", () => moveNode("", -1));
    dom.moveDownButton.addEventListener("click", () => moveNode("", 1));
    dom.saveButton.addEventListener("click", saveCurrentNode);

    Object.values(dom.inputs).forEach((input) => {
      input.addEventListener("input", handleEditorInput);
      input.addEventListener("change", handleEditorInput);
    });

    for (let index = 1; index <= 5; index += 1) {
      document.getElementById(`inpPdfDoc${index}`).addEventListener("change", handleEditorInput);
      document.getElementById(`inpPdfPage${index}`).addEventListener("input", handleEditorInput);
    }

    window.addEventListener("beforeunload", (event) => {
      if (!state.dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  function initAuth() {
    ensureFirebase();
    window.firebase.auth().onAuthStateChanged((user) => {
      state.authUser = user;
      if (user) {
        showAdminView(user);
      } else {
        showLoginView();
      }
    });
  }

  function init() {
    populatePdfOptions();
    bindEvents();
    initAuth();
  }

  init();
})();
