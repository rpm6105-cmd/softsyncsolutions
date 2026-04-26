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

    /* ── BRAND PALETTE (matched to Softsync logo) ── */
    const C = {
        navy:        '#1E2D6B',   /* deep navy from logo text */
        navyDark:    '#151F4E',   /* darker navy for header bg */
        violet:      '#6B5CE7',   /* violet accent from logo gradient */
        violetLight: '#EEF0FB',   /* very light blue-violet tint */
        violetMid:   '#C7CDEF',   /* mid tint for borders in accent panels */
        white:       '#FFFFFF',
        offWhite:    '#F8F9FC',   /* almost white with cool tint */
        textDark:    '#0F172A',   /* near-black for headings */
        textMid:     '#475569',   /* slate for body text */
        textLight:   '#94A3B8',   /* muted label text */
        border:      '#E2E8F0',   /* clean cool gray border */
        borderMid:   '#CBD5E1',
    };

    /* ── LOGO ── */
    const LOGO = 'assets/images/company-logo-full.svg';

    /* ── SIGNATURE ── */
    const sig = `
        <div style="text-align:right;">
            <p style="font-family:'Great Vibes',cursive;font-size:2.2rem;color:${C.navy};margin:0 0 2px;line-height:1.1;">Rohith P.M.</p>
            <div style="width:120px;height:1px;background:${C.violetMid};margin:0 0 5px auto;"></div>
            <p style="font-size:0.58rem;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:${C.textLight};">Director, Softsync Solutions</p>
        </div>`;

    /* ── FOOTER BAR ── */
    const footer = `
        <div style="background:${C.navyDark};padding:8px 18mm;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.5rem;color:rgba(255,255,255,0.4);letter-spacing:0.12em;text-transform:uppercase;">www.softsyncsolutions.in</span>
            <div style="width:4px;height:4px;border-radius:50%;background:${C.violet};opacity:0.6;"></div>
            <span style="font-size:0.5rem;color:rgba(255,255,255,0.4);letter-spacing:0.12em;text-transform:uppercase;">Trusted Partner in Digital Transformation</span>
        </div>`;

    /* ══════════════════════════════════════════════
       QUOTATION & INVOICE
    ══════════════════════════════════════════════ */
    if (mode === 'quotation' || mode === 'invoice') {
        const isInv       = mode === 'invoice';
        const label       = isInv ? 'TAX INVOICE' : 'QUOTATION';
        const accentColor = isInv ? '#7C3AED' : C.violet;   /* invoice slightly deeper purple */
        const statusLabel = isInv ? 'PENDING'   : 'DRAFT';
        const statusBg    = isInv ? '#EDE9FE'   : C.violetLight;
        const statusColor = isInv ? '#5B21B6'   : C.navy;

        let subtotal = 0;
        const rows = activeItems.map((item, idx) => {
            const lt = item.qty * item.rate; subtotal += lt;
            return \`<tr style="border-bottom:1px solid \${C.border};">
                <td style="padding:10px 14px;font-size:0.7rem;color:\${C.textLight};vertical-align:top;">\${idx + 1}</td>
                <td style="padding:10px 8px;font-size:0.78rem;color:\${C.textDark};font-weight:500;line-height:1.4;">\${item.desc}</td>
                <td style="padding:10px 8px;font-size:0.78rem;color:\${C.textMid};text-align:center;">\${item.qty}</td>
                <td style="padding:10px 8px;font-size:0.78rem;color:\${C.textMid};text-align:right;">₹\${item.rate.toLocaleString('en-IN')}</td>
                <td style="padding:10px 14px;font-size:0.78rem;font-weight:700;color:\${C.textDark};text-align:right;">₹\${lt.toLocaleString('en-IN')}</td>
            </tr>\`;
        }).join('');

        document.getElementById('document-preview').innerHTML = `
        <div style="background:${C.white};min-height:297mm;position:relative;font-family:'Inter',sans-serif;">

            <!-- HEADER: white bg, logo left, doc type right -->
            <div style="background:${C.white};padding:8mm 18mm 6mm;border-bottom:3px solid ${C.navyDark};display:flex;justify-content:space-between;align-items:flex-end;">
                <img src="${LOGO}" style="height:60px;width:auto;display:block;mix-blend-mode:multiply;filter:contrast(1.05) brightness(1.05);">
                <div style="text-align:right;">
                    <div style="font-size:0.48rem;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${accentColor};margin-bottom:3px;">${label}</div>
                    <div style="font-size:2.4rem;font-weight:800;color:${C.navyDark};letter-spacing:-0.04em;line-height:1;font-family:'Outfit',sans-serif;">A00001</div>
                    <div style="font-size:0.58rem;color:${C.textLight};margin-top:3px;">${company.address}</div>
                    <div style="font-size:0.58rem;color:${C.textLight};">${company.email} · ${company.phone}</div>
                </div>
            </div>
            <!-- Violet accent stripe under header -->
            <div style="height:3px;background:linear-gradient(90deg,${accentColor},rgba(107,92,231,0.15));"></div>

            <!-- FROM / BILL TO / DETAILS -->
            <div style="display:grid;grid-template-columns:1fr 1fr 0.85fr;border-bottom:1px solid ${C.border};">
                <div style="padding:5mm 18mm 5mm;">
                    <div style="font-size:0.52rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:5px;">From</div>
                    <div style="font-size:0.88rem;font-weight:800;color:${C.textDark};margin-bottom:3px;">${company.name}</div>
                    <div style="font-size:0.65rem;color:${C.textMid};line-height:1.6;">${company.address}</div>
                </div>
                <div style="padding:5mm 8mm;border-left:1px solid ${C.border};">
                    <div style="font-size:0.52rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:5px;">Bill To</div>
                    <div style="font-size:0.88rem;font-weight:800;color:${C.textDark};margin-bottom:3px;">${client}</div>
                    <div style="font-size:0.65rem;color:${C.textMid};line-height:1.6;">${addr}</div>
                    ${phone ? `<div style="font-size:0.65rem;color:${C.textMid};margin-top:2px;">${phone}</div>` : ''}
                </div>
                <div style="padding:5mm 8mm;border-left:1px solid ${C.border};background:${C.violetLight};">
                    <div style="font-size:0.52rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:6px;">Details</div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:0.63rem;color:${C.textMid};">Issue Date</span><span style="font-size:0.63rem;font-weight:700;color:${C.textDark};">${dateStr}</span></div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:0.63rem;color:${C.textMid};">Valid Till</span><span style="font-size:0.63rem;font-weight:700;color:${C.textDark};">${validStr}</span></div>
                    <div style="padding-top:6px;border-top:1px solid ${C.violetMid};display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.58rem;color:${C.textMid};font-weight:600;">Status</span>
                        <span style="font-size:0.58rem;font-weight:700;color:${statusColor};background:${statusBg};padding:2px 9px;border-radius:20px;letter-spacing:0.04em;">${statusLabel}</span>
                    </div>
                </div>
            </div>

            ${subject ? `<div style="padding:3mm 18mm;background:${C.offWhite};border-bottom:1px solid ${C.border};">
                <span style="font-size:0.58rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${C.textLight};">Re: </span>
                <span style="font-size:0.75rem;color:${C.textDark};font-weight:600;">${subject}</span>
            </div>` : ''}

            <!-- LINE ITEMS -->
            <div style="padding:0 18mm;background:${C.white};">
                <table style="width:100%;border-collapse:collapse;margin-top:5mm;">
                    <thead>
                        <tr style="background:${C.navyDark};">
                            <th style="padding:8px 14px;font-size:0.56rem;font-weight:700;letter-spacing:0.12em;color:rgba(255,255,255,0.5);text-align:left;width:24px;">#</th>
                            <th style="padding:8px 8px;font-size:0.56rem;font-weight:700;letter-spacing:0.12em;color:rgba(255,255,255,0.5);text-align:left;">Description</th>
                            <th style="padding:8px 8px;font-size:0.56rem;font-weight:700;letter-spacing:0.12em;color:rgba(255,255,255,0.5);text-align:center;width:44px;">Qty</th>
                            <th style="padding:8px 8px;font-size:0.56rem;font-weight:700;letter-spacing:0.12em;color:rgba(255,255,255,0.5);text-align:right;width:80px;">Rate</th>
                            <th style="padding:8px 14px;font-size:0.56rem;font-weight:700;letter-spacing:0.12em;color:rgba(255,255,255,0.5);text-align:right;width:88px;">Amount</th>
                        </tr>
                    </thead>
                    <tbody style="border:1px solid ${C.border};border-top:none;">
                        ${rows || `<tr><td colspan="5" style="padding:22px;text-align:center;color:${C.textLight};font-size:0.72rem;font-style:italic;border:1px solid ${C.border};">No items added yet</td></tr>`}
                    </tbody>
                </table>

                <!-- TOTAL -->
                <div style="display:flex;justify-content:flex-end;margin-bottom:7mm;">
                    <div style="min-width:260px;border:1px solid ${C.border};border-top:none;">
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 14px;background:${C.offWhite};">
                            <span style="font-size:0.6rem;color:${C.textMid};font-weight:600;letter-spacing:0.04em;">SUBTOTAL</span>
                            <span style="font-size:0.75rem;color:${C.textDark};font-weight:600;">₹${subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:${C.navyDark};">
                            <span style="font-size:0.6rem;color:rgba(255,255,255,0.5);font-weight:600;letter-spacing:0.08em;">TOTAL (INR)</span>
                            <span style="font-size:1.2rem;font-weight:800;color:#fff;font-family:'Outfit',sans-serif;letter-spacing:-0.02em;">₹${subtotal.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TERMS & SIGNATURE -->
            <div style="padding:0 18mm 7mm;background:${C.white};display:grid;grid-template-columns:1.2fr 0.8fr;gap:8mm;align-items:end;">
                <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:6px;padding:4mm;">
                    <div style="font-size:0.5rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.violet};margin-bottom:6px;">Terms & Conditions</div>
                    ${['Quoted prices are final and all-inclusive.','Validity of this quotation is 21 days.','Project kickoff only after advance payment.'].map(t =>
                        `<div style="display:flex;gap:6px;margin-bottom:4px;">
                            <span style="color:${C.violet};font-size:0.7rem;margin-top:1px;">·</span>
                            <span style="font-size:0.63rem;color:${C.textMid};line-height:1.5;">${t}</span>
                        </div>`).join('')}
                </div>
                ${sig}
            </div>

            <div style="height:14mm;"></div>
            <div style="position:absolute;bottom:0;left:0;width:100%;">${footer}</div>
        </div>`;

    /* ══════════════════════════════════════════════
       PROJECT PROPOSAL
    ══════════════════════════════════════════════ */
    } else if (mode === 'proposal') {
        const scope        = document.getElementById('p-scope').value;
        const deliverables = document.getElementById('p-deliverables').value;
        const cost         = document.getElementById('p-cost').value;
        const timeline     = document.getElementById('p-timeline').value;
        const payment      = document.getElementById('p-payment').value;
        const notes        = document.getElementById('p-notes').value;

        const section = (num, title, content) => `
            <div style="margin-bottom:5mm;padding-bottom:5mm;border-bottom:1px solid ${C.border};">
                <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:3mm;">
                    <div style="width:20px;height:20px;background:${C.violetLight};border:1.5px solid ${C.violetMid};border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
                        <span style="font-size:0.58rem;font-weight:800;color:${C.violet};">${num}</span>
                    </div>
                    <div style="font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${C.navyDark};padding-top:3px;">${title}</div>
                </div>
                <div style="padding-left:30px;font-size:0.74rem;color:${C.textMid};line-height:1.7;">${content || `<span style="color:${C.textLight};font-style:italic;">Not specified</span>`}</div>
            </div>`;

        document.getElementById('document-preview').innerHTML = `
        <div style="background:${C.white};min-height:297mm;position:relative;font-family:'Inter',sans-serif;">

            <!-- HEADER -->
            <div style="background:${C.white};padding:8mm 18mm 6mm;border-bottom:3px solid ${C.navyDark};display:flex;justify-content:space-between;align-items:flex-end;">
                <img src="${LOGO}" style="height:52px;object-fit:contain;mix-blend-mode:multiply;filter:contrast(1.05) brightness(1.05);">
                <div style="text-align:right;">
                    <div style="font-size:0.48rem;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:${C.violet};margin-bottom:3px;">Project Proposal</div>
                    <div style="font-size:0.58rem;color:${C.textLight};">${company.email} · ${company.phone}</div>
                </div>
            </div>
            <div style="height:3px;background:linear-gradient(90deg,${C.violet},rgba(107,92,231,0.1));"></div>

            <!-- TITLE BAND -->
            <div style="background:${C.navyDark};padding:6mm 18mm;">
                <div style="font-size:1.9rem;font-weight:800;color:#fff;letter-spacing:-0.03em;line-height:1.1;font-family:'Outfit',sans-serif;">${subject || 'Project Title'}</div>
            </div>

            <!-- META ROW -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;background:${C.offWhite};border-bottom:1px solid ${C.border};">
                <div style="padding:4.5mm 18mm;">
                    <div style="font-size:0.52rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:4px;">Prepared For</div>
                    <div style="font-size:0.85rem;font-weight:800;color:${C.textDark};">${client}</div>
                    ${addr ? `<div style="font-size:0.63rem;color:${C.textMid};margin-top:2px;">${addr}</div>` : ''}
                </div>
                <div style="padding:4.5mm 8mm;border-left:1px solid ${C.border};">
                    <div style="font-size:0.52rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:4px;">Date</div>
                    <div style="font-size:0.85rem;font-weight:700;color:${C.textDark};">${dateStr}</div>
                    ${timeline ? `<div style="font-size:0.62rem;color:${C.textMid};margin-top:2px;">Timeline: ${timeline}</div>` : ''}
                </div>
                <div style="padding:4.5mm 8mm;border-left:1px solid ${C.border};background:${C.violetLight};">
                    <div style="font-size:0.52rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:4px;">Project Cost</div>
                    <div style="font-size:1.1rem;font-weight:800;color:${C.navyDark};font-family:'Outfit',sans-serif;letter-spacing:-0.02em;">₹${parseFloat(cost || 0).toLocaleString('en-IN')}</div>
                </div>
            </div>

            <!-- CONTENT -->
            <div style="padding:6mm 18mm 0;background:${C.white};">
                ${section('1', 'Scope of Work', scope.replace(/\n/g, '<br>'))}
                ${section('2', 'Deliverables', deliverables.replace(/\n/g, '<br>'))}
                ${section('3', 'Payment Terms', payment.replace(/\n/g, '<br>'))}
                ${notes ? `<div style="background:${C.violetLight};border:1px solid ${C.violetMid};border-radius:6px;padding:4mm;margin-bottom:5mm;">
                    <div style="font-size:0.5rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.violet};margin-bottom:4px;">Additional Notes</div>
                    <div style="font-size:0.7rem;color:${C.textMid};line-height:1.6;">${notes}</div>
                </div>` : ''}
            </div>

            <!-- SIGN OFF -->
            <div style="padding:0 18mm 7mm;background:${C.white};display:flex;justify-content:space-between;align-items:flex-end;">
                <div style="font-size:0.63rem;color:${C.textLight};line-height:1.8;max-width:200px;">
                    This proposal is valid for 21 days from the date above.<br>
                    Kickoff begins upon receipt of advance payment.
                </div>
                ${sig}
            </div>

            <div style="height:12mm;"></div>
            <div style="position:absolute;bottom:0;left:0;width:100%;">${footer}</div>
        </div>`;

    /* ══════════════════════════════════════════════
       LETTERHEAD
    ══════════════════════════════════════════════ */
    } else if (mode === 'letterhead') {
        document.getElementById('document-preview').innerHTML = `
        <div style="background:${C.white};min-height:297mm;position:relative;font-family:'Inter',sans-serif;">

            <!-- HEADER -->
            <div style="background:${C.white};padding:7mm 18mm 6mm;border-bottom:3px solid ${C.navyDark};display:flex;justify-content:space-between;align-items:center;">
                <img src="${LOGO}" style="height:52px;object-fit:contain;mix-blend-mode:multiply;filter:contrast(1.05) brightness(1.05);">
                <div style="text-align:right;">
                    <div style="font-size:0.62rem;color:${C.textMid};line-height:1.8;">${company.address}</div>
                    <div style="font-size:0.62rem;color:${C.textMid};">${company.email} &nbsp;·&nbsp; ${company.phone}</div>
                </div>
            </div>
            <div style="height:3px;background:linear-gradient(90deg,${C.violet},rgba(107,92,231,0.1));"></div>

            <!-- TO / DATE -->
            <div style="background:${C.offWhite};padding:4mm 18mm;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${C.border};">
                <div>
                    <div style="font-size:0.52rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:4px;">To</div>
                    <div style="font-size:0.92rem;font-weight:800;color:${C.textDark};">${client}</div>
                    ${addr ? `<div style="font-size:0.65rem;color:${C.textMid};margin-top:2px;">${addr}</div>` : ''}
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.52rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:4px;">Date</div>
                    <div style="font-size:0.78rem;font-weight:700;color:${C.textDark};">${dateStr}</div>
                </div>
            </div>

            <!-- BODY -->
            <div style="padding:8mm 18mm;min-height:165mm;background:${C.white};">
                ${subject ? `<div style="font-size:0.78rem;font-weight:700;color:${C.textDark};margin-bottom:7mm;padding-bottom:4mm;border-bottom:1px solid ${C.border};">
                    <span style="color:${C.textLight};font-weight:500;">Re: </span>${subject}
                </div>` : ''}
                <div style="font-size:0.78rem;color:${C.textLight};font-style:italic;line-height:2;">[ Letter body goes here ]</div>
            </div>

            <!-- SIGNATURE -->
            <div style="padding:0 18mm 7mm;display:flex;justify-content:flex-end;">
                ${sig}
            </div>

            <div style="height:12mm;"></div>
            <div style="position:absolute;bottom:0;left:0;width:100%;">${footer}</div>
        </div>`;
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

// Store history records globally so View button can access them
let _historyRecords = [];

async function loadHistory() {
    const {data:q}=await supabase.from('quotes').select('*').order('created_at',{ascending:false}).limit(10);
    const {data:i}=await supabase.from('invoices').select('*').order('created_at',{ascending:false}).limit(10);
    const {data:p}=await supabase.from('proposals').select('*').order('created_at',{ascending:false}).limit(10);

    _historyRecords = [
        ...(q||[]).map(x=>({...x, _type:'quotation',  _label:'Quote',    _val:x.price})),
        ...(i||[]).map(x=>({...x, _type:'invoice',    _label:'Invoice',  _val:x.amount})),
        ...(p||[]).map(x=>({...x, _type:'proposal',   _label:'Proposal', _val:x.project_cost}))
    ].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));

    const list = document.getElementById('history-list');
    if (list) {
        list.innerHTML = _historyRecords.map((d, idx) => \`
            <tr>
                <td><span class="badge">\${d._label}</span></td>
                <td style="font-weight:600;">\${d.client_name || '—'}</td>
                <td>₹\${(d._val||0).toLocaleString('en-IN')}</td>
                <td style="color:#94a3b8;">\${new Date(d.created_at).toLocaleDateString('en-IN')}</td>
                <td>
                    <button class="btn btn-ghost" style="padding:4px 14px;font-size:0.75rem;"
                        onclick="loadDocumentFromHistory(\${idx})">
                        View →
                    </button>
                </td>
            </tr>\`).join('');
    }
}

window.loadDocumentFromHistory = (idx) => {
    const d = _historyRecords[idx];
    if (!d) return;

    // Switch to Business Suite
    switchView('suite');

    // Set document type
    const modeSelect = document.getElementById('suite-mode');
    modeSelect.value = d._type;
    updateUI();

    // Fill client details
    const clientEl  = document.getElementById('doc-client');
    const subjectEl = document.getElementById('doc-subject');
    if (clientEl)  clientEl.value  = d.client_name || '';
    if (subjectEl) subjectEl.value = d.service || d.project_title || '';

    if (d._type === 'proposal') {
        // Fill proposal fields
        const fields = {
            'p-scope':       d.scope_of_work   || '',
            'p-deliverables':d.deliverables    || '',
            'p-cost':        d.project_cost    || '',
            'p-timeline':    d.timeline        || '',
            'p-payment':     d.payment_terms   || '',
            'p-notes':       d.notes           || '',
        };
        for (const [id, val] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }
    } else {
        // Fill line items
        activeItems.length = 0;
        if (Array.isArray(d.items) && d.items.length) {
            d.items.forEach(item => activeItems.push(item));
        } else if (d.service) {
            // Fallback: single item from service name + total
            activeItems.push({ desc: d.service || 'Service', qty: 1, rate: d._val || 0 });
        }
        initLineItems();
    }

    // Set date if available
    if (d.created_at) {
        const dateEl = document.getElementById('doc-date');
        if (dateEl) {
            dateEl.valueAsDate = new Date(d.created_at);
            updateDueDate();
        }
    }

    renderLive();
    showCatToast(\`Loaded \${d._label} for \${d.client_name || 'client'} ✓\`);
};

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
        html += \`
        <div style="margin-bottom:2rem;">
            <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
                        color:var(--text-muted);margin-bottom:0.75rem;padding-bottom:0.5rem;
                        border-bottom:1px solid var(--border);">\${cat}</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
                \${visible.map(s => {
                    const sel = inQQ(s.id);
                    const tc  = TAG_COLORS[s.tag];
                    return \`
                    <div style="display:flex;align-items:center;gap:12px;
                                background:\${sel?'rgba(16,185,129,0.05)':'var(--card-bg)'};
                                border:1px solid \${sel?'rgba(16,185,129,0.4)':'var(--border)'};
                                border-radius:12px;padding:12px 14px;transition:border-color 0.2s;">
                        <div onclick="toggleQQ('\${s.id}')"
                             style="width:18px;height:18px;border-radius:5px;cursor:pointer;flex-shrink:0;
                                    display:flex;align-items:center;justify-content:center;transition:all 0.15s;
                                    background:\${sel?'var(--primary)':'transparent'};
                                    border:1.5px solid \${sel?'var(--primary)':'var(--border)'};">
                            \${sel?\`<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>\`:''}
                        </div>
                        <div style="flex:1;cursor:pointer;" onclick="toggleQQ('\${s.id}')">
                            <div style="font-size:0.9rem;font-weight:\${sel?'600':'500'};color:\${sel?'var(--primary)':'var(--text-main)'};">\${s.name}</div>
                            <div style="display:flex;align-items:center;gap:8px;margin-top:3px;">
                                <span style="font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:20px;background:\${tc.bg};color:\${tc.color};">\${s.tag}</span>
                                <span style="font-size:0.75rem;color:var(--text-muted);">\${s.unit}</span>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;background:rgba(255,255,255,0.05);
                                    border:1px solid var(--border);border-radius:8px;padding:4px 10px;"
                             onclick="event.stopPropagation()">
                            <span style="font-size:0.8rem;color:var(--text-muted);margin-right:2px;">₹</span>
                            <input type="number" value="\${s.price}" oninput="updateCatPrice('\${s.id}',this.value)"
                                   style="width:80px;border:none;background:transparent;color:var(--text-main);
                                          font-size:0.85rem;font-weight:600;font-family:'Inter',monospace;
                                          outline:none;text-align:right;" />
                        </div>
                    </div>\`;
                }).join('')}
                <button onclick="openCatModal('\${cat}')"
                        style="margin-top:4px;background:transparent;border:1px dashed var(--border);
                               color:var(--text-muted);border-radius:10px;padding:8px 14px;font-size:0.8rem;
                               cursor:pointer;text-align:left;font-family:'Inter',sans-serif;transition:0.2s;"
                        onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'"
                        onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-muted)'">
                    + Add to \${cat}
                </button>
            </div>
        </div>\`;
    }
    root.innerHTML = html || \`<div style="color:var(--text-muted);padding:2rem;text-align:center;">No services found for "\${filter}"</div>\`;
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
    if (totalEl) totalEl.textContent = fmtINR(total);
    if (countEl) countEl.textContent = qqItems.length + ' service' + (qqItems.length !== 1 ? 's' : '');
    if (!qqItems.length) { if(emptyEl) emptyEl.style.display='block'; itemsEl.innerHTML=''; return; }
    if(emptyEl) emptyEl.style.display = 'none';
    itemsEl.innerHTML = qqItems.map(q => \`
        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">
            <div style="flex:1;">
                <div style="font-size:0.85rem;font-weight:600;">\${q.name}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">\${q.cat} · \${q.unit}</div>
            </div>
            <div style="font-size:0.9rem;font-weight:700;color:var(--primary);white-space:nowrap;">\${fmtINR(q.price)}</div>
            <button onclick="toggleQQ('\${q.id}')" title="Remove"
                    style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:0 2px;">✕</button>
        </div>\`).join('');
}

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
    showCatToast(\`Quote for \${client} loaded into Business Suite ✓\`);
};

window.clearQQ = () => {
    qqItems = [];
    const c=document.getElementById('qq-client'), p=document.getElementById('qq-project');
    if(c) c.value=''; if(p) p.value='';
    renderCatalogue(document.getElementById('cat-search')?.value||'');
    renderQQ();
};

window.filterCatalogue = () => {
    const el = document.getElementById('cat-search');
    if(el) renderCatalogue(el.value);
};

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
    showCatToast(\`"\${name}" added to \${cat}\`);
};

function showCatToast(msg) {
    let t=document.getElementById('cat-toast');
    if(!t){ t=document.createElement('div'); t.id='cat-toast';
            t.style.cssText='position:fixed;bottom:24px;right:24px;background:var(--primary);color:#fff;padding:12px 20px;border-radius:10px;font-size:0.85rem;font-weight:600;transform:translateY(80px);opacity:0;transition:all .25s;z-index:9999;pointer-events:none;';
            document.body.appendChild(t); }
    t.textContent=msg; t.style.transform='translateY(0)'; t.style.opacity='1';
    setTimeout(()=>{ t.style.transform='translateY(80px)'; t.style.opacity='0'; },2800);
}
