// =====================
        // CONFIG
        // =====================
        const CONFIG = {
            SURVEY_API_URL: "https://script.google.com/macros/s/AKfycby1oXVzH9EeR0v1j2goesabdRwKECaUWLJNuPaeOJNBbsF0p5kAsgc53c-ISqOg491z/exec",
            CHATBOT_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwmOiTZdM6_Faew-OOTMzNhE8rkWGhVgTkBIzYcSntnD2MCkBKn-nnDgXwk-_Vs8xR7/exec",
            STATS_WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwi-3O5tJQeXy8We87nOdg3f0lYf2-DUI71G9jNyx-Z_fVUy6lWIQ4nXvvi9FFB0v0w/exec",
            SURVEY_WEB_APP_URL: "https://script.google.com/macros/s/AKfycby1oXVzH9EeR0v1j2goesabdRwKECaUWLJNuPaeOJNBbsF0p5kAsgc53c-ISqOg491z/exec",
            PDF_VIEWER_URL: "web/viewer.html",
            API_KEY: "SOTAY-API-KEY-2026-03-16-5F8C2A9D7E3B4A1C",
            RATE_LIMIT_MS: 1200,
            FCM_VAPID_KEY: "T-t1yEsxAdEil_DcRonTeeTO474Lg30qYdTnysOjyEQ"
        };
        const PROTECTED_ROUTE_CONFIG = {
            normalizedTitle: "he thong du lieu tcd dv tap trung",
            url: "https://code-web-sotay.vercel.app/"
        };
        // URL WEB APP KHẢO SÁT
	const SURVEY_API_URL = CONFIG.SURVEY_API_URL;

        const ACTION_COOLDOWNS = {};
        function isRateLimited(action, cooldown = CONFIG.RATE_LIMIT_MS) {
            const now = Date.now();
            if (ACTION_COOLDOWNS[action] && (now - ACTION_COOLDOWNS[action] < cooldown)) return true;
            ACTION_COOLDOWNS[action] = now;
            return false;
        }

        function getTodayKey(prefix) {
            const d = new Date();
            const day = d.toISOString().slice(0, 10);
            return `${prefix}_${day}`;
        }

        function buildApiUrl(base, params = {}) {
            const url = new URL(base);
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null) url.searchParams.set(k, v);
            });
            if (CONFIG.API_KEY) {
                const ts = Date.now().toString();
                const token = btoa(`${CONFIG.API_KEY}:${ts}`);
                url.searchParams.set('ts', ts);
                url.searchParams.set('token', token);
            }
            return url.toString();
        }

        function buildAuthPayload(payload) {
            if (!CONFIG.API_KEY) return payload;
            const ts = Date.now().toString();
            const token = btoa(`${CONFIG.API_KEY}:${ts}`);
            return { ...payload, ts, token };
        }

        function normalizeNodeTitleKey(text) {
            return removeAccents((text || '').toLowerCase())
                .replace(/[^a-z0-9]+/g, ' ')
                .trim();
        }

        function getProtectedRouteForNode(nodeOrTitle) {
            const rawTitle = typeof nodeOrTitle === 'string' ? nodeOrTitle : (nodeOrTitle && nodeOrTitle.title);
            if (!rawTitle) return null;
            return normalizeNodeTitleKey(rawTitle) === PROTECTED_ROUTE_CONFIG.normalizedTitle ? PROTECTED_ROUTE_CONFIG : null;
        }

// 1. Tự động hiện sau 2 phút (120.000 ms)
setTimeout(() => {
    // Chỉ hiện tối đa 1 lần mỗi ngày trên thiết bị này
    if (!localStorage.getItem(getTodayKey('survey_done'))) { 
        document.getElementById('autoSurveyOverlay').style.display = 'flex';
    }
}, 120000);

// 2. Gửi nhanh Rất hài lòng / Hài lòng
function sendQuickRating(level) {
    if (isRateLimited('survey', 1500)) return;
    if (localStorage.getItem(getTodayKey('survey_done'))) return;
    let url = buildApiUrl(SURVEY_API_URL, { action: 'Danh gia', content: level });
    
    // BƯỚC CẢI TIẾN: Hiện cảm ơn ngay lập tức không cần đợi server
    showThanks(); 
    
    // Gửi dữ liệu ngầm bên dưới
    fetch(url).catch(err => console.log("Lỗi gửi ngầm: ", err));
}

// 3. Hiện khung nhập ý kiến
function showFeedbackInput() {
    document.getElementById('surveyStep1').style.display = 'none';
    document.getElementById('surveyStep2').style.display = 'block';
}

//------- NÚT KHẢO SÁT -----
function openSurvey() {
    const overlay = document.getElementById('autoSurveyOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        // Reset lại các bước về bước 1 nếu người dùng đã từng mở
        document.getElementById('surveyStep1').style.display = 'block';
        document.getElementById('surveyStep2').style.display = 'none';
        document.getElementById('surveyThanks').style.display = 'none';
    }
}

// 4. Gửi nội dung góp ý văn bản
function sendFullFeedback() {
    let content = document.getElementById('txtFeedback').value.trim();
    if (!content) return alert("Mời đồng chí nhập nội dung!");
    if (isRateLimited('survey', 1500)) return;
    if (localStorage.getItem(getTodayKey('survey_done'))) return;
    
    let url = buildApiUrl(SURVEY_API_URL, { action: 'Gop y', content: content });
    
    // BƯỚC CẢI TIẾN: Hiện cảm ơn ngay lập tức
    showThanks();
    
    // Gửi dữ liệu ngầm
    fetch(url).catch(err => console.log("Lỗi gửi ngầm: ", err));
}

// 5. Hiển thị lời cảm ơn và đóng
function showThanks() {
    // Ghi vào bộ nhớ dài hạn của thiết bị
    localStorage.setItem(getTodayKey('survey_done'), 'true');
    
    document.getElementById('surveyStep1').style.display = 'none';
    document.getElementById('surveyStep2').style.display = 'none';
    document.getElementById('surveyThanks').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('autoSurveyOverlay').style.display = 'none';
    }, 3000);
}

	const PDF_VIEWER_URL = CONFIG.PDF_VIEWER_URL; 
        const PDF_COLLECTION = {
            "hd02": { name: "Hướng dẫn 02", shortName: "HD 02", file: "huongdan.pdf" },
            "qd294": { name: "Quy định 294", shortName: "QĐ 294", file: "quydinh294.pdf" },
            "hd38": { name: "Hướng dẫn 38", shortName: "HD 38", file: "huongdan38.pdf" },
	    "hd21": { name: "Hướng dẫn 21", shortName: "HD 21", file: "huongdan21.pdf" },
            "hd06": { name: "Hướng dẫn 06", shortName: "HD 06", file: "huongdan06.pdf" }
        };

        let APP_DATA = []; let currentEditNodeId = null; let loggedInUser = null; let expandedAdminNodes = new Set(); let isFirstLoadAdmin = true; let lastSearchKeyword = ""; let hasUnsavedChanges = false; let isSystemChangingContent = false; let pendingProtectedRoute = null;

        var toolbarOptions = [['bold', 'italic', 'underline'], [{'list': 'ordered'}, [{'list': 'bullet'}], ['link', 'clean']]];
        var quillSummary = new Quill('#inpSummary', { theme: 'snow', modules: { toolbar: toolbarOptions }, placeholder: 'Nhập nội dung tóm tắt...' });
        var quillDetail = new Quill('#inpDetail', { theme: 'snow', modules: { toolbar: toolbarOptions }, placeholder: 'Soạn thảo trích dẫn gốc...' });

        function debounceOpt(func, wait) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; }

        function markAsUnsaved() { if (isSystemChangingContent || !currentEditNodeId || hasUnsavedChanges) return; hasUnsavedChanges = true; const btn = document.getElementById('btnSaveSingle'); btn.style.background = "#f39c12"; btn.style.color = "#fff"; btn.innerHTML = "⚠️ ĐANG CHỈNH SỬA (Bấm để Lưu)"; }
        function resetSaveButton() { hasUnsavedChanges = false; const btn = document.getElementById('btnSaveSingle'); btn.style.background = "#27ae60"; btn.style.color = "#fff"; btn.innerHTML = "LƯU MỤC NÀY"; }

        quillSummary.on('text-change', markAsUnsaved); quillDetail.on('text-change', markAsUnsaved);
        ['inpTag', 'inpTitle', 'inpFileUrl', 'inpFileName', 'inpPdfDoc1', 'inpPdfPage1', 'inpPdfDoc2', 'inpPdfPage2', 'inpPdfDoc3', 'inpPdfPage3', 'inpPdfDoc4', 'inpPdfPage4', 'inpForceAccordion'].forEach(id => { let el = document.getElementById(id); if(el) el.addEventListener('input', markAsUnsaved); });

        function processLegacyText(text) { if (!text) return ''; if (text.indexOf('<p') === -1 && text.indexOf('<br') === -1 && text.indexOf('<ul') === -1 && text.indexOf('<ol') === -1) { return text.replace(/\n/g, '<br>'); } return text; }

        function initTheme() { const savedTheme = localStorage.getItem('sotay_theme'); if (savedTheme === 'dark') document.body.classList.add('dark-mode'); else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) document.body.classList.add('dark-mode'); } initTheme();
        function toggleDarkMode() { document.body.classList.toggle('dark-mode'); localStorage.setItem('sotay_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); }

        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    let progress = height > 0 ? (scrollTop / height) * 100 : 0;
                    document.getElementById('readingProgress').style.width = progress + "%";
                    document.getElementById("backToTop").style.display = scrollTop > 300 ? "flex" : "none";
                    scrollTicking = false;
                }); scrollTicking = true;
            }
        }, { passive: true });

        function switchTab(tabId) {
            document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            
            document.getElementById('tab-' + tabId).classList.add('active');
            document.getElementById('nav-' + tabId).classList.add('active');
            // Không tự lưu tab để tránh tự nhảy khi mở trang
            
            const headerTitle = document.getElementById('mainHeaderTitle');
            if(tabId === 'home') headerTitle.innerText = "TRANG CHỦ";
            else if(tabId === 'quydinh') headerTitle.innerText = "SỔ TAY QUY ĐỊNH";
            else if(tabId === 'hoidap') headerTitle.innerText = "HỎI ĐÁP NGHIỆP VỤ";
            else if(tabId === 'bieumau') headerTitle.innerText = "BIỂU MẪU TẢI VỀ";
            else if(tabId === 'tailieu') headerTitle.innerText = "TÀI LIỆU HƯỚNG DẪN";
            
            if (lastSearchKeyword !== "") {
                lastSearchKeyword = "";
                document.getElementById('searchInput').value = "";
                document.getElementById('homeSearchInput').value = "";
                renderUserInterface();
                renderFAQAndForms();
            }

            window.scrollTo({top: 0, behavior: 'smooth'});
        }

        function openPdfViewer(docId, pageNum, keyword) {
            if (!PDF_COLLECTION[docId]) return;
            let localPdfPath = "../" + PDF_COLLECTION[docId].file; 
            let fullUrl = `${PDF_VIEWER_URL}?file=${encodeURIComponent(localPdfPath)}`;
            if (pageNum) { fullUrl += `#page=${pageNum}`; if (keyword) fullUrl += `&search=${encodeURIComponent(keyword)}`; }
            
            document.getElementById('btnOpenNewTab').href = fullUrl; 
            document.getElementById('pdfFrame').src = fullUrl;
            document.getElementById('pdfSidebar').classList.add('active'); 
            document.body.classList.add('pdf-open');
        }
        function closePdfViewer() { document.getElementById('pdfSidebar').classList.remove('active'); document.body.classList.remove('pdf-open'); setTimeout(() => { document.getElementById('pdfFrame').src = ""; }, 300); }

        function addRecentView(id, title) {
            if(!id || !title) return;
            let recents = JSON.parse(localStorage.getItem('sotay_recents') || '[]');
            recents = recents.filter(item => item.id !== id); recents.unshift({id, title});
            if(recents.length > 5) recents.pop();
            localStorage.setItem('sotay_recents', JSON.stringify(recents));
            renderRecentViews();
        }

        function setLastRead(id, title) {
            if (!id || !title) return;
            localStorage.setItem('sotay_last_read', JSON.stringify({ id, title, ts: Date.now() }));
            renderContinueReading();
        }

        function renderContinueReading() {
            const box = document.getElementById('continueReading');
            const titleEl = document.getElementById('continueTitle');
            if (!box || !titleEl) return;
            const last = JSON.parse(localStorage.getItem('sotay_last_read') || 'null');
            if (!last || !last.id) { box.style.display = 'none'; return; }
            titleEl.textContent = last.title;
            box.style.display = 'flex';
        }

        function continueLastRead() {
            const last = JSON.parse(localStorage.getItem('sotay_last_read') || 'null');
            if (!last || !last.id) return;
            jumpToResult(last.id);
        }

        function clearContinueReading() {
            localStorage.removeItem('sotay_last_read');
            const box = document.getElementById('continueReading');
            if (box) box.style.display = 'none';
        }

        function setReadMode(enabled) {
            if (enabled) document.body.classList.add('read-mode');
            else document.body.classList.remove('read-mode');
            localStorage.setItem('sotay_read_mode', enabled ? '1' : '0');
            const btn = document.getElementById('readModeToggle');
            if (btn) btn.textContent = enabled ? 'Thoát đọc' : 'Đọc tập trung';
        }

        function toggleReadMode() {
            const enabled = document.body.classList.contains('read-mode');
            setReadMode(!enabled);
        }

        function getFavorites() {
            return JSON.parse(localStorage.getItem('sotay_favorites') || '[]');
        }

        function isFavorite(id) {
            return getFavorites().some(f => f.id === id);
        }

        function toggleFavorite(id, title) {
            if (!id || !title) return;
            let favs = getFavorites();
            if (favs.some(f => f.id === id)) {
                favs = favs.filter(f => f.id !== id);
            } else {
                favs.unshift({ id, title });
            }
            localStorage.setItem('sotay_favorites', JSON.stringify(favs.slice(0, 20)));
            renderFavorites();
            renderUserInterface();
        }

        function renderFavorites() {
            const box = document.getElementById('favoriteBox');
            const list = document.getElementById('favoriteList');
            if (!box || !list) return;
            const favs = getFavorites();
            if (favs.length === 0) { box.style.display = 'none'; return; }
            box.style.display = 'block';
            list.innerHTML = favs.map(f => `<div class="favorite-item" onclick="jumpToResult('${f.id}')"><svg width="16" height="16" color="var(--yellow-party)"><use href="#icon-book-open"></use></svg> <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.title}</span></div>`).join('');
        }

        function renderRecentViews() {
            let recents = JSON.parse(localStorage.getItem('sotay_recents') || '[]');
            let container = document.getElementById('recentViewsHomeList');
            let box = document.getElementById('recentViewsHome');
            if(recents.length === 0) { box.style.display = 'none'; return; }
            box.style.display = 'block';
            let html = '';
            recents.forEach(item => { html += `<div class="recent-list-item" onclick="jumpToResult('${item.id}')"><svg width="16" height="16" color="var(--primary-color)"><use href="#icon-book-open"></use></svg> <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.title}</span></div>`; });
            container.innerHTML = html;
        }

        function saveSearchHistory(kw) {
            if(!kw || kw.trim().length < 2) return;
            let hist = JSON.parse(localStorage.getItem('sotay_search_history') || '[]');
            hist = hist.filter(k => k !== kw);
            hist.unshift(kw);
            if(hist.length > 5) hist.pop();
            localStorage.setItem('sotay_search_history', JSON.stringify(hist));
        }

        function renderSearchHistory() {
            let hist = JSON.parse(localStorage.getItem('sotay_search_history') || '[]');
            let container = document.getElementById('recentSearchChips');
            let area = document.getElementById('searchHistoryArea');
            if(hist.length === 0) {
                area.style.display = 'none'; return;
            }
            area.style.display = 'block';
            container.innerHTML = hist.map(k => `<div class="faq-chip" onclick="quickAsk('${k}')">🕒 ${k}</div>`).join('');
        }

        function clearSearchHistory() {
            localStorage.removeItem('sotay_search_history');
            let area = document.getElementById('searchHistoryArea');
            let container = document.getElementById('recentSearchChips');
            if (container) container.innerHTML = '';
            if (area) area.style.display = 'none';
        }

        const firebaseConfig = { apiKey: "AIzaSyAN6SAuJhlkYtnuqVclEBhMn2Jz565Q7gs", authDomain: "sotay-dangvien.firebaseapp.com", projectId: "sotay-dangvien", storageBucket: "sotay-dangvien.firebasestorage.app", messagingSenderId: "699788813951", appId: "1:699788813951:web:14eb81183799f83e0f814a" };
        let db = null;
        try {
            if (window.firebase && firebase.apps) {
                if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
                db = firebase.firestore();
            } else {
                console.error("Firebase chưa được tải.");
            }
        } catch (e) {
            console.error("Lỗi khởi tạo Firebase:", e);
        }

        const thongKeRef = db ? db.collection("sotay").doc("thongke") : null;
        function getLocalTodayString() { return new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]; }
 

        if (db) db.collection("sotay").doc("dulieu").onSnapshot((doc) => {
            if (doc.exists) { APP_DATA = doc.data().treeData || []; } else { APP_DATA = [{ id: 'r1', title: 'PHẦN 1', tag: '', summary: '', detail: '', level: 0, children: [] }]; }
            try { localStorage.setItem('sotay_cached_tree', JSON.stringify(APP_DATA)); } catch(e) {}
            
            if (isFirstLoadAdmin && APP_DATA.length > 0) { 
                function initExpand(nodes) {
                    nodes.forEach(n => {
                        expandedAdminNodes.add(n.id);
                        if (n.children) initExpand(n.children);
                    });
                }
                initExpand(APP_DATA);
                isFirstLoadAdmin = false; 
            }
            
            renderHomeCategories(); renderFAQAndForms(); renderUserInterface(); renderRecentViews(); renderFavorites(); renderContinueReading();
            if (document.getElementById('adminPanel').style.display === 'block') { renderAdminTree(); }
        });
        else {
            try {
                const cached = JSON.parse(localStorage.getItem('sotay_cached_tree') || '[]');
                if (cached && cached.length) APP_DATA = cached;
            } catch(e) {}
            renderHomeCategories(); renderFAQAndForms(); renderUserInterface(); renderRecentViews(); renderFavorites(); renderContinueReading();
        }

        function renderHomeCategories() {
            let html = '';
            APP_DATA.forEach((node) => {
                html += `<div class="home-card" onclick="jumpToResult('${node.id}')">
                            <svg class="card-icon" width="36" height="36"><use href="#icon-folder"></use></svg>
                            <div class="card-title">${node.title}</div>
                         </div>`;
            });
            document.getElementById('homeCategories').innerHTML = html || '<p>Chưa có dữ liệu</p>';
        }

        function viewStandaloneItem(id) {
            let nodeData = findNode(id, APP_DATA);
            if(!nodeData) return;
            if (openProtectedRouteForNode(nodeData)) return;
            
            let displayTitle = highlightText(nodeData.title || 'Chưa đặt tên', lastSearchKeyword);
            let safeSummary = processLegacyText(nodeData.summary);
            let safeDetail = processLegacyText(nodeData.detail);
            let updatedAt = nodeData.updatedAt || nodeData.lastUpdated || nodeData.updated_at || "";
            let updatedLabel = updatedAt ? `Cập nhật lần cuối: ${formatDateShort(updatedAt)}` : "";
            
            let downloadBtn = nodeData.fileUrl ? `<div style="margin-top: 20px;"><a href="${nodeData.fileUrl}" target="_blank" class="inline-download" style="padding: 10px 15px; font-size: 1rem; border-radius: 4px;"><svg width="18" height="18"><use href="#icon-download"></use></svg> Tải về</a></div>` : '';
            
            let pdfSourceBtn = '';
            let refs = nodeData.pdfRefs || []; 
            if (nodeData.pdfPage && refs.length === 0) refs.push({doc: 'hd02', page: nodeData.pdfPage}); 
            let safeKwForPdf = (lastSearchKeyword || '').replace(/'/g, "\\'"); 
            refs.forEach(r => { 
                if (r.doc && r.page && PDF_COLLECTION[r.doc]) { 
                    let sName = PDF_COLLECTION[r.doc].shortName; 
                    pdfSourceBtn += `<div class="btn-mini btn-mini-pdf" onclick="openPdfViewer('${r.doc}', '${r.page}', '${safeKwForPdf}')" title="Căn cứ: ${PDF_COLLECTION[r.doc].name} - Trang ${r.page}"><svg width="14" height="14"><use href="#icon-pdf"></use></svg> ${sName}-Tr.${r.page}</div>`; 
                } 
            });
            let pdfContainer = pdfSourceBtn ? `<div style="margin-top: 15px; display: flex; gap: 8px; flex-wrap: wrap; border-top: 1px dashed var(--border-color); padding-top: 15px;"><b><svg width="16" height="16"><use href="#icon-book-open"></use></svg> Văn bản căn cứ:</b><br> ${pdfSourceBtn}</div>` : '';

            let html = `<div style="font-family: -apple-system, sans-serif; margin-bottom: 15px;">`;
            if(nodeData.tag) html += `<span class="tag-label" style="display:inline-block; margin-bottom:8px; background:var(--bg-hover); padding:4px 8px; border-radius:4px; border:1px solid var(--border-color);">${highlightText(nodeData.tag, lastSearchKeyword)}</span>`;
            html += `<h2 style="color: var(--primary-color); margin-top: 0; font-size: 1.35rem; line-height: 1.4;">${displayTitle}</h2>`;
            if (updatedLabel) html += `<div style="font-size:0.9rem; color:var(--text-muted); margin-top:4px;">${updatedLabel}</div>`;
            html += `</div>`;
            
            if (safeSummary) html += `<div style="font-weight: bold; margin-bottom: 15px; color: var(--text-main); font-size: 1.15rem; background: var(--bg-hover); padding: 15px; border-left: 4px solid var(--yellow-party); border-radius: 4px;">${safeSummary}</div>`;
            if (safeDetail) {
                html += `<div style="text-align: justify; font-size: 1.15rem; line-height: 1.6; word-wrap:break-word; overflow:hidden;">${safeDetail}</div>`;
            } else if (!safeSummary) {
                html += `<div style="color: var(--text-muted); font-style: italic;">Chưa cập nhật nội dung chi tiết...</div>`;
            }
            html += `<div style="margin-top: 12px;"><div class="btn-mini btn-mini-fav" onclick="toggleFavorite('${nodeData.id}','${(nodeData.title || '').replace(/'/g, "\\'")}')">${isFavorite(nodeData.id) ? '★ Đã ghim' : '☆ Ghim'}</div></div>`;
            
            html += downloadBtn + pdfContainer;

            document.getElementById('noi-dung-chi-tiet').innerHTML = html;
            document.getElementById('modalTrichDan').style.display = 'flex';
            
            addRecentView(id, nodeData.title);
        }

        function isDocTag(tagRaw) {
            return tagRaw.includes('tài liệu') || tagRaw.includes('tai lieu');
        }

        function isPdfUrl(url) {
            if (!url) return false;
            const u = url.toLowerCase();
            return u.includes(".pdf") || u.includes("google.com/file") || u.includes("drive.google.com");
        }

        function parseTagList(tagRaw) {
            if (!tagRaw) return [];
            return tagRaw.split(/[;,|]/).map(t => t.trim().toLowerCase()).filter(Boolean);
        }

        function renderDocFilterOptions() {
            const select = document.getElementById('docTagFilter');
            if (!select) return;
            const current = select.value || "";
            const tags = new Set();

            function walk(nodes, parentDoc = false) {
                nodes.forEach(n => {
                    const tagRaw = (n.tag || '').toLowerCase();
                    const isDocNode = isDocTag(tagRaw) || parentDoc;
                    if (isDocNode) {
                        parseTagList(tagRaw).forEach(t => {
                            if (t && !isDocTag(t)) tags.add(t);
                        });
                    }
                    if (n.children && n.children.length > 0) walk(n.children, isDocNode);
                });
            }

            walk(APP_DATA || []);
            const options = ['<option value="">Tất cả</option>']
                .concat(Array.from(tags).sort().map(t => `<option value="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</option>`));
            select.innerHTML = options.join('');
            if (current) select.value = current;
        }

        function hasTagOrFile(node, type, parentDoc = false) {
            let tagRaw = (node.tag || '').toLowerCase();
            let isDocNode = isDocTag(tagRaw) || parentDoc;
            if (type === 'faq' && tagRaw.includes('hỏi đáp')) return true;
            if (type === 'form' && (tagRaw.includes('biểu mẫu') || node.fileUrl)) return true;
            if (type === 'doc' && isDocNode && node.fileUrl) return true;
            if (node.children) {
                for (let c of node.children) {
                    if (hasTagOrFile(c, type, isDocNode)) return true;
                }
            }
            return false;
        }

        function containsSubGroupsWithContent(node, type) {
            if (!node.children || node.children.length === 0) return false;
            for (let c of node.children) {
                if (c.children && c.children.length > 0 && hasTagOrFile(c, type)) {
                    return true;
                }
            }
            return false;
        }

        function buildListHtmlDynamic(nodes, type, currentLevel = 0, parentDoc = false, docFilter = "") {
            let html = '';
            nodes.forEach(n => {
                if (!hasTagOrFile(n, type, parentDoc)) return;

                let tagRaw = (n.tag || '').toLowerCase();
                let isDocNode = isDocTag(tagRaw) || parentDoc;
                let isItemMatch = false;
                if (type === 'faq' && tagRaw.includes('hỏi đáp')) isItemMatch = true;
                if (type === 'form' && (tagRaw.includes('biểu mẫu') || n.fileUrl)) isItemMatch = true;
                if (type === 'doc' && isDocNode) {
                    if (docFilter) {
                        const tags = parseTagList(tagRaw);
                        isItemMatch = tags.includes(docFilter);
                    } else {
                        isItemMatch = true;
                    }
                }

                let summaryText = n.summary ? n.summary.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() : '';
                
                let displaySummary = '';
                if ((type === 'form' || type === 'doc') && summaryText) {
                    displaySummary = ` <span style="color: var(--text-muted); font-weight: normal; font-size: 0.95rem;">- ${summaryText}</span>`;
                }

                let hTitle = highlightText(n.fileName || n.title, lastSearchKeyword);
                let hSummary = displaySummary ? highlightText(displaySummary, lastSearchKeyword) : '';

                let childrenHtml = n.children ? buildListHtmlDynamic(n.children, type, currentLevel + 1, isDocNode, docFilter) : '';

                if (isItemMatch) {
                    let quickDownloadBtn = '';
                    if ((type === 'form' || type === 'doc') && n.fileUrl) {
                        quickDownloadBtn = `<a href="${n.fileUrl}" target="_blank" class="inline-download" style="flex-shrink: 0; padding: 6px 12px; margin-left: 10px; border-radius: 4px; background: var(--bg-box);" onclick="event.stopPropagation()"><svg width="14" height="14" style="margin-right:4px;"><use href="#icon-download"></use></svg>Tải về</a>`;
                    }
                    let quickViewBtn = '';
                    if (type === 'doc' && n.fileUrl) {
                        const safeUrl = n.fileUrl.replace(/'/g, "\\'");
                        if (isPdfUrl(n.fileUrl)) {
                            quickViewBtn = `<button class="inline-download" style="flex-shrink: 0; padding: 6px 10px; margin-left: 8px; border-radius: 4px; background: var(--bg-hover);" onclick="event.stopPropagation(); openDocViewer('${safeUrl}')"><svg width="14" height="14" style="margin-right:4px;"><use href="#icon-external"></use></svg>PDF</button>`;
                        } else {
                            quickViewBtn = `<a href="${n.fileUrl}" target="_blank" class="inline-download" style="flex-shrink: 0; padding: 6px 10px; margin-left: 8px; border-radius: 4px; background: var(--bg-hover);" onclick="event.stopPropagation()"><svg width="14" height="14" style="margin-right:4px;"><use href="#icon-external"></use></svg>Xem</a>`;
                        }
                    }

                    let iconRef = (type === 'faq') ? '#icon-faq' : '#icon-file';
                    let iconColor = (type === 'faq') ? '#f39c12' : (type === 'form' ? '#2980b9' : '#2c3e50');
                    html += `<div class="list-view-item" onclick="viewStandaloneItem('${n.id}')" style="margin-bottom: 10px; display: flex; align-items: flex-start; justify-content: space-between;">
                                <div class="list-title" style="margin-bottom: 0; line-height: 1.5; flex: 1; padding-right: 10px;">
                                    <svg width="18" height="18" style="flex-shrink:0; margin-top:2px; color:${iconColor};"><use href="${iconRef}"></use></svg> 
                                    <span>${hTitle}${hSummary}</span>
                                </div>
                                ${quickViewBtn}${quickDownloadBtn}
                            </div>`;
                }

                if (childrenHtml) {
                    let hasSubGroups = containsSubGroupsWithContent(n, type);
                    
                    if (hasSubGroups) {
                        html += `<div class="list-main-group">
                                    <div class="list-main-group-title">
                                        <svg width="20" height="20" style="flex-shrink:0; margin-top:2px;"><use href="#icon-folder"></use></svg> 
                                        <span>${highlightText(n.title, lastSearchKeyword)}</span>
                                    </div>
                                    <div class="list-main-group-body" style="padding-left: 5px;">${childrenHtml}</div>
                                 </div>`;
                    } else {
                        if (currentLevel <= 3 && !n.forceAccordion) {
                             html += childrenHtml; 
                        } else {
                            let bgClass = (currentLevel % 2 === 0) ? 'sub-group-l3' : 'sub-group-l4';
                            html += `<div class="list-sub-group ${bgClass}">
                                        <div class="list-sub-group-header" onclick="toggleAccordion(this)">
                                            <div style="display:flex; align-items:flex-start; gap:8px;">
                                                <svg width="18" height="18" style="flex-shrink:0; margin-top:2px; color:var(--text-muted);"><use href="#icon-folder"></use></svg> 
                                                <span style="line-height:1.4;">${highlightText(n.title, lastSearchKeyword)}</span>
                                            </div>
                                            <svg width="16" height="16" class="sub-group-arrow"><use href="#icon-chevron-down"></use></svg>
                                        </div>
                                        <div class="list-sub-group-body">${childrenHtml}</div>
                                     </div>`;
                        }
                    }
                }
            });
            return html;
        }

        function renderFAQAndForms() {
            let faqHtml = buildListHtmlDynamic(APP_DATA, 'faq');
            let formHtml = buildListHtmlDynamic(APP_DATA, 'form');
            
            document.getElementById('faqListContainer').innerHTML = faqHtml || '<div class="no-result">Chưa có dữ liệu hỏi đáp.</div>';
            document.getElementById('formListContainer').innerHTML = formHtml || '<div class="no-result">Chưa có biểu mẫu nào.</div>';
            renderDocFilterOptions();
            renderDocList();
        }

        function renderDocList() {
            const docEl = document.getElementById('docListContainer');
            if (!docEl) return;
            const filterEl = document.getElementById('docTagFilter');
            const docFilter = (filterEl && filterEl.value) ? filterEl.value.toLowerCase() : "";
            let docHtml = buildListHtmlDynamic(APP_DATA, 'doc', 0, false, docFilter);
            docEl.innerHTML = docHtml || '<div class="no-result">Chưa có tài liệu nào.</div>';
        }

        function highlightText(text, keyword) {
            if (!keyword || !text) return text || '';
            let safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${safeKeyword})(?![^<]*>)`, 'gi');
            return text.replace(regex, '<mark class="search-highlight">$1</mark>');
        }

        function formatDateShort(ts) {
            try {
                const d = new Date(ts);
                if (isNaN(d.getTime())) return "";
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yy = d.getFullYear();
                return `${dd}/${mm}/${yy}`;
            } catch { return ""; }
        }

        function isNewItem(updatedAt) {
            if (!updatedAt) return false;
            const t = new Date(updatedAt).getTime();
            if (isNaN(t)) return false;
            const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
            return (Date.now() - t) <= NEW_WINDOW_MS;
        }

        function renderUserInterface() {
            renderSidebarMenu(); 
            const contentEl = document.getElementById('dynamicContent'); contentEl.innerHTML = ''; 
            if (!APP_DATA || APP_DATA.length === 0) return;
            
            function processNode(items, container) {
                items.forEach(item => {
                    let div = document.createElement('div'); div.id = item.id; let innerContent = '';
                    let downloadBtn = item.fileUrl ? `<a href="${item.fileUrl}" target="_blank" class="inline-download" title="Tải về" onclick="event.stopPropagation()"><svg width="14" height="14"><use href="#icon-download"></use></svg> Tải về</a>` : ''; 
                    let nextContainer = container; 
                    
                    let displayTitle = highlightText(item.title || 'Chưa đặt tên', lastSearchKeyword);
                    let updatedAt = item.updatedAt || item.lastUpdated || item.updated_at || "";
                    let updatedLabel = updatedAt ? `Cập nhật: ${formatDateShort(updatedAt)}` : "";
                    let newBadge = isNewItem(updatedAt) ? `<span class="badge-new">Mới</span>` : "";
                    let safeSummary = processLegacyText(item.summary); let displaySummary = highlightText(safeSummary, lastSearchKeyword);

                    let refs = item.pdfRefs || []; if (item.pdfPage && refs.length === 0) refs.push({doc: 'hd02', page: item.pdfPage}); 
                    let pdfSourceBtn = '';
                    let safeKwForPdf = (lastSearchKeyword || '').replace(/'/g, "\\'"); 
                    refs.forEach(r => { if (r.doc && r.page && PDF_COLLECTION[r.doc]) { let sName = PDF_COLLECTION[r.doc].shortName; pdfSourceBtn += `<div class="btn-mini btn-mini-pdf" onclick="openPdfViewer('${r.doc}', '${r.page}', '${safeKwForPdf}')" title="Căn cứ: ${PDF_COLLECTION[r.doc].name} - Trang ${r.page}"><svg width="14" height="14"><use href="#icon-pdf"></use></svg> ${sName}-Tr.${r.page}</div>`; } });
                    let dtBtn = item.detail ? `<div class="btn-mini btn-mini-detail" onclick="showPopup('${item.id}')"><svg width="14" height="14"><use href="#icon-book-open"></use></svg> Xem chi tiết</div>` : '';

                    if(item.level === 0) {
                        let hTag = 'h2'; let hClass = 'phan-header';
                        innerContent += `<${hTag} class="${hClass}">${displayTitle} ${newBadge} ${downloadBtn}</${hTag}>`;
                        if (item.summary) innerContent += `<div class="content-text" style="border:none; padding-left:0;">${displaySummary}</div>`;
                        if (updatedLabel) innerContent += `<div style="font-size:0.85rem; color:var(--text-muted); padding-left:2px; margin-top:4px;">${updatedLabel}</div>`;
                        if (item.detail || pdfSourceBtn) innerContent += `<div class="step-actions-right">${dtBtn}${pdfSourceBtn}</div>`;
                        div.innerHTML = innerContent; container.appendChild(div);
                    } else {
                        let levelClass = item.level === 1 ? 'level-1' : (item.level === 2 ? 'level-2' : (item.level === 3 ? 'level-3' : 'level-4'));
                        let titleHtml = '';
                        if (item.level === 1) titleHtml = `<div style="font-weight: bold; color: var(--text-muc); font-size: 1.15em; margin-bottom: 0; word-wrap:break-word; text-transform: uppercase;">${displayTitle} ${newBadge} ${downloadBtn}</div>`;
                        else if (item.level === 2) titleHtml = `<div style="font-weight: 700; color: #1b5e20; margin-bottom: 0; word-wrap:break-word;">${displayTitle} ${newBadge} ${downloadBtn}</div>`;
                        else if (item.level === 3) titleHtml = `<div style="font-weight: 700; color: #34495e; margin-bottom: 0; word-wrap:break-word;">${displayTitle} ${newBadge} ${downloadBtn}</div>`;
                        else titleHtml = `<div class="step-number" style="margin-bottom:0; word-wrap:break-word;">${displayTitle} ${newBadge} ${downloadBtn}</div>`;

                        div.className = `step-box ${levelClass}`; 
                        let tagHtml = item.tag ? `<span class="tag-label">${highlightText(item.tag, lastSearchKeyword)}</span>` : ''; 
                        let summaryHtml = item.summary ? `<div class="content-text">${displaySummary}</div>` : '';
                        let updatedHtml = updatedLabel ? `<div style="font-size:0.85rem; color:var(--text-muted); padding: 0 15px 10px 15px;">${updatedLabel}</div>` : '';
                        let detailBtnHtml = ''; if (item.detail || pdfSourceBtn) detailBtnHtml = `<div class="step-actions-right">${dtBtn}${pdfSourceBtn}</div>`;
                        let favBtn = `<div class="btn-mini btn-mini-fav" onclick="toggleFavorite('${item.id}','${(item.title || '').replace(/'/g, "\\'")}')">${isFavorite(item.id) ? '★ Đã ghim' : '☆ Ghim'}</div>`;
                        let actionRow = detailBtnHtml ? detailBtnHtml.replace('</div>', `${favBtn}</div>`) : `<div class="step-actions-right">${favBtn}</div>`;
                        
                        let hasChildren = (item.children && item.children.length > 0) || item.summary || item.detail || pdfSourceBtn; 
                        let iconHtml = hasChildren ? `<div class="step-icon"><svg width="18" height="18"><use href="#icon-chevron-down"></use></svg></div>` : '';
                        
                        div.innerHTML = `<div class="step-header" onclick="toggleStep(this, event, '${item.id}', '${item.title ? item.title.replace(/'/g, "\\'") : ''}')"><div class="step-title-wrapper">${tagHtml}${titleHtml}</div>${iconHtml}</div><div class="step-body-wrapper"><div class="step-body"><div class="step-body-inner" id="inner-${item.id}">${summaryHtml}${updatedHtml}${actionRow}</div></div></div>`;
                        container.appendChild(div); nextContainer = div.querySelector(`#inner-${item.id}`);
                    }
                    if(item.children && item.children.length > 0) processNode(item.children, nextContainer);
                });
            } processNode(APP_DATA, contentEl);
            renderToc();
        }

        function buildTocItems(items, out) {
            items.forEach(item => {
                out.push({ id: item.id, title: item.title || 'Chưa đặt tên', level: item.level || 0 });
                if (item.children && item.children.length > 0) buildTocItems(item.children, out);
            });
        }

        function renderToc() {
            const tocEl = document.getElementById('tocList');
            if (!tocEl) return;
            const list = [];
            if (APP_DATA && APP_DATA.length > 0) buildTocItems(APP_DATA, list);
            if (list.length === 0) {
                tocEl.innerHTML = "<div class='no-result'>Chưa có mục lục</div>";
                return;
            }
            let html = "";
            list.forEach(item => {
                const safeTitle = item.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                html += `<div class="toc-item level-${item.level}" onclick="jumpToResult('${item.id}'); closeTocModal();">${safeTitle}</div>`;
            });
            tocEl.innerHTML = html;
        }

        function openTocModal() {
            const modal = document.getElementById('modalToc');
            if (!modal) return;
            renderToc();
            modal.style.display = 'flex';
        }

        function closeTocModal() { document.getElementById('modalToc').style.display = 'none'; }

        function openDocViewer(url) {
            const modal = document.getElementById('modalDocViewer');
            const frame = document.getElementById('docViewerFrame');
            if (!modal || !frame || !url) return;
            frame.src = url;
            modal.style.display = 'flex';
        }

        function closeDocViewer() {
            const modal = document.getElementById('modalDocViewer');
            const frame = document.getElementById('docViewerFrame');
            if (modal) modal.style.display = 'none';
            if (frame) frame.src = "";
        }

        function updateBreadcrumb(targetId) { let pathIds = getParentIdPath(targetId, APP_DATA); if (!pathIds || pathIds.length === 0) return; let html = '<svg width="16" height="16" style="vertical-align:text-bottom; margin-right:4px;"><use href="#icon-folder"></use></svg> '; pathIds.forEach((pid, index) => { let node = findNode(pid, APP_DATA); if(node) { html += `<span onclick="jumpToResult('${pid}')">${node.title}</span>`; if(index < pathIds.length - 1) html += ' <span style="color:#999; text-decoration:none; cursor:default"> &gt; </span> '; } }); const bar = document.getElementById('breadcrumbBar'); bar.innerHTML = html; bar.style.display = 'block'; }

        function toggleStep(headerEl, event, id, title) {
            if (event && (event.target.closest('a') || event.target.closest('.btn-mini'))) return; if (event) event.stopPropagation();
            let nodeData = findNode(id, APP_DATA);
            if (nodeData && openProtectedRouteForNode(nodeData)) return;
            const stepBox = headerEl.parentElement; let parentInner = stepBox.parentElement;
            if (parentInner) { let siblings = parentInner.children; for(let i=0; i<siblings.length; i++) { if (siblings[i] !== stepBox && siblings[i].classList.contains('step-box')) siblings[i].classList.remove('active'); } }
            stepBox.classList.toggle('active');
            if(stepBox.classList.contains('active')) { updateBreadcrumb(id); if(title) { addRecentView(id, title); setLastRead(id, title); } }
        }

        function expandAll() { document.querySelectorAll('.step-box').forEach(box => box.classList.add('active')); }
        function collapseAll() { document.querySelectorAll('.step-box').forEach(box => box.classList.remove('active')); document.getElementById('breadcrumbBar').style.display = 'none'; topFunction(); }

        function renderSidebarMenu() {
            const menuEl = document.getElementById('menuList'); 
            if (!menuEl) return;
            menuEl.innerHTML = '';
        }

        function openSearchModal() { 
            document.getElementById('modalSearch').style.display = 'flex'; 
            document.getElementById('searchInput').value = ''; 
            document.getElementById('faqSuggestions').style.display = 'block'; 
            document.getElementById('searchResults').innerHTML = '<div class="no-result">Gõ từ khóa để tìm...</div>'; 
            
            let activeTab = document.querySelector('.tab-pane.active').id;
            let filterSelect = document.getElementById('searchTagFilter');
            if(activeTab === 'tab-hoidap') filterSelect.value = 'hỏi đáp';
            else if(activeTab === 'tab-bieumau') filterSelect.value = 'biểu mẫu';
            else if(activeTab === 'tab-tailieu') filterSelect.value = 'tài liệu';
            else if(activeTab === 'tab-quydinh') filterSelect.value = 'quy định';
            else filterSelect.value = '';

            renderSearchHistory();
            setTimeout(()=>document.getElementById('searchInput').focus(), 100); 
        }

        function closeSearchModal() { document.getElementById('modalSearch').style.display = 'none'; }

        function isAuthenticatedProtectedUser() {
            return !!(window.firebase && firebase.auth && firebase.auth().currentUser);
        }

        function redirectToProtectedRoute(route) {
            if (!route || !route.url) return;
            window.location.href = route.url;
        }

        function openProtectedAccessModal(route) {
            pendingProtectedRoute = route;
            const overlay = document.getElementById('protectedAccessOverlay');
            const userEl = document.getElementById('protectedAccessUsername');
            const passEl = document.getElementById('protectedAccessPassword');
            const errEl = document.getElementById('protectedAccessError');
            if (errEl) errEl.style.display = 'none';
            if (passEl) passEl.value = '';
            if (overlay) overlay.style.display = 'flex';
            setTimeout(() => {
                if (userEl) userEl.focus();
            }, 60);
        }

        function closeProtectedAccessModal() {
            const overlay = document.getElementById('protectedAccessOverlay');
            const errEl = document.getElementById('protectedAccessError');
            const passEl = document.getElementById('protectedAccessPassword');
            if (overlay) overlay.style.display = 'none';
            if (errEl) errEl.style.display = 'none';
            if (passEl) passEl.value = '';
            pendingProtectedRoute = null;
        }

        function closeProtectedAccessOnBg(event) {
            if (event && event.target && event.target.id === 'protectedAccessOverlay') {
                closeProtectedAccessModal();
            }
        }

        function submitProtectedAccessLogin() {
            if (!window.firebase || !firebase.auth) {
                alert("Chưa tải được dịch vụ xác thực. Vui lòng thử lại.");
                return;
            }
            const userEl = document.getElementById('protectedAccessUsername');
            const passEl = document.getElementById('protectedAccessPassword');
            const errEl = document.getElementById('protectedAccessError');
            const btn = document.querySelector('.protected-access-btn');
            let username = (userEl && userEl.value ? userEl.value : '').trim().toLowerCase();
            const password = (passEl && passEl.value ? passEl.value : '').trim();

            if (!username || !password) {
                if (errEl) {
                    errEl.textContent = "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.";
                    errEl.style.display = 'block';
                }
                return;
            }

            const email = username.includes('@') ? username : `${username}@sotay.com`;
            const originalText = btn ? btn.innerText : "";
            if (btn) {
                btn.disabled = true;
                btn.innerText = "ĐANG XÁC THỰC...";
            }
            if (errEl) errEl.style.display = 'none';

            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(() => {
                    const route = pendingProtectedRoute;
                    closeProtectedAccessModal();
                    redirectToProtectedRoute(route);
                })
                .catch(() => {
                    if (errEl) {
                        errEl.textContent = "Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa được cấp quyền.";
                        errEl.style.display = 'block';
                    }
                    if (passEl) passEl.value = '';
                })
                .finally(() => {
                    if (btn) {
                        btn.disabled = false;
                        btn.innerText = originalText || "MỞ HỆ THỐNG DỮ LIỆU";
                    }
                });
        }

        function openProtectedRouteForNode(nodeOrTitle) {
            const route = getProtectedRouteForNode(nodeOrTitle);
            if (!route) return false;
            if (isAuthenticatedProtectedUser()) {
                redirectToProtectedRoute(route);
            } else {
                openProtectedAccessModal(route);
            }
            return true;
        }

        let noticeList = [];
        let latestNotice = null;
        let fcmToken = null;

        function openNoticeModal() {
            const modal = document.getElementById('modalNotice');
            if (!modal) return;
            modal.style.display = 'flex';
            fetchLatestNotice(true);
        }

        function closeNoticeModal() { document.getElementById('modalNotice').style.display = 'none'; }

        function escapeNoticeHtml(text) {
            return (text || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        }

        function formatNoticeDate(raw) {
            if (!raw) return "";
            const d = new Date(raw);
            if (isNaN(d.getTime())) return "";
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            const hh = String(d.getHours()).padStart(2, "0");
            const min = String(d.getMinutes()).padStart(2, "0");
            return `${dd}/${mm}/${yyyy} - ${hh}:${min}`;
        }

        function renderNoticeModal() {
            const listEl = document.getElementById('noticeList');
            if (!listEl) return;

            if (noticeList && noticeList.length > 0) {
                const items = noticeList.slice(0, 5).map(n => {
                    const t = escapeNoticeHtml(n.title || "Thông báo");
                    const d = escapeNoticeHtml(formatNoticeDate(n.published_at || n.created_at || ""));
                    const c = escapeNoticeHtml(n.content || "");
                    return `<div class="notice-item">
                                <div class="notice-item-title">${t}</div>
                                ${d ? `<div class="notice-item-date">${d}</div>` : ""}
                                <div class="notice-item-content">${c}</div>
                            </div>`;
                }).join('');
                listEl.innerHTML = items;
            } else {
                listEl.innerHTML = '<div class="notice-empty">Hệ thống chưa có thông báo mới.</div>';
            }

            const adminPanel = document.getElementById('noticeAdminPanel');
            if (adminPanel) adminPanel.style.display = loggedInUser ? 'block' : 'none';

            if (loggedInUser) {
                const dateInput = document.getElementById('noticeDateInput');
                if (dateInput && !dateInput.value) {
                    const d = new Date();
                    dateInput.value = d.toISOString().slice(0,10);
                }
            }

            updatePushStatus();
        }

        function updateNoticeBadge() {
            const badge = document.getElementById('noticeBadge');
            const badgeAdmin = document.getElementById('noticeBadgeAdmin');
            if (!badge) return;
            if (!noticeList || noticeList.length === 0) {
                badge.style.display = 'none';
                if (badgeAdmin) badgeAdmin.style.display = 'none';
                return;
            }
            let unseenCount = 0;
            noticeList.forEach(n => {
                if (!n || !n.id) return;
                const seenKey = `notice_seen_${n.id}`;
                if (!localStorage.getItem(seenKey)) unseenCount++;
            });
            if (unseenCount === 0) {
                badge.style.display = 'none';
                if (badgeAdmin) badgeAdmin.style.display = 'none';
            } else {
                badge.style.display = 'inline-block';
                badge.textContent = unseenCount > 9 ? "9+" : String(unseenCount);
                if (badgeAdmin) {
                    badgeAdmin.style.display = 'inline-block';
                    badgeAdmin.textContent = unseenCount > 9 ? "9+" : String(unseenCount);
                }
            }
        }

        function markNoticeSeen() {
            if (!noticeList || noticeList.length === 0) return;
            noticeList.forEach(n => {
                if (!n || !n.id) return;
                const seenKey = `notice_seen_${n.id}`;
                localStorage.setItem(seenKey, '1');
            });
            updateNoticeBadge();
        }

        function fetchLatestNotice(markAfter = false) {
            if (!STATS_WEB_APP_URL) return;
            const url = buildApiUrl(STATS_WEB_APP_URL, { action: 'notice_get' });
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    let items = [];
                    if (Array.isArray(data)) items = data;
                    else if (data && Array.isArray(data.items)) items = data.items;
                    else if (data && data.title) items = [data];
                    noticeList = items.slice(0, 5);
                    latestNotice = noticeList[0] || null;
                    renderNoticeModal();
                    updateNoticeBadge();
                    if (markAfter) markNoticeSeen();
                })
                .catch(() => {});
        }

        function submitNotice() {
            if (!loggedInUser) return alert("Vui lòng đăng nhập quản trị để gửi thông báo.");
            const title = (document.getElementById('noticeTitleInput') || {}).value || "";
            const content = (document.getElementById('noticeContentInput') || {}).value || "";
            const isPublic = document.getElementById('noticePublicInput')?.checked ? "TRUE" : "FALSE";
            const dateVal = (document.getElementById('noticeDateInput') || {}).value || "";
            if (!title.trim() || !content.trim()) return alert("Vui lòng nhập đầy đủ tiêu đề và nội dung.");

            const url = buildApiUrl(STATS_WEB_APP_URL, {
                action: 'notice_set',
                title: title.trim(),
                content: content.trim(),
                is_public: isPublic,
                published_at: dateVal
            });

            fetch(url)
                .then(res => res.json())
                .then(() => {
                    fetchLatestNotice();
                    if (isPublic === "TRUE") triggerNoticePush(title.trim(), content.trim());
                    closeNoticeModal();
                })
                .catch(() => alert("Không gửi được thông báo. Vui lòng thử lại."));
        }

        function clearNoticeForm() {
            const title = document.getElementById('noticeTitleInput');
            const content = document.getElementById('noticeContentInput');
            const pub = document.getElementById('noticePublicInput');
            if (title) title.value = "";
            if (content) content.value = "";
            if (pub) pub.checked = false;
        }

        function updatePushStatus() {
            const statusEl = document.getElementById('pushStatus');
            if (!statusEl) return;
            if (!CONFIG.FCM_VAPID_KEY) {
                statusEl.textContent = "Chưa cấu hình thông báo đẩy";
                return;
            }
            if (fcmToken) {
                statusEl.textContent = "Đã bật thông báo đẩy";
            } else {
                statusEl.textContent = "Chưa bật thông báo đẩy";
            }
        }

        function enablePushNotifications() {
            if (!CONFIG.FCM_VAPID_KEY) {
                alert("Chưa cấu hình VAPID Key cho thông báo đẩy.");
                return;
            }
            if (!('serviceWorker' in navigator)) {
                alert("Trình duyệt không hỗ trợ thông báo đẩy.");
                return;
            }
            if (!firebase?.messaging) {
                alert("Chưa tải Firebase Messaging.");
                return;
            }
            requestFcmToken();
        }

        function requestFcmToken() {
            navigator.serviceWorker.register('firebase-messaging-sw.js')
                .then(reg => {
                    const messaging = firebase.messaging();
                    if (messaging.usePublicVapidKey) messaging.usePublicVapidKey(CONFIG.FCM_VAPID_KEY);
                    return messaging.getToken({ serviceWorkerRegistration: reg });
                })
                .then(token => {
                    if (!token) throw new Error("Không lấy được token.");
                    fcmToken = token;
                    updatePushStatus();
                    const url = buildApiUrl(STATS_WEB_APP_URL, { action: 'notice_token_set', token: token });
                    return fetch(url);
                })
                .catch(() => alert("Không bật được thông báo đẩy. Vui lòng thử lại."));
        }

        function triggerNoticePush(title, content) {
            const url = buildApiUrl(STATS_WEB_APP_URL, {
                action: 'notice_push',
                title: title,
                content: content
            });
            fetch(url).catch(() => {});
        }
        
        function quickAsk(keyword) { 
            document.getElementById('searchInput').value = keyword; 
            document.getElementById('searchTagFilter').value = ''; 
            performSearch(); 
        }
        
        function quickHomeSearch() { 
            if (isRateLimited('search', 800)) return;
            let kw = document.getElementById('homeSearchInput').value; 
            if(!kw) return; 
            openSearchModal(); 
            document.getElementById('searchInput').value = kw; 
            document.getElementById('searchTagFilter').value = '';
            setTimeout(() => performSearch(), 50); 
        }

        function homeAiSearch() {
            let kw = document.getElementById('homeSearchInput').value;
            if (!kw || !kw.trim()) return;
            handleAiSearchPrompt(true, kw.trim());
        }

        function modalAiSearch() {
            const kw = (document.getElementById('searchInput') || {}).value || "";
            if (!kw.trim()) return;
            handleAiSearchPrompt(true, kw.trim());
        }

        function openSearchChoice() {
            const kw = (document.getElementById('searchInput') || {}).value || "";
            if (!kw.trim()) return;
            const overlay = document.getElementById('searchChoiceOverlay');
            if (overlay) overlay.style.display = 'flex';
        }

        function closeSearchChoice() {
            const overlay = document.getElementById('searchChoiceOverlay');
            if (overlay) overlay.style.display = 'none';
        }

        function closeSearchChoiceOnBg(event) {
            if (event && event.target && event.target.id === 'searchChoiceOverlay') closeSearchChoice();
        }

        function chooseSearchAction(type) {
            closeSearchChoice();
            if (type === 'ai') {
                modalAiSearch();
                return;
            }
            performSearch();
        }
	// Hàm loại bỏ dấu tiếng Việt để tìm kiếm chính xác hơn
function removeAccents(str) {
    if (!str) return '';
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .replace(/Đ/g, 'D');
}
// Thêm biến event vào trong ngoặc để bắt sự kiện gõ phím
function performSearch(event) {
    if (isRateLimited('search', 800)) return;
    let kwRaw = "";

    // QUÉT TẤT CẢ các ô tìm kiếm có trên trang (để trị bệnh trùng ID)
    let searchInputs = document.querySelectorAll('#searchInput, .search-input, input[type="search"]');
    searchInputs.forEach(input => {
        if (input.value.trim() !== '') {
            kwRaw = input.value.trim();
        }
    });

    // ƯU TIÊN SỐ 1: Lấy trực tiếp từ ô đang được gõ (Cực kỳ nhạy trên Mobile)
    if (event && event.target && event.target.value !== undefined) {
        kwRaw = event.target.value.trim();
    }

    let kwNoAccent = removeAccents(kwRaw.toLowerCase());
    const stopwords = new Set([
        'thu', 'tuc', 'quy', 'trinh', 'huong', 'dan', 'cach', 've', 'cho',
        'la', 'va', 'theo', 'noi', 'dung', 'quy', 'dinh', 'thong', 'tu',
        'nghi', 'dinh', 'huong', 'dan', 'thuong', 'gap', 'cap', 'nhat'
    ]);
    function tokenizeNoAccent(text) {
        if (!text) return [];
        return text.split(/[^a-z0-9]+/i).filter(Boolean);
    }
    function filterTokens(tokens) {
        return tokens.filter(t => !stopwords.has(t));
    }
    
    let filterTagEl = document.getElementById('searchTagFilter');
    let filterTag = filterTagEl ? filterTagEl.value.toLowerCase() : '';
    
    let resContainer = document.getElementById('searchResults'); 
    let faqDiv = document.getElementById('faqSuggestions');
    let histDiv = document.getElementById('searchHistoryArea');

    // Điều kiện dừng nếu gõ chưa đủ chữ
    if (kwNoAccent.length < 2 && filterTag === '') { 
        if (resContainer) resContainer.innerHTML = '<div class="no-result">Vui lòng gõ ít nhất 2 ký tự hoặc chọn bộ lọc.</div>'; 
        if (faqDiv) faqDiv.style.display = 'block'; 
        if (histDiv && JSON.parse(localStorage.getItem('sotay_search_history') || '[]').length > 0) histDiv.style.display = 'block';
        return; 
    }

 
    // GỌI LỆNH GHI NHẬN TÌM KIẾM VÀO GOOGLE SHEETS
    if (typeof recordSearch === "function") {
        recordSearch(kwRaw);
    }

    // Ẩn các phần không liên quan
    if (typeof faqDiv !== 'undefined' && faqDiv) faqDiv.style.display = 'none';
    if (typeof histDiv !== 'undefined' && histDiv) histDiv.style.display = 'none';

    lastSearchKeyword = kwRaw; 
    let results = [];
    
    if (typeof saveSearchHistory === "function") saveSearchHistory(kwRaw);

    // NÂNG CẤP 1: HÀM TẠO ĐOẠN TRÍCH DẪN (SNIPPET)
    function getSnippet(text, kw) {
        if (!text) return "";
        let plainText = text.replace(/<[^>]*>/g, ' '); 
        let plainTextLower = removeAccents(plainText.toLowerCase());
        let index = plainTextLower.indexOf(kw);
        if (index === -1) return "";

        let start = Math.max(0, index - 40);
        let end = Math.min(plainText.length, index + kw.length + 60);
        let snippet = plainText.substring(start, end);
        if (start > 0) snippet = "..." + snippet;
        if (end < plainText.length) snippet = snippet + "...";
        return snippet;
    }

    // NÂNG CẤP 2: TÌM SÂU VÀO N.DETAIL VÀ N.SUMMARY
    function traverse(nodes, parentPath) {
        for(let n of nodes) {
            let curPath = parentPath ? (parentPath + " > " + n.title) : (n.title || ''); 
            let tagText = n.tag ? n.tag.toLowerCase() : '';
            
            let isTagMatch = filterTag === '' || tagText.includes(filterTag); 
            let fullText = (n.title||'') + " " + (n.tag||'') + " " + (n.summary||'') + " " + (n.detail||'');
            let titleNoAccent = removeAccents((n.title || '').toLowerCase());
            let summaryNoAccent = removeAccents((n.summary || '').toLowerCase());
            let detailNoAccent = removeAccents((n.detail || '').toLowerCase());
            let fullTextNoAccent = removeAccents(fullText.toLowerCase());
            let score = 0;
            let snippetKey = kwNoAccent;

            if (kwNoAccent !== '') {
                if (titleNoAccent.includes(kwNoAccent)) score += 120;
                else if (summaryNoAccent.includes(kwNoAccent)) score += 90;
                else if (detailNoAccent.includes(kwNoAccent)) score += 60;
                else if (fullTextNoAccent.includes(kwNoAccent)) score += 50;
            }

            let tokens = filterTokens(tokenizeNoAccent(kwNoAccent));
            if (tokens.length === 0 && kwNoAccent !== '') {
                tokens = tokenizeNoAccent(kwNoAccent);
            }
            if (tokens.length > 0) {
                let matchedTokens = 0;
                tokens.forEach(t => {
                    if (titleNoAccent.includes(t)) {
                        matchedTokens += 1;
                        score += 30;
                    } else if (summaryNoAccent.includes(t)) {
                        matchedTokens += 1;
                        score += 20;
                    } else if (detailNoAccent.includes(t)) {
                        matchedTokens += 1;
                        score += 10;
                    } else if (fullTextNoAccent.includes(t)) {
                        matchedTokens += 1;
                        score += 5;
                    }
                });
                if (matchedTokens > 0 && (snippetKey === '' || !fullTextNoAccent.includes(snippetKey))) {
                    snippetKey = tokens.find(t => fullTextNoAccent.includes(t)) || snippetKey;
                }
            }

            let isKwMatch = kwNoAccent === '' || score > 0;
            
            if (isTagMatch && isKwMatch) { 
                let snippetHtml = "";
                
                if (snippetKey !== '' && n.detail && removeAccents(n.detail.toLowerCase()).includes(snippetKey)) {
                    let snippetText = getSnippet(n.detail, snippetKey);
                    snippetHtml = `<div style="font-size: 0.85rem; color: #555; background: #f1f3f5; padding: 10px; border-radius: 6px; margin-top: 5px; border-left: 3px solid var(--primary-color);"><b>Trích nội dung:</b> <i>${snippetText}</i></div>`;
                } else if (snippetKey !== '' && n.summary && removeAccents(n.summary.toLowerCase()).includes(snippetKey)) {
                    let snippetText = getSnippet(n.summary, snippetKey);
                    snippetHtml = `<div style="font-size: 0.85rem; color: #555; background: #f1f3f5; padding: 10px; border-radius: 6px; margin-top: 5px; border-left: 3px solid #27ae60;"><b>Tóm tắt:</b> <i>${snippetText}</i></div>`;
                } else {
                    snippetHtml = n.tag ? `[${n.tag}] Nhấn xem chi tiết...` : `Nhấn để xem kết quả khớp...`;
                }

                results.push({ 
                    id: n.id, 
                    path: parentPath || 'Mục chính', 
                    title: typeof highlightText === 'function' ? highlightText(n.title, kwRaw) : n.title, 
                    snippet: snippetHtml,
                    score: score
                }); 
            }
            if (n.children) traverse(n.children, curPath);
        }
    } 
    traverse(APP_DATA, "");
    results.sort((a, b) => b.score - a.score);
    
    // NÂNG CẤP 3: HIỂN THỊ KẾT QUẢ GIAO DIỆN MỚI
    if (results.length === 0) {
        resContainer.innerHTML = `
            <div class="no-result">❌ Không tìm thấy.</div>
            <div class="ai-search-prompt">
                <div class="ai-search-title">Không có kết quả trong sổ tay</div>
                <div class="ai-search-desc">Bạn có muốn dùng trợ lý AI để tìm thêm không? (Thông tin có thể nằm ngoài phạm vi tài liệu của sổ tay)</div>
                <div class="ai-search-actions">
                    <button class="btn-mini btn-mini-detail" onclick="handleAiSearchPrompt(true, '${kwRaw.replace(/'/g, "\\'")}')">Có, hỏi AI</button>
                    <button class="btn-mini" onclick="handleAiSearchPrompt(false)">Không, đóng</button>
                </div>
            </div>`;
    } else { 
        let html = `<div style="font-size:0.9rem; color:var(--text-muted); margin-bottom:10px;">Tìm thấy ${results.length} kết quả</div>`; 
        results.forEach(r => {
            html += `<div class="result-item" onclick="jumpToResult('${r.id}')" style="padding:15px; border-bottom:1px solid #eee; cursor:pointer; transition: background 0.2s;">
                        <div class="result-path" style="font-size:0.75rem; color:#888; margin-bottom:4px;">${r.path}</div>
                        <div class="result-title" style="font-weight:bold; color:var(--text-main); margin-bottom:6px;">${r.title}</div>
                        <div class="result-snippet">${r.snippet}</div>
                     </div>`;
        }); 
        resContainer.innerHTML = html; 
    }
    
    if (typeof renderUserInterface === "function") renderUserInterface();
    // Ghi chú: Đã xóa đoạn thongKeRef.set(...) gây lỗi Firebase cũ ở đây
}

        // ==========================================
// GẮN SỰ KIỆN TÌM KIẾM CHO CẢ PC VÀ MOBILE
// ==========================================
const debouncedPerformSearch = debounceOpt(performSearch, 350);

// Quét toàn bộ các ô tìm kiếm trên giao diện (cả ẩn và hiện)
let allSearchBoxes = document.querySelectorAll('#searchInput, .search-input, input[type="search"]');

allSearchBoxes.forEach(box => {
    // 1. Tự động tìm khi đang gõ chữ
    box.addEventListener('input', debouncedPerformSearch);
    
    // 2. Xử lý nút Enter/Tìm kiếm trên bàn phím ảo của điện thoại
    box.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Chặn việc trình duyệt tải lại trang
            performSearch(e);   // Bắt buộc gọi hàm tìm kiếm ngay
            this.blur();        // Tự động thu gọn bàn phím ảo xuống để xem kết quả
        }
    });
});

let tagFilter = document.getElementById('searchTagFilter');
if (tagFilter) {
    tagFilter.addEventListener('change', performSearch);
}
        
        function jumpToResult(id) {
            let nodeToOpen = findNode(id, APP_DATA);
            if (nodeToOpen && openProtectedRouteForNode(nodeToOpen)) {
                closeSearchModal();
                return;
            }
            closeSearchModal(); switchTab('quydinh');
            setTimeout(() => {
                let el = document.getElementById(id);
                if (el) {
                    let parentNode = el.parentElement; 
                    while (parentNode && parentNode.id !== 'dynamicContent') { if (parentNode.classList.contains('step-box')) parentNode.classList.add('active'); parentNode = parentNode.parentElement; }
                    if (el.classList.contains('step-box')) el.classList.add('active');
                    
                    nodeToOpen = findNode(id, APP_DATA); 
                    if(nodeToOpen) { updateBreadcrumb(id); addRecentView(nodeToOpen.id, nodeToOpen.title); setLastRead(nodeToOpen.id, nodeToOpen.title); }
                    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 100, behavior: "smooth" });
                    let oBg = el.style.backgroundColor; el.style.backgroundColor = "rgba(241, 196, 15, 0.2)"; setTimeout(() => el.style.backgroundColor = oBg || '', 2000); 
                }
            }, 100);
        }

        function getParentIdPath(targetId, nodes, path = []) { for(let node of nodes) { if(node.id === targetId) return [...path, node.id]; if(node.children) { let foundPath = getParentIdPath(targetId, node.children, [...path, node.id]); if(foundPath) return foundPath; } } return null; }
        function findNode(id, nodes) { for(let node of nodes) { if(node.id === id) return node; if(node.children) { let f = findNode(id, node.children); if(f) return f; } } return null; }

        function toggleMenu(f) { 
            const sb = document.getElementById('sidebar'); 
            const ov = document.querySelector('.overlay'); 
            if (!sb || !ov) return;
            if (typeof f !== 'undefined') { if(f) { sb.classList.add('active'); ov.classList.add('active'); } else { sb.classList.remove('active'); ov.classList.remove('active'); } } else { sb.classList.toggle('active'); ov.classList.toggle('active'); } 
        }
        
        function showPopup(id) { let nodeData = findNode(id, APP_DATA); if(nodeData && openProtectedRouteForNode(nodeData)) return; if(nodeData && nodeData.detail) { let safeDetail = processLegacyText(nodeData.detail); document.getElementById('noi-dung-chi-tiet').innerHTML = highlightText(safeDetail, lastSearchKeyword); document.getElementById('modalTrichDan').style.display = 'flex'; updateBreadcrumb(id); addRecentView(id, nodeData.title); } }
        function closePopup(id) { document.getElementById(id).style.display = 'none'; }
        function closeModalOnBgClick(e, id) { if(e.target.id === id) closePopup(id); }
        function topFunction() { window.scrollTo({top: 0, behavior: 'smooth'}); }

        let draggedNodeId = null;
        function saveTreeToFirebase(newTree) { 
            if (!db) { alert("Không kết nối được Firebase. Vui lòng kiểm tra mạng hoặc tải lại trang."); return; }
            db.collection("sotay").doc("dulieu").update({ treeData: newTree }).catch(err => alert("Lỗi khi lưu cấu trúc: " + err)); 
        }
        function confirmUnsaved() { if (hasUnsavedChanges) return confirm("⚠️ Bạn có thay đổi chưa lưu! Xác nhận rời đi và HUỶ BỎ những thay đổi vừa nhập?"); return true; }

        function moveNodeUp(e, id) { e.stopPropagation(); if(!confirmUnsaved()) return; let serverTree = JSON.parse(JSON.stringify(APP_DATA)); function process(nodes) { for(let i=0; i<nodes.length; i++) { if(nodes[i].id === id) { if(i > 0) { let temp = nodes[i]; nodes[i] = nodes[i-1]; nodes[i-1] = temp; return true; } return true; } if(nodes[i].children && process(nodes[i].children)) return true; } return false; } if(process(serverTree)) saveTreeToFirebase(serverTree); }
        function moveNodeDown(e, id) { e.stopPropagation(); if(!confirmUnsaved()) return; let serverTree = JSON.parse(JSON.stringify(APP_DATA)); function process(nodes) { for(let i=0; i<nodes.length; i++) { if(nodes[i].id === id) { if(i < nodes.length - 1) { let temp = nodes[i]; nodes[i] = nodes[i+1]; nodes[i+1] = temp; return true; } return true; } if(nodes[i].children && process(nodes[i].children)) return true; } return false; } if(process(serverTree)) saveTreeToFirebase(serverTree); }

        function handleDragStart(e, id) { draggedNodeId = id; e.dataTransfer.effectAllowed = 'move'; e.currentTarget.classList.add('dragging'); }
        function handleDragEnd(e) { e.currentTarget.classList.remove('dragging'); }
        function handleDragOver(e, id) { e.preventDefault(); e.stopPropagation(); if(id === draggedNodeId) return; e.currentTarget.classList.add('drag-over'); }
        function handleDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
        function handleDrop(e, targetId) {
            e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('drag-over');
            if(!draggedNodeId || draggedNodeId === targetId) return; if(!confirmUnsaved()) return;
            if (isDescendant(draggedNodeId, targetId, APP_DATA)) { alert("⛔ Lỗi: Không thể kéo thư mục Cha thả vào bên trong Cấp Con của nó!"); return; }
            let serverTree = JSON.parse(JSON.stringify(APP_DATA)); let nodeToMove = null;
            function removeNode(nodes) { for (let i = 0; i < nodes.length; i++) { if (nodes[i].id === draggedNodeId) { nodeToMove = nodes.splice(i, 1)[0]; return true; } if (nodes[i].children && removeNode(nodes[i].children)) return true; } return false; }
            removeNode(serverTree); if(!nodeToMove) return;
            function addNodeToParent(nodes) { for (let i = 0; i < nodes.length; i++) { if (nodes[i].id === targetId) { if (!nodes[i].children) nodes[i].children = []; nodes[i].children.push(nodeToMove); updateLevels(nodeToMove, nodes[i].level + 1); return true; } if (nodes[i].children && addNodeToParent(nodes[i].children)) return true; } return false; }
            function updateLevels(node, newLevel) { node.level = newLevel; if (node.children) node.children.forEach(c => updateLevels(c, newLevel + 1)); }
            addNodeToParent(serverTree); expandedAdminNodes.add(targetId); saveTreeToFirebase(serverTree);
        }
        function isDescendant(parentId, childId, nodes) { let parentNode = findNode(parentId, nodes); if (!parentNode || !parentNode.children) return false; function check(children) { for (let c of children) { if (c.id === childId) return true; if (c.children && check(c.children)) return true; } return false; } return check(parentNode.children); }

        function saveCurrentNodeToServer() {
            if (!currentEditNodeId) return; const btn = document.getElementById('btnSaveSingle'); btn.innerText = "⏳ Đang lưu..."; btn.disabled = true;
            let sumVal = quillSummary.root.innerHTML; if(sumVal === '<p><br></p>') sumVal = ''; let detVal = quillDetail.root.innerHTML; if(detVal === '<p><br></p>') detVal = '';
            let pdfRefs = []; for(let i=1; i<=5; i++) { let docVal = document.getElementById('inpPdfDoc'+i).value; let pageVal = document.getElementById('inpPdfPage'+i).value; if(docVal && pageVal) pdfRefs.push({ doc: docVal, page: pageVal }); }
            let updatedData = { 
                tag: document.getElementById('inpTag').value, 
                title: document.getElementById('inpTitle').value, 
                summary: sumVal, 
                detail: detVal, 
                fileUrl: document.getElementById('inpFileUrl').value, 
                fileName: document.getElementById('inpFileName').value, 
                pdfRefs: pdfRefs,
                forceAccordion: document.getElementById('inpForceAccordion').checked,
                updatedAt: new Date().toISOString()
            };
            if (!db) { alert("Không kết nối được Firebase. Vui lòng kiểm tra mạng hoặc tải lại trang."); btn.innerText = "LƯU MỤC NÀY"; btn.disabled = false; return; }
            const docRef = db.collection("sotay").doc("dulieu");
            db.runTransaction((transaction) => {
                return transaction.get(docRef).then((doc) => {
                    let serverTree = doc.data().treeData || []; let isFound = false;
                    function updateNode(nodes) { for(let i=0; i<nodes.length; i++) { if(nodes[i].id === currentEditNodeId) { nodes[i] = { ...nodes[i], ...updatedData }; isFound = true; return; } if(nodes[i].children) updateNode(nodes[i].children); } } updateNode(serverTree);
                    if (isFound) { transaction.update(docRef, { treeData: serverTree }); } else { throw "Mục này có thể đã bị xóa!"; }
                });
            }).then(() => { btn.disabled = false; resetSaveButton(); }).catch((err) => { btn.disabled = false; resetSaveButton(); alert("Lỗi đồng bộ: " + err); });
        }

        function addNewRoot() { if(!confirmUnsaved()) return; let newNode = {id: 'r'+Date.now(), title:'PHẦN MỚI TẠO', tag:'', summary:'', detail:'', level:0, children:[]}; const docRef = db.collection("sotay").doc("dulieu"); db.runTransaction((transaction) => { return transaction.get(docRef).then((doc) => { let serverTree = doc.data().treeData || []; serverTree.push(newNode); transaction.update(docRef, { treeData: serverTree }); }); }).then(() => { selectItem(newNode.id); }); }
        function addSubItem() { if(!confirmUnsaved()) return; if(!currentEditNodeId) return; let parentNode = findNode(currentEditNodeId, APP_DATA); if(!parentNode) return; let newNode = {id: 'n'+Date.now(), title:'Mục con mới', tag:'', summary:'', detail:'', level: parentNode.level + 1, children:[]}; expandedAdminNodes.add(currentEditNodeId); const docRef = db.collection("sotay").doc("dulieu"); db.runTransaction((transaction) => { return transaction.get(docRef).then((doc) => { let serverTree = doc.data().treeData || []; function appendChild(nodes) { for(let i=0; i<nodes.length; i++) { if(nodes[i].id === currentEditNodeId) { if(!nodes[i].children) nodes[i].children = []; nodes[i].children.push(newNode); return true; } if(nodes[i].children && appendChild(nodes[i].children)) return true; } return false; } appendChild(serverTree); transaction.update(docRef, { treeData: serverTree }); }); }).then(() => { selectItem(newNode.id); }); }
        function deleteCurrentItem() { if(!currentEditNodeId || !confirm('CẢNH BÁO: Bạn có chắc chắn muốn XÓA mục này? Toàn bộ mục con bên trong cũng sẽ bị xóa vĩnh viễn!')) return; const docRef = db.collection("sotay").doc("dulieu"); db.runTransaction((transaction) => { return transaction.get(docRef).then((doc) => { let serverTree = doc.data().treeData || []; function removeNode(nodes) { let idx = nodes.findIndex(c => c.id === currentEditNodeId); if(idx > -1) { nodes.splice(idx, 1); return true; } for(let i=0; i<nodes.length; i++){ if(nodes[i].children && removeNode(nodes[i].children)) return true; } return false; } removeNode(serverTree); transaction.update(docRef, { treeData: serverTree }); }); }).then(() => { currentEditNodeId = null; hasUnsavedChanges = false; document.getElementById('editorArea').style.display='none'; document.getElementById('editorPlaceholder').style.display='block'; }); }

        function toggleAdminNode(event, id) { event.stopPropagation(); if (expandedAdminNodes.has(id)) expandedAdminNodes.delete(id); else expandedAdminNodes.add(id); renderAdminTree(); }
        function filterAdminTree() {
            let kw = removeAccents(document.getElementById('adminSearchInput').value.toLowerCase()); let nodes = document.querySelectorAll('#adminTree .tree-node');
            if(!kw) { nodes.forEach(n => n.style.display = 'block'); return; }
            nodes.forEach(n => {
                let text = removeAccents(n.innerText.toLowerCase());
                if(text.includes(kw)) { n.style.display = 'block'; let parent = n.parentElement; while(parent && parent.id !== 'adminTree') { if(parent.classList.contains('tree-children')) { parent.classList.remove('collapsed'); parent.parentElement.style.display = 'block'; } parent = parent.parentElement; } } else { n.style.display = 'none'; }
            });
        }
        const debouncedAdminSearch = debounceOpt(filterAdminTree, 350); document.getElementById('adminSearchInput').addEventListener('input', debouncedAdminSearch);

        function renderAdminTree() {
            const tree = document.getElementById('adminTree'); tree.innerHTML = '';
            function buildHtml(nodes) {
                let html = '';
                nodes.forEach(node => {
                    let active = (currentEditNodeId === node.id) ? 'active' : ''; let icon = node.level === 0 ? '📚' : (node.level === 1 ? '📂' : (node.level === 2 ? '📄' : (node.level === 3 ? '📑' : '📝'))); let extraClass = node.level === 0 ? 'root-item' : 'sub-item'; let hasChildren = node.children && node.children.length > 0; let isExpanded = expandedAdminNodes.has(node.id); let toggleBtn = hasChildren ? `<span class="tree-toggle" onclick="toggleAdminNode(event, '${node.id}')">${isExpanded ? '▼' : '▶'}</span>` : `<span style="display:inline-block;width:24px;"></span>`;
                    let btnUpDown = `<div style="margin-left:auto;"><button class="btn-order" onclick="moveNodeUp(event, '${node.id}')" title="Đẩy lên">▲</button><button class="btn-order" onclick="moveNodeDown(event, '${node.id}')" title="Đẩy xuống">▼</button></div>`;
                    html += `<div class="tree-node" id="node-${node.id}"><div class="tree-item ${extraClass} ${active}" draggable="true" ondragstart="handleDragStart(event, '${node.id}')" ondragend="handleDragEnd(event)" ondragover="handleDragOver(event, '${node.id}')" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, '${node.id}')" onclick="selectItem('${node.id}')">${toggleBtn}<span style="margin-right: 5px;">${icon}</span><span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${node.title || 'Chưa đặt tên'}</span>${btnUpDown}</div>`;
                    if(hasChildren) { html += `<div class="tree-children ${isExpanded ? '' : 'collapsed'}">${buildHtml(node.children)}</div>`; } html += `</div>`;
                }); return html;
            } tree.innerHTML = buildHtml(APP_DATA); filterAdminTree();
        }

        function selectItem(id) {
            if (hasUnsavedChanges && currentEditNodeId !== id) { if (!confirm("⚠️ CẢNH BÁO: Bạn đang nhập nội dung nhưng CHƯA LƯU!\n\nBạn có chắc chắn muốn bỏ qua và chuyển sang mục khác không? (Nội dung vừa nhập sẽ bị mất)")) { return; } }
            resetSaveButton(); currentEditNodeId = id; let nodeData = findNode(id, APP_DATA); if(!nodeData) return; renderAdminTree(); 
            document.getElementById('editorPlaceholder').style.display = 'none'; document.getElementById('editorArea').style.display = 'block'; 
            isSystemChangingContent = true;
            document.getElementById('inpTag').value = nodeData.tag || ''; document.getElementById('inpTitle').value = nodeData.title || ''; document.getElementById('inpFileUrl').value = nodeData.fileUrl || ''; document.getElementById('inpFileName').value = nodeData.fileName || '';
            document.getElementById('inpForceAccordion').checked = nodeData.forceAccordion || false;
            let refs = nodeData.pdfRefs || []; if (nodeData.pdfPage && refs.length === 0) refs.push({doc: 'hd02', page: nodeData.pdfPage}); 
            for(let i=1; i<=4; i++) { let docEl = document.getElementById('inpPdfDoc'+i); let pageEl = document.getElementById('inpPdfPage'+i); if (refs[i-1]) { docEl.value = refs[i-1].doc || ''; pageEl.value = refs[i-1].page || ''; } else { docEl.value = ''; pageEl.value = ''; } }
            quillSummary.root.innerHTML = processLegacyText(nodeData.summary || ''); quillDetail.root.innerHTML = processLegacyText(nodeData.detail || '');
            setTimeout(() => { isSystemChangingContent = false; }, 100);
        }

        function processLogin() { 
            let user = document.getElementById('username').value.trim().toLowerCase(); let pass = document.getElementById('password').value; let errBox = document.getElementById('loginError'); 
            let email = user.includes('@') ? user : user + '@sotay.com';
            const btnLogin = document.querySelector('#loginOverlay .btn-login'); btnLogin.innerHTML = "ĐANG KIỂM TRA..."; btnLogin.disabled = true;
            firebase.auth().signInWithEmailAndPassword(email, pass).then((userCredential) => {
                loggedInUser = userCredential.user.email.split('@')[0]; document.getElementById('loginOverlay').style.display = 'none'; document.getElementById('adminPanel').style.display = 'block'; document.getElementById('adminWelcome').innerHTML = `Đang đăng nhập bởi: <b style="text-transform: capitalize;">${loggedInUser}</b>`; renderAdminTree(); btnLogin.innerHTML = "VÀO TRANG QUẢN TRỊ"; btnLogin.disabled = false;
            }).catch((error) => { errBox.style.display = 'block'; document.getElementById('password').value = ''; btnLogin.innerHTML = "VÀO TRANG QUẢN TRỊ"; btnLogin.disabled = false; });
        }
        function openLoginForm() { toggleMenu(false); document.getElementById('loginOverlay').style.display = 'flex'; }
        function closeLoginForm() { document.getElementById('loginOverlay').style.display = 'none'; }
        function closeAdminPanel() { if(!confirmUnsaved()) return; firebase.auth().signOut().then(() => { document.getElementById('adminPanel').style.display = 'none'; loggedInUser = null; }); }
        
        function toggleAccordion(headerEl) {
            let parentGroup = headerEl.parentElement; 
            let isCurrentlyOpen = parentGroup.classList.contains('open');
            let container = parentGroup.parentElement; 
            
            let siblings = container.children;
            for (let i = 0; i < siblings.length; i++) {
                if (siblings[i].classList.contains('list-sub-group')) {
                    siblings[i].classList.remove('open');
                }
            }
            
            if (!isCurrentlyOpen) {
                parentGroup.classList.add('open');
            }
        }
    // --- CHATBOT LOGIC ---
        function centerChatBox() {
            let chatBox = document.getElementById('chatBox');
            if (!chatBox) return;
            chatBox.style.top = '50%';
            chatBox.style.left = '50%';
            chatBox.style.transform = 'translate(-50%, -50%)';
        }

        function toggleChat() {
            let chatBox = document.getElementById('chatBox');
            if (!chatBox) return;
            let isOpen = (chatBox.style.display === 'flex');
            if (isOpen) {
                chatBox.style.display = 'none';
                return;
            }
            centerChatBox();
            chatBox.style.display = 'flex';
            let inputEl = document.getElementById('chatInput');
            if (inputEl) inputEl.focus();
        }

        function openChatBox() {
            let chatBox = document.getElementById('chatBox');
            if (!chatBox) return;
            if (chatBox.style.display !== 'flex') {
                centerChatBox();
                chatBox.style.display = 'flex';
            }
        }

        function renderSafeMarkdown(text) {
            if (!text) return "";
            let escaped = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
            escaped = escaped.replace(/\*(.*?)\*/g, "<i>$1</i>");
            escaped = escaped.replace(/\n/g, "<br>");
            return escaped;
        }

        window.addEventListener('resize', () => {
            let chatBox = document.getElementById('chatBox');
            if (chatBox && chatBox.style.display === 'flex') centerChatBox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            let chatBox = document.getElementById('chatBox');
            if (chatBox && chatBox.style.display === 'flex') chatBox.style.display = 'none';
        });

        async function sendMessage() {
            let inputEl = document.getElementById('chatInput');
            let message = inputEl.value.trim();
            if(!message) return;
            if (isRateLimited('chat', 1200)) return;
			// --- CHÈN DÒNG NÀY VÀO ĐÂY ---
    		recordChatbotUsage(message); 

            let chatBody = document.getElementById('chatBody');
            let typingEl = document.getElementById('typingIndicator');

            // Hiển thị tin nhắn người dùng
            let userDiv = document.createElement('div');
            userDiv.className = 'msg msg-user';
            userDiv.innerText = message;
            chatBody.appendChild(userDiv);
            
            inputEl.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;
            typingEl.style.display = 'block';

            // DÁN URL CỦA GOOGLE APPS SCRIPT Ở BƯỚC 2 VÀO ĐÂY
            const WEB_APP_URL = CONFIG.CHATBOT_WEB_APP_URL;

            try {
                const payload = buildAuthPayload({ message: message });
                let response = await fetch(WEB_APP_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload),
                    redirect: 'follow' // Thêm dòng này để trình duyệt đi theo luồng dữ liệu của Google
                });
                
                let result = await response.json();
                typingEl.style.display = 'none';

                let botDiv = document.createElement('div');
                botDiv.className = 'msg msg-bot';
                
                let replyText = result.reply || result.error || "Xin lỗi, tôi không thể trả lời lúc này.";
                botDiv.innerHTML = renderSafeMarkdown(replyText);
                chatBody.appendChild(botDiv);
                chatBody.scrollTop = chatBody.scrollHeight;

            } catch (error) {
                typingEl.style.display = 'none';
                let botDiv = document.createElement('div');
                botDiv.className = 'msg msg-bot';
                botDiv.innerText = "Tôi đang nghiên cứu câu hỏi của bạn, bạn có thể hỏi tiếp nội dung khác!";
                chatBody.appendChild(botDiv);
            }
        }

        function handleAiSearchPrompt(accept, keyword) {
            if (!accept) {
                closeSearchModal();
                return;
            }
            const kw = (keyword || '').trim();
            if (!kw) return;
            openChatBox();
            const inputEl = document.getElementById('chatInput');
            if (inputEl) inputEl.value = kw;
            closeSearchModal();
            setTimeout(() => { if (typeof sendMessage === 'function') sendMessage(); }, 200);
        }
    // --- CHỨC NĂNG KÉO THẢ VÀ CLICK BONG BÓNG CHAT ---
        const chatWidget = document.getElementById("chatWidget");
        const chatBtn = document.getElementById("chatBtn");

        let isDragging = false;
        let hasDragged = false; // Biến để phân biệt là đang kéo hay đang click
        let currentX = 0, currentY = 0, initialX = 0, initialY = 0, xOffset = 0, yOffset = 0;

        // Bắt sự kiện cho Chuột (Desktop)
        chatBtn.addEventListener("mousedown", dragStart);
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", dragEnd);

        // Bắt sự kiện cho Cảm ứng (Mobile)
        chatBtn.addEventListener("touchstart", dragStart, { passive: false });
        document.addEventListener("touchmove", drag, { passive: false });
        document.addEventListener("touchend", dragEnd);

        function dragStart(e) {
            initialX = e.type === "touchstart" ? e.touches[0].clientX - xOffset : e.clientX - xOffset;
            initialY = e.type === "touchstart" ? e.touches[0].clientY - yOffset : e.clientY - yOffset;
            
            // Chỉ kích hoạt khi bấm/chạm đúng vào bong bóng chat
            if (e.target === chatBtn || chatBtn.contains(e.target)) {
                isDragging = true;
                hasDragged = false; // Reset lại trạng thái
            }
        }

        function drag(e) {
            if (isDragging) {
                let clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
                let clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;

                // Tính toán xem người dùng đã rê chuột/tay đi bao xa
                let dx = clientX - (initialX + xOffset);
                let dy = clientY - (initialY + yOffset);
                
                // Nếu dịch chuyển lớn hơn 3 pixel, hệ thống hiểu là đang "Kéo"
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    hasDragged = true;
                }

                // Nếu đúng là đang kéo thì mới di chuyển Widget
                if (hasDragged) {
                    e.preventDefault(); // Ngăn trình duyệt cuộn trang
                    currentX = clientX - initialX;
                    currentY = clientY - initialY;

                    // Di chuyển toàn bộ cụm Chat
                    chatWidget.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

                    // Giới hạn vùng kéo để không che bottom nav và tránh ra khỏi màn hình
                    const rect = chatWidget.getBoundingClientRect();
                    const padding = 10;
                    const rootStyle = getComputedStyle(document.documentElement);
                    const navHeight = parseFloat(rootStyle.getPropertyValue('--nav-bottom-height')) || 65;
                    const maxBottom = window.innerHeight - navHeight - padding;
                    let adjustX = 0;
                    let adjustY = 0;

                    if (rect.left < padding) adjustX = padding - rect.left;
                    if (rect.right > window.innerWidth - padding) adjustX = (window.innerWidth - padding) - rect.right;
                    if (rect.top < padding) adjustY = padding - rect.top;
                    if (rect.bottom > maxBottom) adjustY = maxBottom - rect.bottom;

                    if (adjustX !== 0 || adjustY !== 0) {
                        currentX += adjustX;
                        currentY += adjustY;
                        chatWidget.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                    }

                    xOffset = currentX;
                    yOffset = currentY;
                }
            }
        }

        function dragEnd(e) {
            if (isDragging) {
                isDragging = false;
                
                // Nếu người dùng nhả chuột ra mà KHÔNG HỀ kéo đi (tức là Click bình thường)
                if (!hasDragged) {
                    toggleChat(); // Mở hoặc đóng cửa sổ chat
                }
            }
        }
    // --- TÍNH NĂNG: CHẠM RA NGOÀI ĐỂ ĐÓNG CỬA SỔ CHAT ---
        document.addEventListener('click', function(event) {
            let chatBox = document.getElementById('chatBox');
            let chatWidget = document.getElementById('chatWidget'); // Khối chứa nút tròn
            
            // Nếu cửa sổ chat đang mở VÀ người dùng bấm ra ngoài cả cửa sổ chat lẫn nút tròn
            if (chatBox.style.display === 'flex' && !chatBox.contains(event.target) && !chatWidget.contains(event.target)) {
                chatBox.style.display = 'none'; // Tự động đóng
            }
        }, true); // Tham số true giúp bắt sự kiện nhạy và chuẩn xác hơn
	// =====================================================================
// =====================================================================
// HỆ THỐNG THỐNG KÊ TỰ ĐỘNG - PHIÊN BẢN NÂNG CẤP TỔNG TRUY CẬP
// =====================================================================
const STATS_WEB_APP_URL = CONFIG.STATS_WEB_APP_URL; 

function recordAndLoadStats(actionType, detail = "") {
    if (!STATS_WEB_APP_URL) return;
    let action = actionType;
    let params = {};

    // Kiểm tra để không ghi nhận 'visit' trùng lặp trong cùng một phiên làm việc
    if (actionType === 'visit') {
        action = sessionStorage.getItem('has_recorded_visit') ? 'none' : 'visit';
    }

    params.action = action;
    if (detail) params.detail = detail;
    let url = buildApiUrl(STATS_WEB_APP_URL, params);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (actionType === 'visit') sessionStorage.setItem('has_recorded_visit', 'true');
            renderDashboard(data);
        })
        .catch(err => {
            console.log("Lỗi thống kê: ", err);
            let dash = document.getElementById('homeDashboard');
            if(dash) dash.innerHTML = "<p style='text-align:center;font-size:0.8rem;'>Tạm thời không tải được thống kê.</p>";
        });
}

function recordSearch(keyword) { recordAndLoadStats('search', keyword); }

function recordChatbotUsage(question) { recordAndLoadStats('chatbot', question); }
		
function renderDashboard(data) {
    let dash = document.getElementById('homeDashboard');
    if (!data || !dash) return;

    // LẤY DỮ LIỆU TỪ BACKEND TRẢ VỀ
    let totalAllTime = data.totalVisits || 0; // Đây chính là con số 1000+ từ Sheets
    let todayVisits = data.today || 0;
    let searchTotal = data.searchCount || 0;
    let chatbotTotal = data.chatbotCount || 0;
    let dailyData = data.daily || [];

    // Xử lý dữ liệu biểu đồ 7 ngày
    let maxDaily = 0;
    let sum7Days = 0;
    dailyData.forEach(d => {
        sum7Days += d.visits;
        if (d.visits > maxDaily) maxDaily = d.visits;
    });

    let chartHtml = '<div class="dashboard-chart"><div class="chart-bars">';
    dailyData.forEach(day => {
        // Tính toán chiều cao cột biểu đồ
        let h = maxDaily > 0 ? (day.visits / maxDaily * 100) : 0; 
        if (h < 5 && day.visits > 0) h = 5;
        
        // Chuyển định dạng ngày YYYY-MM-DD sang DD/MM để hiển thị
        let dParts = day.date.split('-');
        let shortDate = dParts[2] + '/' + dParts[1];

        chartHtml += `
            <div class="chart-bar" style="height:${h}%;">
                <span class="chart-tooltip">${shortDate}: ${day.visits}</span>
            </div>`;
    });
    chartHtml += `</div>
        <div class="chart-labels">
            <span>${dailyData.length > 0 ? dailyData[0].date.split('-').reverse().slice(0,2).join('/') : ''}</span>
            <span>Hôm nay</span>
        </div>
    </div>`;
    
    // Vẽ giao diện Dashboard
    dash.innerHTML = `
        <div class="dashboard-panel">
            <div class="dashboard-eyebrow">TÌNH HÌNH SỬ DỤNG HỆ THỐNG</div>
            <div class="dashboard-title">Thống kê truy cập</div>
            <div class="dashboard-cards">
                <div class="dashboard-card">
                    <div class="card-label">Tổng lượt truy cập</div>
                    <div class="card-value">${totalAllTime.toLocaleString()}</div>
                </div>
                <div class="dashboard-card">
                    <div class="card-label">Hôm nay</div>
                    <div class="card-value">${todayVisits.toLocaleString()}</div>
                </div>
                <div class="dashboard-card">
                    <div class="card-label">7 ngày gần nhất</div>
                    <div class="card-value">${sum7Days.toLocaleString()}</div>
                </div>
                <div class="dashboard-card">
                    <div class="card-label">Lượt tìm kiếm</div>
                    <div class="card-value">${searchTotal.toLocaleString()}</div>
                </div>
                <div class="dashboard-card">
                    <div class="card-label">Trợ lý AI hỗ trợ</div>
                    <div class="card-value">${chatbotTotal.toLocaleString()}</div>
                </div>
            </div>
            ${chartHtml}
        </div>`;
}

// Khởi chạy ghi nhận truy cập khi tải trang
document.addEventListener("DOMContentLoaded", () => {
    recordAndLoadStats('visit');
    fetchLatestNotice();
    renderFavorites();
    renderContinueReading();
    setReadMode(localStorage.getItem('sotay_read_mode') === '1');
    // Giữ mặc định ở Trang chủ khi mở trang
});
    // =====================================================================
// HỆ THỐNG KHẢO SÁT & GÓP Ý (PHƯƠNG THỨC GET CHỐNG LỖI)
// =====================================================================
const SURVEY_WEB_APP_URL = CONFIG.SURVEY_WEB_APP_URL;

// 1. Hàm gửi mức độ hài lòng (Rất hài lòng / Hài lòng)
function submitSurvey(level) {
    if (!SURVEY_WEB_APP_URL) return;
    if (isRateLimited('survey', 1500)) return;
    
    // Hiển thị thông báo đang xử lý để người dùng không bấm nhiều lần
    const btnContainer = event.target.parentElement;
    const originalContent = btnContainer.innerHTML;
    btnContainer.innerHTML = "<p style='color:var(--primary-color)'>Đang gửi đánh giá...</p>";

    let url = buildApiUrl(SURVEY_WEB_APP_URL, { action: 'survey', content: level });

    fetch(url)
        .then(response => response.json())
        .then(data => {
            btnContainer.innerHTML = "<p style='color:green; font-weight:bold;'>Cảm ơn đồng chí đã đánh giá " + level + "!</p>";
            // Sau 3 giây đóng khung khảo sát
            setTimeout(() => { closeSurvey(); btnContainer.innerHTML = originalContent; }, 3000);
        })
        .catch(err => {
            console.error("Lỗi khảo sát:", err);
            btnContainer.innerHTML = originalContent;
            alert("Có lỗi xảy ra, đồng chí vui lòng thử lại sau.");
        });
}

// 2. Hàm gửi nội dung góp ý bổ sung
function submitFeedback() {
    let fbContent = document.getElementById('feedbackContent').value.trim();
    if (!fbContent) {
        alert("Vui lòng nhập nội dung góp ý!");
        return;
    }
    if (isRateLimited('survey', 1500)) return;

    const btnSubmit = document.querySelector('.btn-submit-feedback');
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Đang gửi...";

    let url = buildApiUrl(SURVEY_WEB_APP_URL, { action: 'feedback', content: fbContent });

    fetch(url)
        .then(response => response.json())
        .then(data => {
            alert("Cảm ơn đồng chí đã đóng góp ý kiến!");
            document.getElementById('feedbackContent').value = ""; // Xóa nội dung đã nhập
            closeSurvey(); // Đóng form
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Gửi góp ý";
        })
        .catch(err => {
            alert("Lỗi kết nối hệ thống.");
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Gửi góp ý";
        });
}
// Hàm đóng bảng khảo sát thủ công khi bấm nút X
function closeSurveyAuto() {
    let overlay = document.getElementById('autoSurveyOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    } else {
        console.log("Lỗi: Không tìm thấy khung khảo sát để đóng");
    }
}
// ==============================================================
// BỔ SUNG: XỬ LÝ BÀN PHÍM ẢO CHO GIAO DIỆN ĐIỆN THOẠI
// ==============================================================
document.addEventListener('DOMContentLoaded', function() {
    // 1. Bắt phím Enter cho ô tìm kiếm ngoài Trang chủ
    let homeInput = document.getElementById('homeSearchInput');
    if (homeInput) {
        homeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Chặn tải lại trang
                if (typeof quickHomeSearch === 'function') quickHomeSearch(); 
                this.blur();        // Tự động thu gọn bàn phím ảo xuống để lộ kết quả
            }
        });
    }

    // 2. Bắt phím Enter cho ô tìm kiếm nhỏ trong cửa sổ (Modal)
    let modalInput = document.getElementById('searchInput');
    if (modalInput) {
        modalInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (typeof performSearch === 'function') performSearch();
                this.blur(); // Tự động thu gọn bàn phím ảo
            }
        });
    }

    let protectedUserInput = document.getElementById('protectedAccessUsername');
    let protectedPassInput = document.getElementById('protectedAccessPassword');
    [protectedUserInput, protectedPassInput].forEach(el => {
        if (!el) return;
        el.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitProtectedAccessLogin();
            }
        });
    });
});
