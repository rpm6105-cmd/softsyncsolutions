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
                <img src="data:image/png;base64,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" style="height:38px;display:block;margin-bottom:8px;object-fit:contain;">
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
                <img src="data:image/png;base64,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" style="height:36px;object-fit:contain;">
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
                <img src="data:image/png;base64,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" style="height:36px;object-fit:contain;">
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
