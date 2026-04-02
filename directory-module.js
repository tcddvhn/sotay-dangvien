(function () {
    const DIRECTORY_STORAGE_KEY = 'sotay_cached_directory';
    const DIRECTORY_DOC_ID = 'danhba';

    let DIRECTORY_DATA = [];
    let directoryCurrentEditId = null;
    let currentAdminMode = 'content';
    let hasUnsavedDirectoryChanges = false;
    let isSystemChangingDirectory = false;
    let expandedDirectoryNodes = new Set();
    let isFirstDirectoryLoad = true;

    function safeClone(value) {
        return JSON.parse(JSON.stringify(value || []));
    }

    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function normalizeText(text) {
        const base = String(text || '').toLowerCase();
        if (typeof removeAccents === 'function') {
            return removeAccents(base);
        }
        return base.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    }

    function sortNodes(nodes) {
        return [...(nodes || [])].sort((a, b) => {
            const orderA = Number(a.order) || 0;
            const orderB = Number(b.order) || 0;
            if (orderA !== orderB) return orderA - orderB;
            return String(a.name || '').localeCompare(String(b.name || ''), 'vi');
        });
    }

    function normalizeDirectoryTree(nodes, parentId = null, level = 1) {
        return sortNodes(nodes).map((node, index) => {
            const id = node.id || `dir_${Date.now()}_${index}`;
            const safeLevel = Math.max(1, Math.min(3, level));
            const normalized = {
                id,
                name: String(node.name || 'Đơn vị mới').trim(),
                unitCode: String(node.unitCode || '').trim(),
                level: safeLevel,
                parentId,
                phone: String(node.phone || '').trim(),
                address: String(node.address || '').trim(),
                location: String(node.location || '').trim(),
                isActive: node.isActive !== false,
                order: index + 1,
                updatedAt: String(node.updatedAt || ''),
                updatedBy: String(node.updatedBy || ''),
                children: []
            };

            if (safeLevel < 3) {
                normalized.children = normalizeDirectoryTree(node.children || [], id, safeLevel + 1);
            }

            return normalized;
        });
    }

    function getSeedDirectoryData() {
        return normalizeDirectoryTree(safeClone(window.DIRECTORY_SEED || []));
    }

    function readCachedDirectory() {
        try {
            const cached = JSON.parse(localStorage.getItem(DIRECTORY_STORAGE_KEY) || '[]');
            return Array.isArray(cached) && cached.length ? normalizeDirectoryTree(cached) : [];
        } catch {
            return [];
        }
    }

    function cacheDirectory(tree) {
        try {
            localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(tree));
        } catch {}
    }

    function getDirectoryDb() {
        try {
            if (window.firebase && firebase.apps && firebase.apps.length) {
                return firebase.firestore();
            }
        } catch {}
        return null;
    }

    function bootstrapExpandedNodes(nodes) {
        if (!isFirstDirectoryLoad) return;
        expandedDirectoryNodes = new Set();
        (function walk(items) {
            (items || []).forEach((item) => {
                expandedDirectoryNodes.add(item.id);
                walk(item.children || []);
            });
        })(nodes);
        isFirstDirectoryLoad = false;
    }

    function getCurrentAdminUser() {
        try {
            if (typeof loggedInUser === 'string' && loggedInUser.trim()) {
                return loggedInUser.trim();
            }
        } catch {}
        return 'admin';
    }

    function setDirectoryData(tree, options = {}) {
        DIRECTORY_DATA = normalizeDirectoryTree(tree || []);
        cacheDirectory(DIRECTORY_DATA);
        bootstrapExpandedNodes(DIRECTORY_DATA);

        if (options.selectId) {
            directoryCurrentEditId = options.selectId;
        } else if (directoryCurrentEditId && !findDirectoryNode(directoryCurrentEditId, DIRECTORY_DATA)) {
            directoryCurrentEditId = null;
        }

        renderDirectoryTab();
        renderDirectoryAdminTree();
        if (currentAdminMode === 'directory') {
            renderDirectoryAdminMode();
        }
    }

    function subscribeDirectoryData() {
        const dbRef = getDirectoryDb();
        if (!dbRef) {
            const fallback = readCachedDirectory();
            setDirectoryData(fallback.length ? fallback : getSeedDirectoryData());
            return;
        }

        dbRef.collection('sotay').doc(DIRECTORY_DOC_ID).onSnapshot((doc) => {
            if (doc.exists && Array.isArray(doc.data().treeData) && doc.data().treeData.length) {
                setDirectoryData(doc.data().treeData);
                return;
            }

            const fallback = readCachedDirectory();
            setDirectoryData(fallback.length ? fallback : getSeedDirectoryData());
        }, () => {
            const fallback = readCachedDirectory();
            setDirectoryData(fallback.length ? fallback : getSeedDirectoryData());
        });
    }

    function flattenDirectory(nodes, parentTitles = [], out = []) {
        (nodes || []).forEach((node) => {
            const path = [...parentTitles, node.name].filter(Boolean);
            out.push({ node, path });
            flattenDirectory(node.children || [], path, out);
        });
        return out;
    }

    function findDirectoryNode(id, nodes) {
        for (const node of nodes || []) {
            if (node.id === id) return node;
            const found = findDirectoryNode(id, node.children || []);
            if (found) return found;
        }
        return null;
    }

    function findDirectoryParent(id, nodes, parent = null) {
        for (const node of nodes || []) {
            if (node.id === id) return parent;
            const found = findDirectoryParent(id, node.children || [], node);
            if (found) return found;
        }
        return null;
    }

    function findDirectoryPathTitles(id, nodes, path = []) {
        for (const node of nodes || []) {
            const nextPath = [...path, node.name];
            if (node.id === id) return nextPath;
            const found = findDirectoryPathTitles(id, node.children || [], nextPath);
            if (found) return found;
        }
        return null;
    }

    function highlightTextSafe(text, keyword) {
        const safe = escapeHtml(text);
        if (!keyword) return safe;
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return safe.replace(new RegExp(`(${escapedKeyword})`, 'gi'), '<mark class="search-highlight">$1</mark>');
    }

    function getVisibleDirectoryNodes(nodes) {
        return (nodes || [])
            .filter((node) => node.isActive !== false)
            .map((node) => ({ ...node, children: getVisibleDirectoryNodes(node.children || []) }));
    }

    function countByLevel(nodes, targetLevel) {
        let total = 0;
        (function walk(items) {
            (items || []).forEach((item) => {
                if (item.level === targetLevel) total += 1;
                walk(item.children || []);
            });
        })(nodes);
        return total;
    }

    function renderDirectorySummary() {
        const box = document.getElementById('directorySummary');
        if (!box) return;
        const level1Count = countByLevel(DIRECTORY_DATA, 1);
        box.innerHTML = `<div class="directory-summary-value">${level1Count}</div><div class="directory-summary-label">Đơn vị cấp 1</div>`;
    }

    function buildMapHref(node) {
        const query = [node.address, node.location].filter(Boolean).join(', ');
        if (!query) return '';
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }

    function renderInfoRow(iconClass, label, value, href = '') {
        const isEmpty = !value;
        const content = isEmpty
            ? `<span class="directory-info-value is-empty">Chưa cập nhật</span>`
            : href
                ? `<a class="directory-info-value" href="${href}" target="${href.startsWith('http') ? '_blank' : '_self'}">${escapeHtml(value)}</a>`
                : `<span class="directory-info-value">${escapeHtml(value)}</span>`;
        return `<div class="directory-info-row"><i class="${iconClass}"></i><div><span class="directory-info-label">${label}</span>${content}</div></div>`;
    }

    function renderDirectoryCard(node, options = {}) {
        const keyword = options.keyword || '';
        const pathText = options.pathText || '';
        const levelBadge = `Cấp ${node.level}`;
        const phoneHref = node.phone ? `tel:${node.phone.replace(/\s+/g, '')}` : '';
        const mapHref = buildMapHref(node);
        const actions = [];

        if (node.phone) {
            actions.push(`<a class="directory-action-btn primary" href="${phoneHref}"><i class="fas fa-phone"></i>Gọi nhanh</a>`);
        }
        if (mapHref) {
            actions.push(`<a class="directory-action-btn" href="${mapHref}" target="_blank" rel="noopener"><i class="fas fa-location-arrow"></i>Xem vị trí</a>`);
        }

        return `
            <article class="directory-card level-${node.level}">
                <div class="directory-card-head">
                    <div>
                        <div class="directory-card-title">${highlightTextSafe(node.name, keyword)}</div>
                        <div class="directory-card-submeta">
                            <span class="directory-level-badge">${levelBadge}</span>
                            ${node.unitCode ? `<span class="directory-code-badge">${escapeHtml(node.unitCode)}</span>` : ''}
                        </div>
                        ${pathText ? `<div class="directory-card-path">${escapeHtml(pathText)}</div>` : ''}
                    </div>
                </div>
                <div class="directory-card-body">
                    ${renderInfoRow('fas fa-phone', 'Số điện thoại', node.phone, phoneHref)}
                    ${renderInfoRow('fas fa-map-marker-alt', 'Địa chỉ liên hệ', node.address)}
                    ${renderInfoRow('fas fa-compass', 'Vị trí', node.location, mapHref)}
                </div>
                ${actions.length ? `<div class="directory-card-actions">${actions.join('')}</div>` : ''}
            </article>
        `;
    }

    function renderDirectoryTreeNode(node) {
        const children = getVisibleDirectoryNodes(node.children || []);
        if (!children.length) {
            return renderDirectoryCard(node);
        }

        const isOpen = expandedDirectoryNodes.has(node.id);
        return `
            <section class="directory-level-section ${isOpen ? 'open' : ''}" id="directory-section-${node.id}">
                <div class="directory-level-header" onclick="toggleDirectorySection('${node.id}')">
                    <div class="directory-level-title">
                        <svg width="18" height="18"><use href="#icon-directory"></use></svg>
                        <span>${escapeHtml(node.name)}</span>
                    </div>
                    <div class="directory-level-meta">${children.length} đơn vị cấp dưới <i class="fas fa-chevron-${isOpen ? 'down' : 'right'}"></i></div>
                </div>
                <div class="directory-level-body">
                    <div class="directory-children level-${Math.min(node.level + 1, 3)}">
                        ${renderDirectoryCard(node)}
                        ${children.map((child) => renderDirectoryTreeNode(child)).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    function renderDirectoryTab() {
        const container = document.getElementById('directoryListContainer');
        const note = document.getElementById('directoryStatusNote');
        const searchInput = document.getElementById('directorySearchInput');
        const levelFilter = document.getElementById('directoryLevelFilter');
        if (!container || !searchInput || !levelFilter) return;

        const visibleTree = getVisibleDirectoryNodes(DIRECTORY_DATA);
        const flat = flattenDirectory(visibleTree);
        const keyword = searchInput.value.trim();
        const normalizedKeyword = normalizeText(keyword);
        const levelValue = levelFilter.value.trim();

        renderDirectorySummary();

        const filtered = flat.filter(({ node }) => {
            if (levelValue && String(node.level) !== levelValue) return false;
            if (!normalizedKeyword) return true;
            const haystack = normalizeText([node.name, node.unitCode, node.phone, node.address, node.location].join(' '));
            return haystack.includes(normalizedKeyword);
        });

        if (note) {
            if (keyword || levelValue) {
                note.style.display = 'block';
                note.textContent = `Tìm thấy ${filtered.length} đơn vị phù hợp.`;
            } else {
                note.style.display = 'none';
                note.textContent = '';
            }
        }

        if (!filtered.length) {
            container.innerHTML = '<div class="directory-empty">Không có đơn vị phù hợp với điều kiện tìm kiếm.</div>';
            return;
        }

        if (keyword || levelValue) {
            container.innerHTML = `<div class="directory-card-grid">${filtered.map(({ node, path }) => renderDirectoryCard(node, { keyword, pathText: path.slice(0, -1).join(' > ') })).join('')}</div>`;
            return;
        }

        container.innerHTML = `<div class="directory-tree">${visibleTree.map((node) => renderDirectoryTreeNode(node)).join('')}</div>`;
    }

    function toggleDirectorySection(id) {
        if (expandedDirectoryNodes.has(id)) expandedDirectoryNodes.delete(id);
        else expandedDirectoryNodes.add(id);
        renderDirectoryTab();
    }

    function syncDirectoryBannerHeight() {
        const hero = document.querySelector('.hero-search');
        const banner = document.getElementById('homeDirectoryBanner');
        if (!hero || !banner) return;
        const heroHeight = hero.offsetHeight || 0;
        const desiredHeight = Math.max(48, Math.round(heroHeight / 6));
        banner.style.height = `${desiredHeight}px`;
    }

    function renderDirectoryAdminTree() {
        const tree = document.getElementById('directoryAdminTree');
        if (!tree) return;

        function buildHtml(nodes) {
            return (nodes || []).map((node) => {
                const hasChildren = node.children && node.children.length > 0;
                const isExpanded = expandedDirectoryNodes.has(node.id);
                const active = directoryCurrentEditId === node.id ? 'active' : '';
                const icon = node.level === 1 ? '📇' : node.level === 2 ? '📁' : '📌';
                return `
                    <div class="tree-node" id="directory-node-${node.id}">
                        <div class="tree-item ${active}" onclick="selectDirectoryItem('${node.id}')">
                            <span class="tree-toggle" onclick="${hasChildren ? `toggleDirectoryAdminNode(event, '${node.id}')` : 'event.stopPropagation()'}">${hasChildren ? (isExpanded ? '▼' : '▶') : '•'}</span>
                            <span style="margin-right: 5px;">${icon}</span>
                            <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(node.name)}</span>
                            <div style="margin-left:auto;">
                                <button class="btn-order" onclick="moveDirectoryNodeUp(event, '${node.id}')" title="Đẩy lên">▲</button>
                                <button class="btn-order" onclick="moveDirectoryNodeDown(event, '${node.id}')" title="Đẩy xuống">▼</button>
                            </div>
                        </div>
                        ${hasChildren ? `<div class="tree-children ${isExpanded ? '' : 'collapsed'}">${buildHtml(node.children)}</div>` : ''}
                    </div>
                `;
            }).join('');
        }

        tree.innerHTML = buildHtml(DIRECTORY_DATA);
        filterDirectoryAdminTree();
    }

    function markDirectoryUnsaved() {
        if (isSystemChangingDirectory || !directoryCurrentEditId || hasUnsavedDirectoryChanges) return;
        hasUnsavedDirectoryChanges = true;
        const btn = document.getElementById('btnSaveDirectory');
        if (btn) {
            btn.style.background = '#f39c12';
            btn.textContent = '⚠️ ĐANG CHỈNH SỬA (Bấm để lưu)';
        }
    }

    function resetDirectorySaveButton() {
        hasUnsavedDirectoryChanges = false;
        const btn = document.getElementById('btnSaveDirectory');
        if (btn) {
            btn.style.background = '#b30f14';
            btn.textContent = 'LƯU DANH BẠ';
        }
    }

    function confirmDirectoryUnsaved() {
        if (!hasUnsavedDirectoryChanges) return true;
        return confirm('⚠️ Bạn có thay đổi danh bạ chưa lưu. Xác nhận rời đi và hủy các thay đổi vừa nhập?');
    }

    function renderDirectoryAdminMode() {
        const contentSidebar = document.getElementById('adminContentSidebarPane');
        const directorySidebar = document.getElementById('adminDirectorySidebarPane');
        const contentPane = document.getElementById('adminContentPane');
        const directoryPane = document.getElementById('adminDirectoryPane');
        const contentBtn = document.getElementById('btnAdminModeContent');
        const directoryBtn = document.getElementById('btnAdminModeDirectory');
        const title = document.getElementById('adminSectionTitle');
        if (!contentSidebar || !directorySidebar || !contentPane || !directoryPane || !contentBtn || !directoryBtn || !title) return;

        const isDirectory = currentAdminMode === 'directory';
        contentSidebar.style.display = isDirectory ? 'none' : 'block';
        directorySidebar.style.display = isDirectory ? 'block' : 'none';
        contentPane.style.display = isDirectory ? 'none' : 'block';
        directoryPane.style.display = isDirectory ? 'block' : 'none';
        contentBtn.classList.toggle('active', !isDirectory);
        directoryBtn.classList.toggle('active', isDirectory);
        title.textContent = isDirectory ? 'Quản trị Danh bạ' : 'Biên tập Nội dung';

        if (isDirectory) {
            renderDirectoryAdminTree();
            if (directoryCurrentEditId) {
                fillDirectoryEditor(directoryCurrentEditId);
            }
        }
    }

    function switchAdminMode(mode) {
        if (mode === currentAdminMode) return;
        if (currentAdminMode === 'content' && typeof confirmUnsaved === 'function' && !confirmUnsaved()) return;
        if (currentAdminMode === 'directory' && !confirmDirectoryUnsaved()) return;
        currentAdminMode = mode === 'directory' ? 'directory' : 'content';
        renderDirectoryAdminMode();
    }

    function fillDirectoryEditor(id) {
        const node = findDirectoryNode(id, DIRECTORY_DATA);
        if (!node) return;
        directoryCurrentEditId = id;
        renderDirectoryAdminTree();
        resetDirectorySaveButton();
        isSystemChangingDirectory = true;

        document.getElementById('directoryEditorArea').style.display = 'block';
        document.getElementById('directoryEditorPlaceholder').style.display = 'none';
        document.getElementById('directoryEditorHeading').textContent = `Đang chỉnh sửa: ${node.name}`;
        document.getElementById('dirInpName').value = node.name || '';
        document.getElementById('dirInpCode').value = node.unitCode || '';
        document.getElementById('dirInpPhone').value = node.phone || '';
        document.getElementById('dirInpAddress').value = node.address || '';
        document.getElementById('dirInpLocation').value = node.location || '';
        document.getElementById('dirInpActive').checked = node.isActive !== false;
        document.getElementById('dirInpLevel').value = `Cấp ${node.level}`;
        const parent = findDirectoryParent(id, DIRECTORY_DATA);
        document.getElementById('dirInpParent').value = parent ? parent.name : 'Không có';

        window.setTimeout(() => {
            isSystemChangingDirectory = false;
        }, 50);
    }

    function selectDirectoryItem(id) {
        if (directoryCurrentEditId !== id && !confirmDirectoryUnsaved()) return;
        fillDirectoryEditor(id);
    }

    function toggleDirectoryAdminNode(event, id) {
        event.stopPropagation();
        if (expandedDirectoryNodes.has(id)) expandedDirectoryNodes.delete(id);
        else expandedDirectoryNodes.add(id);
        renderDirectoryAdminTree();
    }

    function filterDirectoryAdminTree() {
        const input = document.getElementById('directoryAdminSearchInput');
        const nodes = document.querySelectorAll('#directoryAdminTree .tree-node');
        if (!input || !nodes.length) return;
        const keyword = normalizeText(input.value.trim());
        if (!keyword) {
            nodes.forEach((node) => {
                node.style.display = 'block';
            });
            return;
        }

        nodes.forEach((node) => {
            const text = normalizeText(node.textContent || '');
            node.style.display = text.includes(keyword) ? 'block' : 'none';
        });
    }

    function mutateTree(nodes, targetId, handler) {
        for (let index = 0; index < nodes.length; index += 1) {
            const node = nodes[index];
            if (node.id === targetId) {
                return handler(nodes, index, node);
            }
            if (node.children && node.children.length) {
                const handled = mutateTree(node.children, targetId, handler);
                if (handled) return true;
            }
        }
        return false;
    }

    function saveDirectoryTree(tree, options = {}) {
        const normalized = normalizeDirectoryTree(tree);
        const dbRef = getDirectoryDb();
        const payload = {
            treeData: normalized,
            updatedAt: new Date().toISOString(),
            updatedBy: getCurrentAdminUser()
        };

        if (!dbRef) {
            setDirectoryData(normalized, { selectId: options.selectId });
            if (options.selectId) fillDirectoryEditor(options.selectId);
            return;
        }

        dbRef.collection('sotay').doc(DIRECTORY_DOC_ID).set(payload, { merge: true })
            .then(() => {
                setDirectoryData(normalized, { selectId: options.selectId });
                if (options.selectId) fillDirectoryEditor(options.selectId);
            })
            .catch((error) => {
                alert(`Lỗi khi lưu danh bạ: ${error}`);
            });
    }

    function createDirectoryNode(level, parentId = null) {
        return {
            id: `dir_${Date.now()}_${Math.random().toString(16).slice(2, 7)}`,
            name: level === 1 ? 'Đơn vị cấp 1 mới' : level === 2 ? 'Đơn vị cấp 2 mới' : 'Đơn vị cấp 3 mới',
            unitCode: '',
            level,
            parentId,
            phone: '',
            address: '',
            location: '',
            isActive: true,
            order: 9999,
            updatedAt: '',
            updatedBy: '',
            children: []
        };
    }

    function addDirectoryRoot() {
        if (!confirmDirectoryUnsaved()) return;
        const nextTree = safeClone(DIRECTORY_DATA);
        const newNode = createDirectoryNode(1, null);
        nextTree.push(newNode);
        saveDirectoryTree(nextTree, { selectId: newNode.id });
    }

    function addDirectoryChild() {
        if (!directoryCurrentEditId) {
            alert('Hãy chọn một đơn vị để thêm cấp dưới.');
            return;
        }
        if (!confirmDirectoryUnsaved()) return;
        const parentNode = findDirectoryNode(directoryCurrentEditId, DIRECTORY_DATA);
        if (!parentNode) return;
        if (parentNode.level >= 3) {
            alert('Danh bạ chỉ hỗ trợ tối đa 3 cấp.');
            return;
        }

        const nextTree = safeClone(DIRECTORY_DATA);
        const newNode = createDirectoryNode(parentNode.level + 1, parentNode.id);
        mutateTree(nextTree, parentNode.id, (siblings, index, node) => {
            node.children = node.children || [];
            node.children.push(newNode);
            expandedDirectoryNodes.add(parentNode.id);
            return true;
        });
        saveDirectoryTree(nextTree, { selectId: newNode.id });
    }

    function addDirectorySibling() {
        if (!directoryCurrentEditId) {
            addDirectoryRoot();
            return;
        }
        if (!confirmDirectoryUnsaved()) return;
        const currentNode = findDirectoryNode(directoryCurrentEditId, DIRECTORY_DATA);
        const parentNode = findDirectoryParent(directoryCurrentEditId, DIRECTORY_DATA);
        if (!currentNode) return;
        const nextTree = safeClone(DIRECTORY_DATA);
        const newNode = createDirectoryNode(currentNode.level, parentNode ? parentNode.id : null);

        if (!parentNode) {
            nextTree.push(newNode);
            saveDirectoryTree(nextTree, { selectId: newNode.id });
            return;
        }

        mutateTree(nextTree, parentNode.id, (siblings, index, node) => {
            node.children = node.children || [];
            node.children.push(newNode);
            expandedDirectoryNodes.add(parentNode.id);
            return true;
        });
        saveDirectoryTree(nextTree, { selectId: newNode.id });
    }

    function deleteCurrentDirectoryItem() {
        if (!directoryCurrentEditId) return;
        if (!confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa đơn vị này? Nếu còn đơn vị cấp dưới, toàn bộ nhánh sẽ bị xóa.')) return;
        const nextTree = safeClone(DIRECTORY_DATA);

        function removeNode(nodes) {
            const index = nodes.findIndex((node) => node.id === directoryCurrentEditId);
            if (index > -1) {
                nodes.splice(index, 1);
                return true;
            }
            return nodes.some((node) => node.children && removeNode(node.children));
        }

        if (removeNode(nextTree)) {
            directoryCurrentEditId = null;
            saveDirectoryTree(nextTree);
            document.getElementById('directoryEditorArea').style.display = 'none';
            document.getElementById('directoryEditorPlaceholder').style.display = 'block';
        }
    }

    function moveDirectoryNode(direction, id) {
        const nextTree = safeClone(DIRECTORY_DATA);

        function process(nodes) {
            for (let index = 0; index < nodes.length; index += 1) {
                if (nodes[index].id === id) {
                    const swapIndex = direction === 'up' ? index - 1 : index + 1;
                    if (swapIndex < 0 || swapIndex >= nodes.length) return true;
                    const temp = nodes[index];
                    nodes[index] = nodes[swapIndex];
                    nodes[swapIndex] = temp;
                    return true;
                }
                if (nodes[index].children && process(nodes[index].children)) return true;
            }
            return false;
        }

        if (process(nextTree)) {
            saveDirectoryTree(nextTree, { selectId: id });
        }
    }

    function moveDirectoryNodeUp(event, id) {
        event.stopPropagation();
        if (!confirmDirectoryUnsaved()) return;
        moveDirectoryNode('up', id);
    }

    function moveDirectoryNodeDown(event, id) {
        event.stopPropagation();
        if (!confirmDirectoryUnsaved()) return;
        moveDirectoryNode('down', id);
    }

    function saveCurrentDirectoryItem() {
        if (!directoryCurrentEditId) return;
        const name = document.getElementById('dirInpName').value.trim();
        const unitCode = document.getElementById('dirInpCode').value.trim();
        const phone = document.getElementById('dirInpPhone').value.trim();
        const address = document.getElementById('dirInpAddress').value.trim();
        const location = document.getElementById('dirInpLocation').value.trim();
        const isActive = document.getElementById('dirInpActive').checked;

        if (!name) {
            alert('Tên đơn vị là trường bắt buộc.');
            return;
        }

        const nextTree = safeClone(DIRECTORY_DATA);
        mutateTree(nextTree, directoryCurrentEditId, (siblings, index, node) => {
            node.name = name;
            node.unitCode = unitCode;
            node.phone = phone;
            node.address = address;
            node.location = location;
            node.isActive = isActive;
            node.updatedAt = new Date().toISOString();
            node.updatedBy = getCurrentAdminUser();
            return true;
        });
        resetDirectorySaveButton();
        saveDirectoryTree(nextTree, { selectId: directoryCurrentEditId });
    }

    function attachDirectoryListeners() {
        const searchInput = document.getElementById('directorySearchInput');
        const levelFilter = document.getElementById('directoryLevelFilter');
        const adminSearchInput = document.getElementById('directoryAdminSearchInput');

        if (searchInput) {
            searchInput.addEventListener('input', renderDirectoryTab);
        }
        if (levelFilter) {
            levelFilter.addEventListener('change', renderDirectoryTab);
        }
        if (adminSearchInput) {
            adminSearchInput.addEventListener('input', filterDirectoryAdminTree);
        }

        ['dirInpName', 'dirInpCode', 'dirInpPhone', 'dirInpAddress', 'dirInpLocation', 'dirInpActive'].forEach((id) => {
            const element = document.getElementById(id);
            if (!element) return;
            element.addEventListener(element.type === 'checkbox' ? 'change' : 'input', markDirectoryUnsaved);
        });

        window.addEventListener('resize', syncDirectoryBannerHeight);
        document.addEventListener('admin-auth-changed', renderDirectoryAdminMode);
    }

    function initDirectoryModule() {
        attachDirectoryListeners();
        subscribeDirectoryData();
        syncDirectoryBannerHeight();
        renderDirectoryAdminMode();
    }

    window.renderDirectoryTab = renderDirectoryTab;
    window.toggleDirectorySection = toggleDirectorySection;
    window.switchAdminMode = switchAdminMode;
    window.selectDirectoryItem = selectDirectoryItem;
    window.toggleDirectoryAdminNode = toggleDirectoryAdminNode;
    window.moveDirectoryNodeUp = moveDirectoryNodeUp;
    window.moveDirectoryNodeDown = moveDirectoryNodeDown;
    window.addDirectoryRoot = addDirectoryRoot;
    window.addDirectoryChild = addDirectoryChild;
    window.addDirectorySibling = addDirectorySibling;
    window.deleteCurrentDirectoryItem = deleteCurrentDirectoryItem;
    window.saveCurrentDirectoryItem = saveCurrentDirectoryItem;
    window.confirmDirectoryUnsaved = confirmDirectoryUnsaved;
    window.getCurrentAdminMode = () => currentAdminMode;

    document.addEventListener('DOMContentLoaded', initDirectoryModule);
})();
