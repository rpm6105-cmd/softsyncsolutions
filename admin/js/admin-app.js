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
    director: 'Rohith P.M.'
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
    updateDueDate(); // Set initial +14 days
    
    initLineItems();
    renderLive();
    loadHistory();
});

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
    
    itemsEditor.style.display = 'none';
    proposalEditor.style.display = 'none';

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
        preview.className = 'a4-page theme-indigo';
    }
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
    
    const rawDueDate = new Date(document.getElementById('doc-due-date').value);
    const validStr = !isNaN(rawDueDate) ? rawDueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '---';
    
    // Generate IDs based on Doc Date (if exists)
    const docId = !isNaN(rawDate) ? `SS-${rawDate.getFullYear()}-${(rawDate.getMonth()+1).toString().padStart(2,'0')}${rawDate.getDate()}-01` : 'SS-XXXX-XXXX-01';

    const title = mode === 'quotation' ? 'Quotation' : (mode === 'invoice' ? 'Tax Invoice' : (mode === 'proposal' ? 'Project Proposal' : 'Letterhead'));

    let subtotal = 0;
    const itemsHtml = activeItems.map((item, idx) => {
        const lineTotal = item.qty * item.rate;
        subtotal += lineTotal;
        return `<tr><td style="color:#94a3b8; width:40px;">${idx+1}.</td><td>${item.desc}</td><td style="text-align:center;">${item.qty}</td><td style="text-align:right;">₹${item.rate.toLocaleString()}</td><td style="text-align:right; font-weight:700;">₹${lineTotal.toLocaleString()}</td></tr>`;
    }).join('');

    let bodyHtml = '';
    if (mode === 'proposal') {
        const scope = document.getElementById('p-scope').value;
        const deliverables = document.getElementById('p-deliverables').value;
        const cost = document.getElementById('p-cost').value;
        const timeline = document.getElementById('p-timeline').value;
        const payment = document.getElementById('p-payment').value;
        const notes = document.getElementById('p-notes').value;

        bodyHtml = `
            <div style="margin-top:1rem;">
                <h4 style="color:var(--doc-accent); font-family:'Outfit',sans-serif; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.05em; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:6px;">1. Scope of Work</h4>
                <p style="font-size:0.8rem; color:#444; line-height:1.6; margin-bottom:1.5rem;">${scope.replace(/\n/g, '<br>') || '---'}</p>

                <h4 style="color:var(--doc-accent); font-family:'Outfit',sans-serif; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.05em; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:6px;">2. Deliverables</h4>
                <p style="font-size:0.8rem; color:#444; line-height:1.6; margin-bottom:1.5rem;">${deliverables.replace(/\n/g, '<br>') || '---'}</p>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem; margin-bottom:1.5rem;">
                    <div>
                        <h4 style="color:var(--doc-accent); font-family:'Outfit',sans-serif; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.05em; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:6px;">3. Project Cost</h4>
                        <p style="font-size:1.1rem; font-weight:800; font-family:'Outfit'; color:#0f172a;">₹${parseFloat(cost).toLocaleString() || '0'}</p>
                    </div>
                    <div>
                        <h4 style="color:var(--doc-accent); font-family:'Outfit',sans-serif; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.05em; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:6px;">4. Timeline</h4>
                        <p style="font-size:0.85rem; font-weight:600; color:#334155;">${timeline || '---'}</p>
                    </div>
                </div>

                <h4 style="color:var(--doc-accent); font-family:'Outfit',sans-serif; text-transform:uppercase; font-size:0.75rem; letter-spacing:0.05em; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:6px;">5. Payment Terms</h4>
                <p style="font-size:0.8rem; color:#444; line-height:1.6; margin-bottom:1rem;">${payment.replace(/\n/g, '<br>') || '---'}</p>
            </div>
        `;
    } else if (mode !== 'letterhead') {
        bodyHtml = `
            <table class="doc-table">
                <thead><tr><th>No.</th><th style="text-align:left;">Description</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Amount</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div class="total-box-container">
                <div class="total-box">
                    <span class="label">Total (INR)</span>
                    <span class="amount">₹${subtotal.toLocaleString()}</span>
                </div>
            </div>
            <div style="margin-top:2rem;">
                <h4 style="font-size:0.7rem; text-transform:uppercase; color:#94a3b8; margin-bottom:6px;">Terms & Conditions</h4>
                <p style="font-size:0.7rem; color:#64748b; line-height:1.6;">• Quoted prices are final and all-inclusive. No additional taxes will be levied.<br>• Validity of this quotation is 21 days.<br>• Project kickoff only after advance payment.</p>
            </div>
        `;
    }

    document.getElementById('document-preview').innerHTML = `
        <div class="branding-bar-top"></div>
        <div class="doc-content">
            <div style="display:flex; justify-content:flex-end; align-items:flex-start; margin-bottom:3rem;">
                <div class="doc-title-block">
                    <h1>${title}</h1>
                </div>
            </div>

            <div class="doc-header-grid">
                <div class="doc-column">
                    <h4>${title} From</h4>
                    <strong>${company.name}</strong>
                    <p>${company.address.split(',').slice(0, 2).join(', ')}</p>
                    <p>${company.address.split(',').slice(2).join(', ')}</p>
                    <p style="margin-top:8px;">Email: <strong>${company.email}</strong></p>
                    <p>Phone: <strong>${company.phone}</strong></p>
                </div>
                <div class="doc-column">
                    <h4>${title} For</h4>
                    <strong>${client}</strong>
                    <p style="white-space: pre-wrap;">${document.getElementById('doc-client-address').value || '---'}</p>
                    <p style="margin-top:8px;">Phone: <strong>${document.getElementById('doc-client-phone').value || '---'}</strong></p>
                </div>
                <div class="doc-column" style="text-align:left;">
                    <h4>Details</h4>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.8rem;">
                        <span style="color:#666;">${title} No</span><strong style="text-align:right;">A0000${docId.slice(-1)}</strong>
                        <span style="color:#666;">${title} Date</span><strong style="text-align:right;">${dateStr}</strong>
                        <span style="color:#666;">Valid Till Date</span><strong style="text-align:right;">${validStr}</strong>
                    </div>
                </div>
            </div>

            <div style="margin-bottom:1.5rem; border-top: 1px solid #f2f2f2; padding-top: 1.5rem;">
                <p style="font-size:0.85rem; color:#333; line-height:1.4;">${subject.replace(/\n/g, '<br>')}</p>
            </div>

            ${bodyHtml}

            <div class="signature-block" style="text-align: right; margin-top: 4rem; width: 100%;">
                <p class="signature" style="font-family: 'Great Vibes', cursive; font-size: 2.2rem; margin-bottom: 0;">${company.director}</p>
                <div style="width:180px; height:1px; background:#e2e8f0; margin:5px 0 5px auto;"></div>
                <p style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#64748b;">Director, Softsync</p>
            </div>
        </div>
        <div class="branding-bar-footer">
            <div class="footer-content">
                <span>WWW.SOFTSYNCSOLUTIONS.IN</span>
                <span>TRUSTED PARTNER IN DIGITAL TRANSFORMATION</span>
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
