import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_CONFIG } from './config.js';

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
        persistSession: true,
        storage: window.sessionStorage,
        autoRefreshToken: true
    }
});

// --- State ---
let activeItems = [];
const company = {
    name: 'Softsync Solutions',
    address: 'Pushpak Nagar, Karanjade, 410206',
    email: 'rohith@softsyncsolutions.in',
    phone: '7259956572',
    director: 'Rohith P.M.',
    website: 'www.softsyncsolutions.in'
};

let timelinePhases = [
    { phase: 'Phase 1: Discovery & Planning', duration: '2 Weeks', deliverables: 'Project roadmap and technical specifications' },
    { phase: 'Phase 2: Design & UI/UX', duration: '3 Weeks', deliverables: 'UI/UX designs and interactive prototypes' },
    { phase: 'Phase 3: Development', duration: '8 Weeks', deliverables: 'Core features and backend architecture' }
];

let paymentDetails = {
    bank: 'First National Bank',
    accName: 'Softsync Solutions LLC',
    accNo: '1234 5678 9012',
    routing: '021000021',
    swift: 'FNBAUS33',
    upi: 'softsync@bank',
    paypal: 'payments@softsync.io'
};

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'admin-login.html';
        return;
    }

    document.getElementById('app-layout').style.display = 'flex';
    
    // Auto-fill dates
    const today = new Date();
    document.getElementById('doc-date').valueAsDate = today;
    updateDueDate();
    
    // Initial data load
    initLineItems();
    initTimelinePhases();
    initPaymentEditor();
    renderLive();
    loadHistory();
});

function initPaymentEditor() {
    document.getElementById('pay-bank').value = paymentDetails.bank;
    document.getElementById('pay-acc-name').value = paymentDetails.accName;
    document.getElementById('pay-acc-no').value = paymentDetails.accNo;
    document.getElementById('pay-routing').value = paymentDetails.routing;
    document.getElementById('pay-swift').value = paymentDetails.swift;
    document.getElementById('pay-upi').value = paymentDetails.upi;
    document.getElementById('pay-paypal').value = paymentDetails.paypal;
}

// --- Navigation ---
window.switchView = (viewName) => {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
};

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(item.dataset.view);
    });
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
    const paymentEditor = document.getElementById('payment-editor');
    const metaEditor = document.getElementById('meta-editor');
    
    itemsEditor.style.display = 'none';
    proposalEditor.style.display = 'none';
    paymentEditor.style.display = 'none';
    metaEditor.style.display = 'block';

    if (mode === 'letterhead') {
        preview.className = 'a4-page theme-cyan';
    } else if (mode === 'proposal') {
        proposalEditor.style.display = 'block';
        preview.className = 'a4-page theme-cyan';
    } else if (mode === 'quotation') {
        itemsEditor.style.display = 'block';
        preview.className = 'a4-page theme-cyan';
    } else if (mode === 'invoice') {
        itemsEditor.style.display = 'block';
        paymentEditor.style.display = 'block';
        preview.className = 'a4-page theme-indigo';
    }
    renderLive();
};

function initTimelinePhases() {
    const container = document.getElementById('timeline-container');
    container.innerHTML = timelinePhases.map((p, idx) => `
        <div class="timeline-phase-row">
            <span class="remove-btn" onclick="removeTimelinePhase(${idx})">&times;</span>
            <input type="text" class="form-input sm" value="${p.phase}" placeholder="Phase Title" oninput="updateTimeline(${idx}, 'phase', this.value)">
            <div class="row-2">
                <input type="text" class="form-input sm" value="${p.duration}" placeholder="Duration" oninput="updateTimeline(${idx}, 'duration', this.value)">
                <input type="text" class="form-input sm" value="${p.deliverables}" placeholder="Deliverables" oninput="updateTimeline(${idx}, 'deliverables', this.value)">
            </div>
        </div>
    `).join('');
}

window.addTimelinePhase = () => {
    timelinePhases.push({ phase: 'New Phase', duration: '1 Week', deliverables: 'Description' });
    initTimelinePhases();
    renderLive();
};

window.removeTimelinePhase = (idx) => {
    timelinePhases.splice(idx, 1);
    initTimelinePhases();
    renderLive();
};

window.updateTimeline = (idx, field, val) => {
    timelinePhases[idx][field] = val;
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

window.addLineItem = () => {
    activeItems.push({ desc: 'New Service Item', qty: 1, rate: 0 });
    initLineItems();
    renderLive();
};

window.removeItem = (idx) => {
    activeItems.splice(idx, 1);
    initLineItems();
    renderLive();
};

window.updateItem = (idx, field, val) => {
    activeItems[idx][field] = field === 'desc' ? val : parseFloat(val) || 0;
    renderLive();
};

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
    const mode = document.getElementById('suite-mode').value;
    const client = document.getElementById('doc-client').value || '---';
    const subject = document.getElementById('doc-subject').value || '---';
    const rawDate = new Date(document.getElementById('doc-date').value);
    const dateStr = !isNaN(rawDate) ? rawDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '---';
    
    // Update local state from editor
    if(mode === 'invoice') {
        paymentDetails = {
            bank: document.getElementById('pay-bank').value,
            accName: document.getElementById('pay-acc-name').value,
            accNo: document.getElementById('pay-acc-no').value,
            routing: document.getElementById('pay-routing').value,
            swift: document.getElementById('pay-swift').value,
            upi: document.getElementById('pay-upi').value,
            paypal: document.getElementById('pay-paypal').value
        };
    }

    const docId = document.getElementById('doc-ref').value || 'SS-2026-001';
    const title = mode === 'quotation' ? 'Quotation' : (mode === 'invoice' ? 'Tax Invoice' : (mode === 'proposal' ? 'Project Proposal' : 'Letterhead'));

    let subtotal = 0;
    const itemsHtml = activeItems.map((item, idx) => {
        const lineTotal = item.qty * item.rate;
        subtotal += lineTotal;
        return `<tr><td style="color:#94a3b8; width:40px;">${idx+1}.</td><td>${item.desc}</td><td style="text-align:center;">${item.qty}</td><td style="text-align:right;">₹${item.rate.toLocaleString()}</td><td style="text-align:right; font-weight:700;">₹${lineTotal.toLocaleString()}</td></tr>`;
    }).join('');

    let headerHtml = '';
    let bodyHtml = '';

    if (mode === 'letterhead') {
        headerHtml = `
            <div class="relative overflow-hidden pb-6 border-b border-gray-200" style="display:flex; justify-content:space-between; align-items:center;">
                <div class="flex items-center gap-3">
                    <img src="assets/images/logo-s.png" style="height:50px;">
                    <span style="font-size:1.5rem; font-weight:800; font-family:'Outfit'; background:var(--softsync-gradient); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Softsync</span>
                </div>
                <div style="text-align:right;">
                    <p class="gradient-text" style="font-size:15px; margin-bottom:0;">${company.name}</p>
                    <p style="font-size:12px; color:#64748b; margin-top:0;">${company.email} | ${company.phone}</p>
                    <p style="font-size:12px; color:#64748b; margin-top:-5px;">${company.website}</p>
                </div>
            </div>
            <div style="margin-top:3rem; margin-bottom:3rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                    <div>
                        <h4 style="font-size:0.7rem; text-transform:uppercase; color:#94a3b8; margin-bottom:8px;">To</h4>
                        <strong style="font-size:1.1rem; color:#1e293b;">${client}</strong>
                        <p style="font-size:0.85rem; color:#64748b; max-width:250px;">${document.getElementById('doc-client-address').value || '---'}</p>
                    </div>
                    <div style="text-align:right;">
                        <p style="font-size:0.85rem; color:#64748b;">Date: <strong style="color:#1e293b;">${dateStr}</strong></p>
                        <p style="font-size:0.85rem; color:#64748b;">Ref: <strong style="color:#1e293b;">${docId}</strong></p>
                    </div>
                </div>
            </div>
        `;
        bodyHtml = `<div style="min-height:400px; font-size:0.95rem; line-height:1.7; color:#334155;">${subject.replace(/\n/g, '<br>')}</div>`;
    } else if (mode === 'proposal') {
        headerHtml = `
            <div class="doc-proposal-header">
                <div class="doc-proposal-title" style="background:var(--softsync-gradient); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Project Proposal</div>
                <div style="font-size:1.8rem; color:#475569; font-weight:300; margin-bottom:4rem; border-top:1px solid #f1f5f9; padding-top:1rem;">${subject}</div>
                
                <div class="doc-proposal-meta">
                    <div class="meta-item">
                        <h4>Prepared For</h4>
                        <strong style="font-size:1rem; color:#0f172a;">${client}</strong>
                        <p style="font-size:0.8rem; color:#64748b;">${document.getElementById('meta-for').value || 'Decision Maker'}</p>
                    </div>
                    <div class="meta-item">
                        <h4>Prepared By</h4>
                        <strong style="font-size:1rem; color:#0f172a;">${company.name}</strong>
                        <p style="font-size:0.8rem; color:#64748b;">${document.getElementById('meta-by').value || 'Project Director'}</p>
                    </div>
                    <div class="meta-item">
                        <h4>Reference</h4>
                        <strong style="font-size:1rem; color:#0f172a;">${docId}</strong>
                        <p style="font-size:0.8rem; color:#64748b;">Issued ${dateStr}</p>
                    </div>
                </div>
            </div>
        `;
        
        const scopeItems = document.getElementById('p-scope').value.split('\n').filter(l => l.trim());
        const scopeHtml = scopeItems.map(item => `
            <div class="doc-scope-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                <p>${item}</p>
            </div>
        `).join('') || '<p>Scope details to be finalized.</p>';

        const timelineHtml = timelinePhases.map(p => `
            <div class="doc-timeline-item">
                <div class="doc-timeline-duration"><span class="phase-pill">${p.duration}</span></div>
                <div class="doc-timeline-content">
                    <h4>${p.phase}</h4>
                    <p>${p.deliverables}</p>
                </div>
            </div>
        `).join('');

        bodyHtml = `
            <div class="doc-scope-list">
                <h3 style="font-size:1.4rem; font-weight:800; color:#1e293b; margin-bottom:1.5rem; display:flex; align-items:center; gap:10px;">
                    <div style="width:30px; height:4px; background:var(--softsync-gradient); border-radius:10px;"></div> Scope of Work
                </h3>
                ${scopeHtml}
            </div>

            <div class="doc-timeline">
                <h3 style="font-size:1.4rem; font-weight:800; color:#1e293b; margin-bottom:2rem; display:flex; align-items:center; gap:10px;">
                    <div style="width:30px; height:4px; background:var(--softsync-gradient); border-radius:10px;"></div> Execution Roadmap
                </h3>
                <div style="position:absolute; left:115px; top:120px; bottom:120px; width:2px; background:#f1f5f9; z-index:0;"></div>
                <div style="position:relative; z-index:1;">${timelineHtml}</div>
            </div>

            <div style="margin-top:4rem; padding:2rem; background:#f8fafc; border-radius:20px; border:1px solid #f1f5f9;">
                <h3 style="font-size:1.2rem; font-weight:800; color:#1e293b; margin-bottom:1rem;">Investment Summary</h3>
                <p style="font-size:0.9rem; color:#64748b; margin-bottom:1.5rem;">Strategic partnership investment for the proposed scope and requirements.</p>
                <div style="height:60px; background:var(--softsync-gradient); border-radius:12px; display:flex; align-items:center; justify-content:space-between; padding:0 1.5rem;">
                    <span style="color:#fff; font-weight:600; font-size:1.1rem;">Total Project Value</span>
                    <span style="color:#fff; font-weight:800; font-size:1.6rem;">₹${subtotal.toLocaleString()}</span>
                </div>
            </div>
        `;
    } else {
        // Quotation & Invoice
        headerHtml = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4rem;">
                <img src="assets/images/logo-s.png" style="height:60px;">
                <div style="text-align:right;">
                    <h1 style="font-size:3.5rem; color:#f1f5f9; font-weight:900; line-height:1; margin-bottom:-1rem; text-transform:uppercase;">${title}</h1>
                    <p style="font-size:0.9rem; font-weight:700; color:#475569; position:relative; z-index:1;">Ref: ${docId}</p>
                </div>
            </div>

            <div class="grid-2" style="margin-bottom:3rem; border-bottom:1px solid #f1f5f9; padding-bottom:3rem;">
                <div class="doc-column">
                    <h4 style="color:var(--doc-accent); font-weight:800;">Issued From</h4>
                    <strong style="font-size:1.1rem; color:#1e293b;">${company.name}</strong>
                    <p style="margin-top:5px;">${company.address}</p>
                    <p><strong>${company.email}</strong></p>
                </div>
                <div class="doc-column">
                    <h4 style="color:var(--doc-accent); font-weight:800;">Billed To</h4>
                    <strong style="font-size:1.1rem; color:#1e293b;">${client}</strong>
                    <p style="margin-top:5px; white-space:pre-wrap;">${document.getElementById('doc-client-address').value || '---'}</p>
                    <p><strong>${document.getElementById('doc-client-phone').value || '---'}</strong></p>
                </div>
            </div>
        `;
        
        bodyHtml = `
            <div style="margin-bottom:2rem;">
                <p style="font-size:1rem; font-weight:700; color:#1e293b; margin-bottom:0.5rem;">Subject: ${subject}</p>
            </div>
            <table class="doc-table premium-table">
                <thead><tr><th>No.</th><th style="text-align:left;">Description</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Amount</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                    <tr class="summary-row"><td colspan="4" style="text-align:right;">Subtotal</td><td style="text-align:right;">₹${subtotal.toLocaleString()}</td></tr>
                    <tr class="summary-row"><td colspan="4" style="text-align:right; color:#10b981;">Discount (0%)</td><td style="text-align:right; color:#10b981;">-₹0</td></tr>
                    <tr class="summary-row" style="border-bottom:2px solid #1e293b;"><td colspan="4" style="text-align:right;">Applicable Taxes</td><td style="text-align:right;">₹0</td></tr>
                    <tr class="total-row"><td colspan="4" style="text-align:right;">Grand Total (INR)</td><td style="text-align:right;">₹${subtotal.toLocaleString()}</td></tr>
                </tfoot>
            </table>

            ${mode === 'invoice' ? `
            <div class="payment-grid">
                <div class="payment-card">
                    <h4>Bank Wire Transfer</h4>
                    <div class="payment-info-row"><span class="label">Bank Name</span><span class="value">${paymentDetails.bank}</span></div>
                    <div class="payment-info-row"><span class="label">Acc. Name</span><span class="value">${paymentDetails.accName}</span></div>
                    <div class="payment-info-row"><span class="label">Acc. Number</span><span class="value">${paymentDetails.accNo}</span></div>
                    <div class="payment-info-row"><span class="label">IFSC / Routing</span><span class="value">${paymentDetails.routing}</span></div>
                    <div class="payment-info-row"><span class="label">SWIFT Code</span><span class="value">${paymentDetails.swift}</span></div>
                </div>
                <div class="payment-card">
                    <h4>Digital Payment</h4>
                    <div class="payment-info-row"><span class="label">UPI ID</span><span class="value">${paymentDetails.upi}</span></div>
                    <div class="payment-info-row"><span class="label">PayPal</span><span class="value">${paymentDetails.paypal}</span></div>
                    <div class="instruction-box">
                        <strong>Note:</strong> Please mention Invoice <strong>${docId}</strong> in transaction remarks.
                    </div>
                </div>
            </div>` : ''}

            <div style="margin-top:3rem; padding-top:2rem; border-top:1px dashed #e2e8f0;">
                <h4 style="font-size:0.75rem; text-transform:uppercase; color:#94a3b8; margin-bottom:10px; font-weight:800;">Terms & Conditions</h4>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem;">
                    <ul style="font-size:0.75rem; color:#64748b; padding-left:1.2rem; line-height:1.6;">
                        <li>Validity of this quotation is 21 days from issued date.</li>
                        <li>Payments should be made to the account details provided above.</li>
                    </ul>
                    <ul style="font-size:0.75rem; color:#64748b; padding-left:1.2rem; line-height:1.6;">
                        <li>Project kickoff subject to receipt of advance amount.</li>
                        <li>Prices expressed are all-inclusive for the current scope.</li>
                    </ul>
                </div>
            </div>
        `;
    }

    document.getElementById('document-preview').innerHTML = `
        <div class="branding-bar-top"></div>
        <div class="doc-content" style="min-height:260mm;">
            ${headerHtml}
            ${bodyHtml}

            <div class="doc-signature-block">
                <p style="font-family:'Great Vibes', cursive; font-size:2.5rem; background:var(--softsync-gradient); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:0;">${company.director}</p>
                <div style="width:200px; height:2px; background:var(--softsync-gradient); margin:5px 0 8px auto; opacity:0.3;"></div>
                <p class="signature-name">${company.director}</p>
                <p class="signature-title">Managing Director, ${company.name}</p>
            </div>
        </div>
        <div class="branding-bar-footer">
            <div class="footer-content">
                <span style="letter-spacing:0.1em;">${company.website.toUpperCase()} / TRUSTED DIGITAL PARTNER</span>
                <span style="font-weight:800;">PAGE 01</span>
            </div>
        </div>
    `;
};

// --- Sync Ops & History ---
window.saveDocument = async () => {
    const mode = document.getElementById('suite-mode').value;
    const client = document.getElementById('doc-client').value;
    const subject = document.getElementById('doc-subject').value;
    const amount = mode === 'proposal' ? parseFloat(document.getElementById('p-cost').value || 0) : activeItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    
    let table = mode === 'invoice' ? 'invoices' : (mode === 'proposal' ? 'proposals' : 'quotes');
    const payload = { client_name: client, created_at: new Date().toISOString() };

    if (mode === 'proposal') {
        Object.assign(payload, { 
            project_title: subject, scope_of_work: document.getElementById('p-scope').value, 
            deliverables: document.getElementById('p-deliverables').value, project_cost: amount,
            timeline: document.getElementById('p-timeline').value, payment_terms: document.getElementById('p-payment').value,
            notes: document.getElementById('p-notes').value 
        });
    } else {
        payload.service = subject;
        payload.items = activeItems;
        if (mode === 'invoice') { payload.amount = amount; payload.status = 'Pending'; }
        else { payload.price = amount; }
    }

    const { error } = await supabase.from(table).insert([payload]);
    if (error) alert("Sync Error: " + error.message);
    else { alert("Synced to Cloud!"); loadHistory(); }
};

async function loadHistory() {
    const { data: q } = await supabase.from('quotes').select('*').order('created_at',{ascending:false}).limit(3);
    const { data: i } = await supabase.from('invoices').select('*').order('created_at',{ascending:false}).limit(3);
    const { data: p } = await supabase.from('proposals').select('*').order('created_at',{ascending:false}).limit(3);
    
    document.getElementById('history-list').innerHTML = [...(q||[]).map(x=>({...x,t:'Quote',v:x.price})), ...(i||[]).map(x=>({...x,t:'Invoice',v:x.amount})), ...(p||[]).map(x=>({...x,t:'Proposal',v:x.project_cost}))]
        .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))
        .map(d => `<tr><td><span class="badge">${d.t}</span></td><td style="font-weight:600;">${d.client_name}</td><td>₹${(d.v||0).toLocaleString()}</td><td style="color:#94a3b8;">${new Date(d.created_at).toLocaleDateString()}</td><td><button class="btn btn-ghost" style="padding:4px 10px; font-size:0.7rem">View</button></td></tr>`).join('');
}
