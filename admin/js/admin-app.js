import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_CONFIG } from './config.js';

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: { persistSession: true, storage: window.sessionStorage, autoRefreshToken: true }
});

// --- State ---
let activeItems = [];
const company = {
    name: 'Softsync Solutions',
    address: 'Pushpak Nagar, Karanjade, 410206',
    email: 'rohith@softsyncsolutions.in',
    phone: '7259956572',
    director: 'Rohith P.M.'
};

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = 'admin-login.html'; return; }

    document.getElementById('app-layout').style.display = 'flex';
    const today = new Date();
    document.getElementById('doc-date').valueAsDate = today;
    updateDueDate();
    initLineItems();
    renderLive();
    loadHistory();
    renderCatalogue();
    renderQQ();
});

// --- Navigation ---
window.switchView = (viewName) => {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
    if (viewName === 'catalogue') { renderCatalogue(); renderQQ(); }
};

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => { e.preventDefault(); switchView(item.dataset.view); });
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'admin-login.html';
});

window.updateUI = () => {
    const mode = document.getElementById('suite-mode').value;
    const preview = document.getElementById('document-preview');
    const itemsEditor = document.getElementById('items-editor');
    const proposalEditor = document.getElementById('proposal-editor');
    itemsEditor.style.display = 'none';
    proposalEditor.style.display = 'none';
    if (mode === 'letterhead')      { preview.className = 'a4-page theme-cyan'; }
    else if (mode === 'proposal')   { proposalEditor.style.display = 'block'; preview.className = 'a4-page theme-cyan'; }
    else if (mode === 'quotation')  { itemsEditor.style.display = 'block'; preview.className = 'a4-page theme-cyan'; }
    else if (mode === 'invoice')    { itemsEditor.style.display = 'block'; preview.className = 'a4-page theme-indigo'; }
    renderLive();
};

// --- Items ---
function initLineItems() {
    const container = document.getElementById('line-items-container');
    container.innerHTML = activeItems.map((item, idx) => `
        <div class="item-row" data-index="${idx}">
            <div class="form-group"><input type="text" class="form-input item-desc" value="${item.desc}" oninput="updateItem(${idx}, 'desc', this.value)"></div>
            <div class="form-group"><input type="number" class="form-input item-qty" value="${item.qty}" oninput="updateItem(${idx}, 'qty', this.value)"></div>
            <div class="form-group"><input type="number" class="form-input item-rate" value="${item.rate}" oninput="updateItem(${idx}, 'rate', this.value)"></div>
            <button class="btn btn-ghost" onclick="removeItem(${idx})" style="color:var(--danger); border:none; padding:10px;">&times;</button>
        </div>
    `).join('');
}

window.addLineItem = () => { activeItems.push({ desc: 'New Service Item', qty: 1, rate: 0 }); initLineItems(); renderLive(); };
window.removeItem  = (idx) => { activeItems.splice(idx, 1); initLineItems(); renderLive(); };
window.updateItem  = (idx, field, val) => { activeItems[idx][field] = field === 'desc' ? val : parseFloat(val) || 0; renderLive(); };

window.updateDueDate = () => {
    const docDate = new Date(document.getElementById('doc-date').value);
    if (!isNaN(docDate)) {
        const dueDate = new Date(docDate);
        dueDate.setDate(dueDate.getDate() + 14);
        document.getElementById('doc-due-date').valueAsDate = dueDate;
        renderLive();
    }
};

// --- Rendering Engine ---
window.renderLive = () => {
    const mode      = document.getElementById('suite-mode').value;
    const client    = document.getElementById('doc-client').value || '---';
    const subject   = document.getElementById('doc-subject').value || '---';
    const rawDate   = new Date(document.getElementById('doc-date').value);
    const dateStr   = !isNaN(rawDate) ? rawDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '---';
    const rawDue    = new Date(document.getElementById('doc-due-date').value);
    const validStr  = !isNaN(rawDue) ? rawDue.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '---';
    const docId     = !isNaN(rawDate) ? `SS-${rawDate.getFullYear()}-${(rawDate.getMonth()+1).toString().padStart(2,'0')}${rawDate.getDate()}-01` : 'SS-XXXX-XXXX-01';
    const title     = mode === 'quotation' ? 'Quotation' : (mode === 'invoice' ? 'Tax Invoice' : (mode === 'proposal' ? 'Project Proposal' : 'Letterhead'));

    let subtotal = 0;
    const itemsHtml = activeItems.map((item, idx) => {
        const lineTotal = item.qty * item.rate; subtotal += lineTotal;
        return `<tr><td style="color:#94a3b8;width:40px;">${idx+1}.</td><td>${item.desc}</td><td style="text-align:center;">${item.qty}</td><td style="text-align:right;">₹${item.rate.toLocaleString()}</td><td style="text-align:right;font-weight:700;">₹${lineTotal.toLocaleString()}</td></tr>`;
    }).join('');

    let bodyHtml = '';
    if (mode === 'proposal') {
        const scope=document.getElementById('p-scope').value, deliverables=document.getElementById('p-deliverables').value,
              cost=document.getElementById('p-cost').value, timeline=document.getElementById('p-timeline').value,
              payment=document.getElementById('p-payment').value, notes=document.getElementById('p-notes').value;
        bodyHtml = `<div style="margin-top:1rem;">
            <h4 style="color:var(--doc-accent);font-family:'Outfit',sans-serif;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:6px;">1. Scope of Work</h4>
            <p style="font-size:0.8rem;color:#444;line-height:1.6;margin-bottom:1.5rem;">${scope.replace(/\n/g,'<br>')||'---'}</p>
            <h4 style="color:var(--doc-accent);font-family:'Outfit',sans-serif;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:6px;">2. Deliverables</h4>
            <p style="font-size:0.8rem;color:#444;line-height:1.6;margin-bottom:1.5rem;">${deliverables.replace(/\n/g,'<br>')||'---'}</p>
            <h4 style="color:var(--doc-accent);font-family:'Outfit',sans-serif;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:6px;">3. Project Cost</h4>
            <p style="font-size:1.2rem;font-weight:700;color:#1a1a2e;margin-bottom:1.5rem;">₹${parseFloat(cost||0).toLocaleString()}</p>
            <h4 style="color:var(--doc-accent);font-family:'Outfit',sans-serif;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:6px;">4. Timeline</h4>
            <p style="font-size:0.8rem;color:#444;line-height:1.6;margin-bottom:1.5rem;">${timeline||'---'}</p>
            <h4 style="color:var(--doc-accent);font-family:'Outfit',sans-serif;text-transform:uppercase;font-size:0.75rem;letter-spacing:0.05em;margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:6px;">5. Payment Terms</h4>
            <p style="font-size:0.8rem;color:#444;line-height:1.6;">${payment.replace(/\n/g,'<br>')||'---'}</p>
            ${notes?`<div style="margin-top:2rem;padding:1rem;background:#f8fafc;border-left:3px solid var(--doc-accent);font-size:0.8rem;color:#64748b;">${notes}</div>`:''}
        </div>`;
    } else if (mode !== 'letterhead') {
        bodyHtml = `
            <table class="doc-table">
                <thead><tr><th>No.</th><th style="text-align:left;">Description</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Amount</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div class="total-box-container"><div class="total-box"><span class="label">Total (INR)</span><span class="amount">₹${subtotal.toLocaleString()}</span></div></div>
            <div style="margin-top:2rem;">
                <h4 style="font-size:0.7rem;text-transform:uppercase;color:#94a3b8;margin-bottom:6px;">Terms & Conditions</h4>
                <p style="font-size:0.7rem;color:#64748b;line-height:1.6;">• Quoted prices are final and all-inclusive. No additional taxes will be levied.<br>• Validity of this quotation is 21 days.<br>• Project kickoff only after advance payment.</p>
            </div>`;
    }

    let headerHtml = '';
    if (mode === 'letterhead') {
        headerHtml = `
            <div class="doc-header-minimal">
                <img src="assets/images/logo-s.png" style="height:60px;margin-bottom:1rem;">
                <div class="company-meta"><span>${company.address}</span><span>${company.email}</span><span>${company.phone}</span></div>
            </div>
            <div style="margin-bottom:3rem;display:flex;justify-content:space-between;align-items:flex-end;">
                <div><h4 style="font-size:0.7rem;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;">To</h4><strong style="font-size:1.1rem;">${client}</strong></div>
                <div style="text-align:right;"><p style="font-size:0.8rem;color:#64748b;">Date: <strong>${dateStr}</strong></p></div>
            </div>`;
    } else if (mode === 'proposal') {
        headerHtml = `
            <div class="doc-proposal-header">
                <div class="doc-proposal-title">Project Proposal</div>
                <div style="font-size:1.5rem;color:#64748b;font-weight:300;margin-bottom:4rem;">${subject}</div>
                <div class="doc-proposal-meta">
                    <div class="meta-item"><h4>Prepared For</h4><strong style="font-size:1.1rem;">${client}</strong></div>
                    <div class="meta-item"><h4>Prepared By</h4><strong style="font-size:1.1rem;">${company.name}</strong></div>
                    <div class="meta-item"><h4>Date Published</h4><strong style="font-size:1.1rem;">${dateStr}</strong></div>
                </div>
            </div>`;
    } else {
        headerHtml = `
            <div style="display:flex;justify-content:flex-end;align-items:flex-start;margin-bottom:3rem;">
                <div class="doc-title-block"><h1>${title}</h1></div>
            </div>
            <div class="doc-header-grid">
                <div class="doc-column">
                    <h4>${title} From</h4><strong>${company.name}</strong>
                    <p>${company.address.split(',').slice(0,2).join(', ')}</p>
                    <p>${company.address.split(',').slice(2).join(', ')}</p>
                    <p style="margin-top:8px;">Email: <strong>${company.email}</strong></p>
                    <p>Phone: <strong>${company.phone}</strong></p>
                </div>
                <div class="doc-column">
                    <h4>${title} For</h4><strong>${client}</strong>
                    <p style="white-space:pre-wrap;">${document.getElementById('doc-client-address').value||'---'}</p>
                    <p style="margin-top:8px;">Phone: <strong>${document.getElementById('doc-client-phone').value||'---'}</strong></p>
                </div>
                <div class="doc-column" style="text-align:left;">
                    <h4>Details</h4>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.8rem;">
                        <span style="color:#666;">${title} No</span><strong style="text-align:right;">A0000${docId.slice(-1)}</strong>
                        <span style="color:#666;">${title} Date</span><strong style="text-align:right;">${dateStr}</strong>
                        <span style="color:#666;">Valid Till Date</span><strong style="text-align:right;">${validStr}</strong>
                    </div>
                </div>
            </div>
            <div style="margin-bottom:1.5rem;border-top:1px solid #f2f2f2;padding-top:1.5rem;">
                <p style="font-size:0.85rem;color:#333;line-height:1.4;">${subject.replace(/\n/g,'<br>')}</p>
            </div>`;
    }

    document.getElementById('document-preview').innerHTML = `
        <div class="branding-bar-top"></div>
        <div class="doc-content">
            ${headerHtml}${bodyHtml}
            <div class="signature-block" style="text-align:right;margin-top:4rem;width:100%;">
                <p class="signature" style="font-family:'Great Vibes',cursive;font-size:2.2rem;margin-bottom:0;">${company.director}</p>
                <div style="width:180px;height:1px;background:#e2e8f0;margin:5px 0 5px auto;"></div>
                <p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;">Director, Softsync</p>
            </div>
        </div>
        <div class="branding-bar-footer">
            <div class="footer-content"><span>WWW.SOFTSYNCSOLUTIONS.IN</span><span>TRUSTED PARTNER IN DIGITAL TRANSFORMATION</span></div>
        </div>`;
};

// --- Sync & History ---
window.saveDocument = async () => {
    const mode = document.getElementById('suite-mode').value;
    const client = document.getElementById('doc-client').value;
    const subject = document.getElementById('doc-subject').value;
    const amount = mode === 'proposal' ? parseFloat(document.getElementById('p-cost').value||0) : activeItems.reduce((acc,item)=>acc+(item.qty*item.rate),0);
    let table = mode==='invoice' ? 'invoices' : (mode==='proposal' ? 'proposals' : 'quotes');
    const payload = { client_name: client, created_at: new Date().toISOString() };
    if (mode==='proposal') {
        Object.assign(payload,{project_title:subject,scope_of_work:document.getElementById('p-scope').value,deliverables:document.getElementById('p-deliverables').value,project_cost:amount,timeline:document.getElementById('p-timeline').value,payment_terms:document.getElementById('p-payment').value,notes:document.getElementById('p-notes').value});
    } else {
        payload.service=subject; payload.items=activeItems;
        if(mode==='invoice'){payload.amount=amount;payload.status='Pending';}else{payload.price=amount;}
    }
    const { error } = await supabase.from(table).insert([payload]);
    if (error) alert("Sync Error: "+error.message);
    else { alert("Synced to Cloud!"); loadHistory(); }
};

async function loadHistory() {
    const {data:q}=await supabase.from('quotes').select('*').order('created_at',{ascending:false}).limit(3);
    const {data:i}=await supabase.from('invoices').select('*').order('created_at',{ascending:false}).limit(3);
    const {data:p}=await supabase.from('proposals').select('*').order('created_at',{ascending:false}).limit(3);
    document.getElementById('history-list').innerHTML=[...(q||[]).map(x=>({...x,t:'Quote',v:x.price})),...(i||[]).map(x=>({...x,t:'Invoice',v:x.amount})),...(p||[]).map(x=>({...x,t:'Proposal',v:x.project_cost}))]
        .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))
        .map(d=>`<tr><td><span class="badge">${d.t}</span></td><td style="font-weight:600;">${d.client_name}</td><td>₹${(d.v||0).toLocaleString()}</td><td style="color:#94a3b8;">${new Date(d.created_at).toLocaleDateString()}</td><td><button class="btn btn-ghost" style="padding:4px 10px;font-size:0.7rem">View</button></td></tr>`).join('');
}

// ═══════════════════════════════════════════════════════════════
// SERVICE CATALOGUE
// ═══════════════════════════════════════════════════════════════

let catalogue = {
    'Web & Design': [
        { id:'wd1', name:'Website Design (5 pages)', price:25000, unit:'project', tag:'project' },
        { id:'wd2', name:'Landing Page',             price:8000,  unit:'project', tag:'project' },
        { id:'wd3', name:'UI/UX Design',             price:18000, unit:'project', tag:'project' },
        { id:'wd4', name:'Logo & Branding',          price:10000, unit:'project', tag:'project' },
    ],
    'Development': [
        { id:'dev1', name:'HRMS Implementation', price:75000, unit:'project', tag:'project' },
        { id:'dev2', name:'Custom Web App',      price:60000, unit:'project', tag:'project' },
        { id:'dev3', name:'E-commerce Store',    price:45000, unit:'project', tag:'project' },
        { id:'dev4', name:'API Integration',     price:15000, unit:'project', tag:'project' },
    ],
    'Monthly Retainers': [
        { id:'mr1', name:'Website Maintenance', price:5000,  unit:'/month', tag:'retainer' },
        { id:'mr2', name:'Social Media Mgmt',   price:8000,  unit:'/month', tag:'retainer' },
        { id:'mr3', name:'SEO Package',         price:10000, unit:'/month', tag:'retainer' },
        { id:'mr4', name:'Support & AMC',       price:4000,  unit:'/month', tag:'retainer' },
    ],
    'Add-ons': [
        { id:'ao1', name:'Domain + Hosting (1yr)',      price:3500, unit:'flat', tag:'addon' },
        { id:'ao2', name:'SSL Certificate',             price:1500, unit:'flat', tag:'addon' },
        { id:'ao3', name:'Content Writing (5 pages)',   price:4000, unit:'flat', tag:'addon' },
        { id:'ao4', name:'Google Ads Setup',            price:6000, unit:'flat', tag:'addon' },
    ],
};

let qqItems  = [];
let qqStatus = 'draft';
const TAG_COLORS = {
    project:  { bg:'rgba(124,58,237,0.2)',  color:'#a78bfa' },
    retainer: { bg:'rgba(16,185,129,0.2)',  color:'#34d399' },
    addon:    { bg:'rgba(245,158,11,0.2)',  color:'#fbbf24' },
};

function fmtINR(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
function inQQ(id)  { return qqItems.some(q => q.id === id); }

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
            <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
                        color:var(--text-muted);margin-bottom:0.75rem;padding-bottom:0.5rem;
                        border-bottom:1px solid var(--border);">${cat}</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
                ${visible.map(s => {
                    const sel = inQQ(s.id);
                    const tc  = TAG_COLORS[s.tag];
                    return `
                    <div style="display:flex;align-items:center;gap:12px;
                                background:${sel?'rgba(16,185,129,0.05)':'var(--card-bg)'};
                                border:1px solid ${sel?'rgba(16,185,129,0.4)':'var(--border)'};
                                border-radius:12px;padding:12px 14px;transition:border-color 0.2s;">
                        <div onclick="toggleQQ('${s.id}')"
                             style="width:18px;height:18px;border-radius:5px;cursor:pointer;flex-shrink:0;
                                    display:flex;align-items:center;justify-content:center;transition:all 0.15s;
                                    background:${sel?'var(--primary)':'transparent'};
                                    border:1.5px solid ${sel?'var(--primary)':'var(--border)'};">
                            ${sel?`<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`:''}
                        </div>
                        <div style="flex:1;cursor:pointer;" onclick="toggleQQ('${s.id}')">
                            <div style="font-size:0.9rem;font-weight:${sel?'600':'500'};color:${sel?'var(--primary)':'var(--text-main)'};">${s.name}</div>
                            <div style="display:flex;align-items:center;gap:8px;margin-top:3px;">
                                <span style="font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:20px;background:${tc.bg};color:${tc.color};">${s.tag}</span>
                                <span style="font-size:0.75rem;color:var(--text-muted);">${s.unit}</span>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;background:rgba(255,255,255,0.05);
                                    border:1px solid var(--border);border-radius:8px;padding:4px 10px;"
                             onclick="event.stopPropagation()">
                            <span style="font-size:0.8rem;color:var(--text-muted);margin-right:2px;">₹</span>
                            <input type="number" value="${s.price}" oninput="updateCatPrice('${s.id}',this.value)"
                                   style="width:80px;border:none;background:transparent;color:var(--text-main);
                                          font-size:0.85rem;font-weight:600;font-family:'Inter',monospace;
                                          outline:none;text-align:right;" />
                        </div>
                    </div>`;
                }).join('')}
                <button onclick="openCatModal('${cat}')"
                        style="margin-top:4px;background:transparent;border:1px dashed var(--border);
                               color:var(--text-muted);border-radius:10px;padding:8px 14px;font-size:0.8rem;
                               cursor:pointer;text-align:left;font-family:'Inter',sans-serif;transition:0.2s;"
                        onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'"
                        onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-muted)'">
                    + Add to ${cat}
                </button>
            </div>
        </div>`;
    }
    root.innerHTML = html || `<div style="color:var(--text-muted);padding:2rem;text-align:center;">No services found for "${filter}"</div>`;
}

window.toggleQQ = (id) => {
    if (inQQ(id)) { qqItems = qqItems.filter(q => q.id !== id); }
    else {
        for (const [cat, items] of Object.entries(catalogue)) {
            const item = items.find(s => s.id === id);
            if (item) { qqItems.push({...item, cat}); break; }
        }
    }
    renderCatalogue(document.getElementById('cat-search')?.value || '');
    renderQQ();
};

window.updateCatPrice = (id, val) => {
    const price = parseInt(val) || 0;
    for (const items of Object.values(catalogue)) {
        const item = items.find(s => s.id === id);
        if (item) { item.price = price; break; }
    }
    const qi = qqItems.find(q => q.id === id);
    if (qi) qi.price = price;
    renderQQ();
};

function renderQQ() {
    const itemsEl = document.getElementById('qq-items');
    const emptyEl = document.getElementById('qq-empty');
    const totalEl = document.getElementById('qq-total');
    const countEl = document.getElementById('qq-count');
    if (!itemsEl) return;
    const total = qqItems.reduce((s, q) => s + (q.price || 0), 0);
    totalEl.textContent = fmtINR(total);
    countEl.textContent = qqItems.length + ' service' + (qqItems.length !== 1 ? 's' : '');
    if (!qqItems.length) { emptyEl.style.display='block'; itemsEl.innerHTML=''; return; }
    emptyEl.style.display = 'none';
    itemsEl.innerHTML = qqItems.map(q => `
        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">
            <div style="flex:1;">
                <div style="font-size:0.85rem;font-weight:600;">${q.name}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${q.cat} · ${q.unit}</div>
            </div>
            <div style="font-size:0.9rem;font-weight:700;color:var(--primary);white-space:nowrap;">${fmtINR(q.price)}</div>
            <button onclick="toggleQQ('${q.id}')" title="Remove"
                    style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:0 2px;">✕</button>
        </div>`).join('');
}

window.setQQStatus = (el) => {
    document.querySelectorAll('.status-pill').forEach(p => p.classList.remove('active-pill'));
    el.classList.add('active-pill');
    qqStatus = el.dataset.status;
};

window.sendToQuotation = () => {
    const client  = document.getElementById('qq-client')?.value.trim();
    const project = document.getElementById('qq-project')?.value.trim();
    if (!qqItems.length) { showCatToast('Add at least one service first'); return; }
    if (!client)         { showCatToast('Enter a client name'); document.getElementById('qq-client').focus(); return; }
    switchView('suite');
    const ci = document.getElementById('doc-client');
    const si = document.getElementById('doc-subject');
    if (ci) ci.value = client;
    if (si) si.value = project || qqItems.map(i => i.name).join(', ');
    activeItems.length = 0;
    qqItems.forEach(q => activeItems.push({ desc: q.name, qty: 1, rate: q.price }));
    initLineItems();
    renderLive();
    showCatToast(`Quote for ${client} loaded into Business Suite ✓`);
};

window.clearQQ = () => {
    qqItems = [];
    const c=document.getElementById('qq-client'), p=document.getElementById('qq-project');
    if(c) c.value=''; if(p) p.value='';
    document.querySelectorAll('.status-pill').forEach(p=>p.classList.remove('active-pill'));
    document.querySelector('[data-status="draft"]')?.classList.add('active-pill');
    qqStatus='draft';
    renderCatalogue(document.getElementById('cat-search')?.value||'');
    renderQQ();
};

window.filterCatalogue = () => renderCatalogue(document.getElementById('cat-search').value);

window.openCatModal = (cat) => {
    const modal=document.getElementById('cat-modal');
    if(!modal) return;
    if(cat){ const sel=document.getElementById('new-svc-cat'); const opt=[...sel.options].find(o=>o.value===cat); if(opt) sel.value=cat; }
    modal.style.display='flex';
    setTimeout(()=>document.getElementById('new-svc-name').focus(),50);
};

window.closeCatModal = () => {
    const m=document.getElementById('cat-modal'); if(m) m.style.display='none';
    document.getElementById('new-svc-name').value='';
    document.getElementById('new-svc-price').value='';
};

window.saveNewService = () => {
    const name=document.getElementById('new-svc-name').value.trim();
    const cat=document.getElementById('new-svc-cat').value;
    const price=parseInt(document.getElementById('new-svc-price').value)||0;
    const tag=document.getElementById('new-svc-tag').value;
    const unit=tag==='retainer'?'/month':tag==='addon'?'flat':'project';
    if(!name){ showCatToast('Enter a service name'); return; }
    if(!catalogue[cat]) catalogue[cat]=[];
    catalogue[cat].push({ id:'custom-'+Date.now(), name, price, unit, tag });
    closeCatModal();
    renderCatalogue(document.getElementById('cat-search')?.value||'');
    showCatToast(`"${name}" added to ${cat}`);
};

function showCatToast(msg) {
    let t=document.getElementById('cat-toast');
    if(!t){ t=document.createElement('div'); t.id='cat-toast';
            t.style.cssText='position:fixed;bottom:24px;right:24px;background:var(--primary);color:#fff;padding:12px 20px;border-radius:10px;font-size:0.85rem;font-weight:600;transform:translateY(80px);opacity:0;transition:all .25s;z-index:9999;pointer-events:none;';
            document.body.appendChild(t); }
    t.textContent=msg; t.style.transform='translateY(0)'; t.style.opacity='1';
    setTimeout(()=>{ t.style.transform='translateY(80px)'; t.style.opacity='0'; },2800);
}
