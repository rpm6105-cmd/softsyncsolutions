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
    const mode    = document.getElementById('suite-mode').value;
    const client  = document.getElementById('doc-client').value || '---';
    const subject = document.getElementById('doc-subject').value || '';
    const addr    = document.getElementById('doc-client-address').value || '';
    const phone   = document.getElementById('doc-client-phone').value || '';
    const rawDate = new Date(document.getElementById('doc-date').value);
    const rawDue  = new Date(document.getElementById('doc-due-date').value);
    const dateStr = !isNaN(rawDate) ? rawDate.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';
    const validStr= !isNaN(rawDue)  ? rawDue.toLocaleDateString ('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';
    const title   = mode==='quotation'?'Quotation':mode==='invoice'?'Tax Invoice':mode==='proposal'?'Project Proposal':'Letterhead';

    /* ── helpers ── */
    const sig = `<p style="font-family:'Great Vibes',cursive;font-size:2rem;color:#0f172a;margin:0 0 3px;">${company.director}</p>
        <div style="width:110px;height:1px;background:#cbd5e1;margin:0 0 4px auto;"></div>
        <p style="font-size:0.58rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Director, Softsync</p>`;

    const footerBar = (bg='#0f172a') =>
        `<div style="background:${bg};padding:10px 18mm;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.55rem;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;">www.softsyncsolutions.in</span>
            <span style="font-size:0.55rem;color:rgba(255,255,255,0.4);letter-spacing:0.1em;text-transform:uppercase;">Trusted Partner in Digital Transformation</span>
        </div>`;

    /* ══════════════════════════════════════════════
       QUOTATION & INVOICE
    ══════════════════════════════════════════════ */
    if (mode === 'quotation' || mode === 'invoice') {
        const isInv   = mode === 'invoice';
        const hdrBg   = isInv ? '#1e1b4b' : '#0c1a14';
        const accent  = isInv ? '#6366f1' : '#10b981';
        const accentL = isInv ? '#eef2ff' : '#f0fdf4';
        const accentT = isInv ? '#4f46e5' : '#059669';

        let subtotal = 0;
        const rows = activeItems.map((item,idx) => {
            const lt = item.qty * item.rate; subtotal += lt;
            return `<tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:9px 12px;font-size:0.72rem;color:#94a3b8;width:28px;">${idx+1}</td>
                <td style="padding:9px 12px;font-size:0.78rem;color:#1e293b;font-weight:500;">${item.desc}</td>
                <td style="padding:9px 12px;font-size:0.78rem;color:#475569;text-align:center;">${item.qty}</td>
                <td style="padding:9px 12px;font-size:0.78rem;color:#475569;text-align:right;">₹${item.rate.toLocaleString('en-IN')}</td>
                <td style="padding:9px 12px;font-size:0.78rem;font-weight:700;color:#0f172a;text-align:right;">₹${lt.toLocaleString('en-IN')}</td>
            </tr>`;
        }).join('');

        document.getElementById('document-preview').innerHTML = `
        <div style="background:${hdrBg};padding:10mm 18mm 8mm;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
                <img src="assets/images/logo-s.png" style="height:32px;filter:brightness(0) invert(1);display:block;margin-bottom:8px;">
                <div style="font-size:0.58rem;color:rgba(255,255,255,0.45);line-height:1.7;">${company.address}<br>${company.email} · ${company.phone}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:2.8rem;font-weight:800;color:#fff;letter-spacing:-0.04em;line-height:1;font-family:'Outfit',sans-serif;opacity:0.95;">${title.toUpperCase()}</div>
                <div style="margin-top:5px;display:inline-block;background:${accent};color:#fff;font-size:0.6rem;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.06em;">A00001</div>
            </div>
        </div>
        <div style="height:3px;background:${accent};"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr 0.85fr;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
            <div style="padding:5mm 18mm 5mm;">
                <div style="font-size:0.55rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;margin-bottom:5px;">From</div>
                <div style="font-size:0.85rem;font-weight:800;color:#0f172a;margin-bottom:3px;">${company.name}</div>
                <div style="font-size:0.68rem;color:#64748b;line-height:1.5;">${company.address}</div>
            </div>
            <div style="padding:5mm 6mm;border-left:1px solid #e2e8f0;">
                <div style="font-size:0.55rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;margin-bottom:5px;">Bill To</div>
                <div style="font-size:0.85rem;font-weight:800;color:#0f172a;margin-bottom:3px;">${client}</div>
                <div style="font-size:0.68rem;color:#64748b;line-height:1.5;">${addr}</div>
                ${phone ? `<div style="font-size:0.68rem;color:#64748b;margin-top:2px;">${phone}</div>` : ''}
            </div>
            <div style="padding:5mm 6mm;border-left:1px solid #e2e8f0;background:${accentL};">
                <div style="font-size:0.55rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;margin-bottom:6px;">Details</div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:0.65rem;color:#64748b;">Issue Date</span><span style="font-size:0.65rem;font-weight:700;color:#0f172a;">${dateStr}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:0.65rem;color:#64748b;">Valid Till</span><span style="font-size:0.65rem;font-weight:700;color:#0f172a;">${validStr}</span></div>
                <div style="margin-top:6px;padding-top:6px;border-top:1px solid ${isInv?'#c7d2fe':'#bbf7d0'};display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:0.6rem;color:#64748b;font-weight:600;">Status</span>
                    <span style="font-size:0.6rem;font-weight:700;color:${accentT};background:${isInv?'#e0e7ff':'#d1fae5'};padding:2px 8px;border-radius:10px;">${isInv?'PENDING':'DRAFT'}</span>
                </div>
            </div>
        </div>

        ${subject ? `<div style="padding:4mm 18mm;background:#fff;border-bottom:1px solid #f1f5f9;">
            <span style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Re: </span>
            <span style="font-size:0.78rem;color:#334155;font-weight:600;">${subject}</span>
        </div>` : ''}

        <div style="padding:0 18mm;background:#fff;">
            <table style="width:100%;border-collapse:collapse;margin-top:4mm;">
                <thead><tr style="background:${hdrBg};">
                    <th style="padding:7px 12px;font-size:0.6rem;font-weight:700;letter-spacing:0.08em;color:rgba(255,255,255,0.6);text-align:left;width:28px;">#</th>
                    <th style="padding:7px 12px;font-size:0.6rem;font-weight:700;letter-spacing:0.08em;color:rgba(255,255,255,0.6);text-align:left;">Description</th>
                    <th style="padding:7px 12px;font-size:0.6rem;font-weight:700;letter-spacing:0.08em;color:rgba(255,255,255,0.6);text-align:center;width:48px;">Qty</th>
                    <th style="padding:7px 12px;font-size:0.6rem;font-weight:700;letter-spacing:0.08em;color:rgba(255,255,255,0.6);text-align:right;width:80px;">Rate</th>
                    <th style="padding:7px 12px;font-size:0.6rem;font-weight:700;letter-spacing:0.08em;color:rgba(255,255,255,0.6);text-align:right;width:88px;">Amount</th>
                </tr></thead>
                <tbody>${rows || `<tr><td colspan="5" style="padding:20px 12px;text-align:center;color:#94a3b8;font-size:0.75rem;font-style:italic;">No items added yet</td></tr>`}</tbody>
            </table>
            <div style="display:flex;justify-content:flex-end;border-top:2px solid ${accent};">
                <div style="background:${hdrBg};display:flex;justify-content:space-between;align-items:center;padding:8px 16px;min-width:240px;gap:32px;">
                    <span style="font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.7);">Total (INR)</span>
                    <span style="font-size:1.15rem;font-weight:800;color:#fff;font-family:'Outfit',sans-serif;">₹${subtotal.toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>

        <div style="padding:4mm 18mm 5mm;background:#fff;display:grid;grid-template-columns:1.1fr 0.9fr;gap:6mm;align-items:end;">
            <div style="background:#f8fafc;border-radius:6px;padding:4mm;border:1px solid #e2e8f0;">
                <div style="font-size:0.55rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;margin-bottom:5px;">Terms & Conditions</div>
                ${['Quoted prices are final and all-inclusive.','Validity of this quotation is 21 days.','Project kickoff only after advance payment.'].map(t=>`<div style="display:flex;gap:5px;margin-bottom:3px;"><span style="color:${accent};font-weight:700;font-size:0.7rem;">·</span><span style="font-size:0.65rem;color:#64748b;">${t}</span></div>`).join('')}
            </div>
            <div style="text-align:right;">${sig}</div>
        </div>

        <div style="height:16mm;"></div>
        <div style="position:absolute;bottom:0;left:0;width:100%;">${footerBar(hdrBg)}</div>`;

    /* ══════════════════════════════════════════════
       PROJECT PROPOSAL
    ══════════════════════════════════════════════ */
    } else if (mode === 'proposal') {
        const scope=document.getElementById('p-scope').value,
              deliverables=document.getElementById('p-deliverables').value,
              cost=document.getElementById('p-cost').value,
              timeline=document.getElementById('p-timeline').value,
              payment=document.getElementById('p-payment').value,
              notes=document.getElementById('p-notes').value;

        const section = (num, title, content) =>
            `<div style="margin-bottom:5mm;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:3mm;">
                    <div style="width:22px;height:22px;background:#0c1a14;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <span style="font-size:0.6rem;font-weight:800;color:#10b981;">${num}</span>
                    </div>
                    <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#0c1a14;">${title}</div>
                </div>
                <div style="padding-left:30px;font-size:0.75rem;color:#475569;line-height:1.65;">${content||'<span style="color:#94a3b8;font-style:italic;">Not specified</span>'}</div>
            </div>`;

        document.getElementById('document-preview').innerHTML = `
        <div style="background:#0c1a14;padding:10mm 18mm 8mm;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <img src="assets/images/logo-s.png" style="height:30px;filter:brightness(0) invert(1);">
                <div style="text-align:right;">
                    <div style="font-size:0.55rem;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:3px;">Prepared by</div>
                    <div style="font-size:0.8rem;font-weight:700;color:#fff;">${company.name}</div>
                    <div style="font-size:0.6rem;color:rgba(255,255,255,0.45);">${company.email} · ${company.phone}</div>
                </div>
            </div>
            <div style="margin-top:8mm;padding-top:6mm;border-top:1px solid rgba(255,255,255,0.1);">
                <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.4);margin-bottom:4px;">Project Proposal</div>
                <div style="font-size:1.8rem;font-weight:800;color:#fff;letter-spacing:-0.03em;line-height:1.1;font-family:'Outfit',sans-serif;">${subject||'Project Title'}</div>
            </div>
        </div>
        <div style="height:3px;background:linear-gradient(90deg,#10b981,#059669 60%,rgba(16,185,129,0.1));"></div>

        <div style="background:#f8fafc;padding:4mm 18mm;display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid #e2e8f0;">
            <div><div style="font-size:0.55rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:3px;">Prepared For</div>
                <div style="font-size:0.82rem;font-weight:800;color:#0f172a;">${client}</div>
                ${addr ? `<div style="font-size:0.65rem;color:#64748b;">${addr}</div>` : ''}
            </div>
            <div style="border-left:1px solid #e2e8f0;padding-left:6mm;">
                <div style="font-size:0.55rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:3px;">Date</div>
                <div style="font-size:0.82rem;font-weight:700;color:#0f172a;">${dateStr}</div>
            </div>
            <div style="border-left:1px solid #e2e8f0;padding-left:6mm;">
                <div style="font-size:0.55rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:3px;">Project Cost</div>
                <div style="font-size:0.82rem;font-weight:800;color:#059669;">₹${parseFloat(cost||0).toLocaleString('en-IN')}</div>
                ${timeline ? `<div style="font-size:0.65rem;color:#64748b;margin-top:2px;">Timeline: ${timeline}</div>` : ''}
            </div>
        </div>

        <div style="padding:6mm 18mm;background:#fff;">
            ${section('1','Scope of Work', scope.replace(/\n/g,'<br>'))}
            ${section('2','Deliverables', deliverables.replace(/\n/g,'<br>'))}
            ${section('3','Payment Terms', payment.replace(/\n/g,'<br>'))}
            ${notes ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:4mm;margin-top:4mm;">
                <div style="font-size:0.55rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#059669;margin-bottom:4px;">Additional Notes</div>
                <div style="font-size:0.72rem;color:#166534;">${notes}</div>
            </div>` : ''}

            <div style="margin-top:6mm;padding-top:5mm;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-end;">
                <div style="font-size:0.65rem;color:#94a3b8;line-height:1.7;">This proposal is valid for 21 days from the date above.<br>Kickoff begins upon receipt of advance payment.</div>
                <div style="text-align:right;">${sig}</div>
            </div>
        </div>
        <div style="height:12mm;"></div>
        <div style="position:absolute;bottom:0;left:0;width:100%;">${footerBar('#0c1a14')}</div>`;

    /* ══════════════════════════════════════════════
       LETTERHEAD
    ══════════════════════════════════════════════ */
    } else if (mode === 'letterhead') {
        document.getElementById('document-preview').innerHTML = `
        <div style="background:#0c1a14;padding:7mm 18mm;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <img src="assets/images/logo-s.png" style="height:30px;filter:brightness(0) invert(1);">
                <div style="text-align:right;">
                    <div style="font-size:0.62rem;color:rgba(255,255,255,0.45);line-height:1.7;">${company.address}<br>${company.email} &nbsp;·&nbsp; ${company.phone}</div>
                </div>
            </div>
        </div>
        <div style="height:3px;background:linear-gradient(90deg,#10b981,#059669 60%,rgba(16,185,129,0.1));"></div>
        <div style="background:#f8fafc;padding:4mm 18mm;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;">
            <div>
                <div style="font-size:0.55rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:3px;">To</div>
                <div style="font-size:0.9rem;font-weight:800;color:#0f172a;">${client}</div>
                ${addr ? `<div style="font-size:0.68rem;color:#64748b;">${addr}</div>` : ''}
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.55rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin-bottom:3px;">Date</div>
                <div style="font-size:0.78rem;font-weight:700;color:#0f172a;">${dateStr}</div>
            </div>
        </div>

        <div style="padding:8mm 18mm 6mm;background:#fff;min-height:160mm;">
            ${subject ? `<div style="font-size:0.78rem;font-weight:700;color:#0f172a;margin-bottom:6mm;padding-bottom:3mm;border-bottom:1px solid #f1f5f9;">Re: ${subject}</div>` : ''}
            <div style="font-size:0.78rem;color:#64748b;font-style:italic;line-height:1.8;"></div>
        </div>

        <div style="padding:0 18mm 4mm;background:#fff;display:flex;justify-content:flex-end;">
            <div style="text-align:right;">${sig}</div>
        </div>
        <div style="height:12mm;"></div>
        <div style="position:absolute;bottom:0;left:0;width:100%;">${footerBar('#0c1a14')}</div>`;
    }
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
