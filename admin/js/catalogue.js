// ─── Service Catalogue ─────────────────────────────────────────────────────

let catalogue = {
    'Web & Design': [
        { id: 'wd1', name: 'Website Design (5 pages)', price: 25000, unit: 'project', tag: 'project' },
        { id: 'wd2', name: 'Landing Page', price: 8000, unit: 'project', tag: 'project' },
        { id: 'wd3', name: 'UI/UX Design', price: 18000, unit: 'project', tag: 'project' },
        { id: 'wd4', name: 'Logo & Branding', price: 10000, unit: 'project', tag: 'project' },
    ],
    'Development': [
        { id: 'dev1', name: 'HRMS Implementation', price: 75000, unit: 'project', tag: 'project' },
        { id: 'dev2', name: 'Custom Web App', price: 60000, unit: 'project', tag: 'project' },
        { id: 'dev3', name: 'E-commerce Store', price: 45000, unit: 'project', tag: 'project' },
        { id: 'dev4', name: 'API Integration', price: 15000, unit: 'project', tag: 'project' },
    ],
    'Monthly Retainers': [
        { id: 'mr1', name: 'Website Maintenance', price: 5000, unit: '/month', tag: 'retainer' },
        { id: 'mr2', name: 'Social Media Mgmt', price: 8000, unit: '/month', tag: 'retainer' },
        { id: 'mr3', name: 'SEO Package', price: 10000, unit: '/month', tag: 'retainer' },
        { id: 'mr4', name: 'Support & AMC', price: 4000, unit: '/month', tag: 'retainer' },
    ],
    'Add-ons': [
        { id: 'ao1', name: 'Domain + Hosting (1yr)', price: 3500, unit: 'flat', tag: 'addon' },
        { id: 'ao2', name: 'SSL Certificate', price: 1500, unit: 'flat', tag: 'addon' },
        { id: 'ao3', name: 'Content Writing (5 pages)', price: 4000, unit: 'flat', tag: 'addon' },
        { id: 'ao4', name: 'Google Ads Setup', price: 6000, unit: 'flat', tag: 'addon' },
    ],
};

let qqItems = [];    // selected items in Quick Quote
let qqStatus = 'draft';
const TAG_COLORS = {
    project:  { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa' },
    retainer: { bg: 'rgba(16,185,129,0.15)',  color: '#34d399' },
    addon:    { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24' },
};

function fmt(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
}

function inQQ(id) {
    return qqItems.some(q => q.id === id);
}

// ─── Render Catalogue ───────────────────────────────────────────────────────
function renderCatalogue(filter = '') {
    const root = document.getElementById('catalogue-groups');
    if (!root) return;

    const lower = filter.toLowerCase();
    let html = '';

    for (const [cat, items] of Object.entries(catalogue)) {
        const visible = items.filter(s => !lower || s.name.toLowerCase().includes(lower) || cat.toLowerCase().includes(lower));
        if (!visible.length) continue;

        html += `
        <div style="margin-bottom:2rem;">
            <div style="font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.75rem; padding-bottom:0.5rem; border-bottom:1px solid var(--border);">${cat}</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
                ${visible.map(s => {
                    const selected = inQQ(s.id);
                    const tc = TAG_COLORS[s.tag];
                    return `
                    <div class="cat-svc-row${selected ? ' cat-selected' : ''}" id="svc-row-${s.id}">
                        <div class="cat-checkbox${selected ? ' cat-checkbox-on' : ''}" onclick="toggleQQ('${s.id}')">
                            ${selected ? `<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ''}
                        </div>
                        <div style="flex:1; cursor:pointer;" onclick="toggleQQ('${s.id}')">
                            <div style="font-size:0.9rem; font-weight:${selected ? '600' : '500'}; color:${selected ? 'var(--primary)' : 'var(--text-main)'};">${s.name}</div>
                            <div style="display:flex; align-items:center; gap:8px; margin-top:3px;">
                                <span style="font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:20px; background:${tc.bg}; color:${tc.color};">${s.tag}</span>
                                <span style="font-size:0.75rem; color:var(--text-muted);">${s.unit}</span>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:8px; padding:4px 8px;" onclick="event.stopPropagation()">
                            <span style="font-size:0.8rem; color:var(--text-muted); margin-right:3px;">₹</span>
                            <input
                                type="number"
                                class="cat-price-input"
                                value="${s.price}"
                                oninput="updateCatPrice('${s.id}', this.value)"
                                onchange="updateCatPrice('${s.id}', this.value)"
                            />
                        </div>
                    </div>`;
                }).join('')}
                <button onclick="openCatModal('${cat}')" style="margin-top:4px; background:transparent; border:1px dashed var(--border); color:var(--text-muted); border-radius:10px; padding:8px 14px; font-size:0.8rem; cursor:pointer; text-align:left; font-family:'Inter',sans-serif; transition:0.2s;" onmouseover="this.style.borderColor='var(--primary)'; this.style.color='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'; this.style.color='var(--text-muted)'">
                    + Add to ${cat}
                </button>
            </div>
        </div>`;
    }

    root.innerHTML = html || `<div style="color:var(--text-muted); padding:2rem; text-align:center;">No services found for "${filter}"</div>`;
}

// ─── Toggle in Quick Quote ──────────────────────────────────────────────────
window.toggleQQ = function(id) {
    if (inQQ(id)) {
        qqItems = qqItems.filter(q => q.id !== id);
    } else {
        for (const [cat, items] of Object.entries(catalogue)) {
            const item = items.find(s => s.id === id);
            if (item) { qqItems.push({ ...item, cat }); break; }
        }
    }
    renderCatalogue(document.getElementById('cat-search')?.value || '');
    renderQQ();
};

// ─── Update price inline ────────────────────────────────────────────────────
window.updateCatPrice = function(id, val) {
    const price = parseInt(val) || 0;
    for (const items of Object.values(catalogue)) {
        const item = items.find(s => s.id === id);
        if (item) { item.price = price; break; }
    }
    const qi = qqItems.find(q => q.id === id);
    if (qi) qi.price = price;
    renderQQ();
};

// ─── Render Quick Quote ─────────────────────────────────────────────────────
function renderQQ() {
    const itemsEl = document.getElementById('qq-items');
    const emptyEl = document.getElementById('qq-empty');
    const totalEl = document.getElementById('qq-total');
    const countEl = document.getElementById('qq-count');
    if (!itemsEl) return;

    const total = qqItems.reduce((s, q) => s + (q.price || 0), 0);
    totalEl.textContent = fmt(total);
    countEl.textContent = qqItems.length + ' service' + (qqItems.length !== 1 ? 's' : '');

    if (!qqItems.length) {
        emptyEl.style.display = 'block';
        itemsEl.innerHTML = '';
        return;
    }
    emptyEl.style.display = 'none';
    itemsEl.innerHTML = qqItems.map(q => `
        <div style="display:flex; align-items:flex-start; gap:10px; padding:10px 0; border-bottom:1px solid var(--border);">
            <div style="flex:1;">
                <div style="font-size:0.85rem; font-weight:600;">${q.name}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${q.cat} · ${q.unit}</div>
            </div>
            <div style="font-size:0.9rem; font-weight:700; color:var(--primary); white-space:nowrap;">${fmt(q.price)}</div>
            <button onclick="toggleQQ('${q.id}')" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; padding:0 2px; line-height:1;" title="Remove">✕</button>
        </div>
    `).join('');
}

// ─── Status chips ───────────────────────────────────────────────────────────
window.setQQStatus = function(el) {
    document.querySelectorAll('.status-pill').forEach(p => p.classList.remove('active-pill'));
    el.classList.add('active-pill');
    qqStatus = el.dataset.status;
};

// ─── Send to Quotation ──────────────────────────────────────────────────────
window.sendToQuotation = function() {
    const client  = document.getElementById('qq-client')?.value.trim();
    const project = document.getElementById('qq-project')?.value.trim();
    if (!qqItems.length)   { showCatToast('Add at least one service first'); return; }
    if (!client)           { showCatToast('Enter a client name'); document.getElementById('qq-client').focus(); return; }

    // Switch to Business Suite view and pre-fill it
    if (typeof switchView === 'function') {
        switchView('suite');
    }

    // Pre-fill client & subject
    const clientInput = document.getElementById('doc-client');
    const subjectInput = document.getElementById('doc-subject');
    if (clientInput)  clientInput.value = client;
    if (subjectInput) subjectInput.value = project || qqItems.map(i => i.name).join(', ');

    // Pre-fill line items using existing admin-app.js state
    if (typeof activeItems !== 'undefined' && typeof initLineItems === 'function') {
        activeItems.length = 0;
        qqItems.forEach(q => activeItems.push({ desc: q.name, qty: 1, rate: q.price }));
        initLineItems();
        if (typeof renderLive === 'function') renderLive();
    }

    showCatToast(`Quote for ${client} loaded into Business Suite ✓`);
};

window.clearQQ = function() {
    qqItems = [];
    document.getElementById('qq-client').value = '';
    document.getElementById('qq-project').value = '';
    document.querySelectorAll('.status-pill').forEach(p => p.classList.remove('active-pill'));
    document.querySelector('[data-status="draft"]')?.classList.add('active-pill');
    qqStatus = 'draft';
    renderCatalogue(document.getElementById('cat-search')?.value || '');
    renderQQ();
};

window.clearQQ = function() {
    qqItems = [];
    document.getElementById('qq-client').value = '';
    document.getElementById('qq-project').value = '';
    document.querySelectorAll('.status-pill').forEach(p => p.classList.remove('active-pill'));
    document.querySelector('[data-status="draft"]')?.classList.add('active-pill');
    qqStatus = 'draft';
    renderCatalogue(document.getElementById('cat-search')?.value || '');
    renderQQ();
};

window.filterCatalogue = function() {
    renderCatalogue(document.getElementById('cat-search').value);
};

// ─── Modal ──────────────────────────────────────────────────────────────────
window.openCatModal = function(cat) {
    const modal = document.getElementById('cat-modal');
    if (cat) {
        const sel = document.getElementById('new-svc-cat');
        const opt = [...sel.options].find(o => o.value === cat);
        if (opt) sel.value = cat;
    }
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('new-svc-name').focus(), 50);
};

window.closeCatModal = function() {
    document.getElementById('cat-modal').style.display = 'none';
    document.getElementById('new-svc-name').value = '';
    document.getElementById('new-svc-price').value = '';
};

window.saveNewService = function() {
    const name  = document.getElementById('new-svc-name').value.trim();
    const cat   = document.getElementById('new-svc-cat').value;
    const price = parseInt(document.getElementById('new-svc-price').value) || 0;
    const tag   = document.getElementById('new-svc-tag').value;
    const unit  = tag === 'retainer' ? '/month' : tag === 'addon' ? 'flat' : 'project';
    if (!name) { showCatToast('Enter a service name'); return; }
    const id = 'custom-' + Date.now();
    if (!catalogue[cat]) catalogue[cat] = [];
    catalogue[cat].push({ id, name, price, unit, tag });
    closeCatModal();
    renderCatalogue(document.getElementById('cat-search')?.value || '');
    showCatToast(`"${name}" added to ${cat}`);
};

// ─── Toast ──────────────────────────────────────────────────────────────────
function showCatToast(msg) {
    let t = document.getElementById('cat-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'cat-toast';
        t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#10b981;color:#fff;padding:12px 18px;border-radius:10px;font-size:0.85rem;font-weight:600;transform:translateY(80px);opacity:0;transition:all .25s;z-index:9999;pointer-events:none;';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.transform = 'translateY(0)';
    t.style.opacity = '1';
    setTimeout(() => { t.style.transform = 'translateY(80px)'; t.style.opacity = '0'; }, 2800);
}

// ─── Init on view switch ────────────────────────────────────────────────────
document.addEventListener('viewChanged', (e) => {
    if (e.detail.view === 'catalogue') {
        renderCatalogue();
        renderQQ();
    }
});

// Auto-init if catalogue is first active
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are already on the catalogue view
    if (document.getElementById('view-catalogue')?.classList.contains('active')) {
        renderCatalogue();
        renderQQ();
    }
});
