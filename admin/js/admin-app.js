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
    if (mode === 'letterhead') { preview.className = 'a4-page theme-cyan'; }
    else if (mode === 'proposal') { proposalEditor.style.display = 'block'; preview.className = 'a4-page theme-cyan'; }
    else if (mode === 'quotation') { itemsEditor.style.display = 'block'; preview.className = 'a4-page theme-cyan'; }
    else if (mode === 'invoice') { itemsEditor.style.display = 'block'; preview.className = 'a4-page theme-indigo'; }
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
window.removeItem = (idx) => { activeItems.splice(idx, 1); initLineItems(); renderLive(); };
window.updateItem = (idx, field, val) => { activeItems[idx][field] = field === 'desc' ? val : parseFloat(val) || 0; renderLive(); };

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
    const subject = document.getElementById('doc-subject').value || '';
    const addr = document.getElementById('doc-client-address').value || '';
    const phone = document.getElementById('doc-client-phone').value || '';
    const rawDate = new Date(document.getElementById('doc-date').value);
    const rawDue = new Date(document.getElementById('doc-due-date').value);
    const dateStr = !isNaN(rawDate) ? rawDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    const validStr = !isNaN(rawDue) ? rawDue.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    /* ── BRAND PALETTE (matched to Softsync logo) ── */
    const C = {
        navy: '#1E2D6B',   /* deep navy from logo text */
        navyDark: '#151F4E',   /* darker navy for header bg */
        violet: '#6B5CE7',   /* violet accent from logo gradient */
        violetLight: '#EEF0FB',   /* very light blue-violet tint */
        violetMid: '#C7CDEF',   /* mid tint for borders in accent panels */
        white: '#FFFFFF',
        offWhite: '#F8F9FC',   /* almost white with cool tint */
        textDark: '#0F172A',   /* near-black for headings */
        textMid: '#475569',   /* slate for body text */
        textLight: '#94A3B8',   /* muted label text */
        border: '#E2E8F0',   /* clean cool gray border */
        borderMid: '#CBD5E1',
    };

    /* ── LOGO ── */
    const LOGO = `data:image/png;base64,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rWw1+f5XM0uYytdHGfVkYI/mpFiWD27HL/XXekqqiaStgbHN4zuZz3ju8uPXZXViWFfoGrvLX3eauttzlkkFFKxvLEXnbtEDZ8+++6NoYZjnCm5BdbM+7wYFFc7tfNyzXW4yxuiax33Q0bJDWg9AAFlThxjDsPwm2486oNU6kj0+QDQJPcAeQ9ArDaeHVXaKJtqtWa3mltLH80dKGsc6Nu98jXkcwb5d+ykl2sVVW3uzXCDILhRQW3m8Wli0WVmxoCTfXp36EdUlJPqSlgvaIi1GQREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAK+V9IgOAi5RTgBERAERFAOOqdVyikHCaXKIBpERQAuFyiAEAgggEEaII6FW+KyWSKpFTFZbbHODsSNpWBwPz0rgiAHZOyeqIiA4RCuEBztcIudIAuQgRAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAERFOQEREyAiIoAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQH//Z`;

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
        const isInv = mode === 'invoice';
        const label = isInv ? 'TAX INVOICE' : 'QUOTATION';
        const accentColor = isInv ? '#7C3AED' : C.violet;   /* invoice slightly deeper purple */
        const statusLabel = isInv ? 'PENDING' : 'DRAFT';
        const statusBg = isInv ? '#EDE9FE' : C.violetLight;
        const statusColor = isInv ? '#5B21B6' : C.navy;

        let subtotal = 0;
        const rows = activeItems.map((item, idx) => {
            const lt = item.qty * item.rate; subtotal += lt;
            return `<tr style="border-bottom:1px solid ${C.border};">
                <td style="padding:10px 14px;font-size:0.7rem;color:${C.textLight};vertical-align:top;">${idx + 1}</td>
                <td style="padding:10px 8px;font-size:0.78rem;color:${C.textDark};font-weight:500;line-height:1.4;">${item.desc}</td>
                <td style="padding:10px 8px;font-size:0.78rem;color:${C.textMid};text-align:center;">${item.qty}</td>
                <td style="padding:10px 8px;font-size:0.78rem;color:${C.textMid};text-align:right;">₹${item.rate.toLocaleString('en-IN')}</td>
                <td style="padding:10px 14px;font-size:0.78rem;font-weight:700;color:${C.textDark};text-align:right;">₹${lt.toLocaleString('en-IN')}</td>
            </tr>`;
        }).join('');

        document.getElementById('document-preview').innerHTML = `
        <div style="background:${C.white};min-height:297mm;position:relative;font-family:'Inter',sans-serif;">

            <!-- HEADER: white bg, logo left, doc type right -->
            <div style="background:${C.white};padding:8mm 18mm 6mm;border-bottom:3px solid ${C.navyDark};display:flex;justify-content:space-between;align-items:flex-end;">
                <img src="${LOGO}" style="height:52px;object-fit:contain;display:block;">
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
                    ${['Quoted prices are final and all-inclusive.', 'Validity of this quotation is 21 days.', 'Project kickoff only after advance payment.'].map(t =>
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
        const scope = document.getElementById('p-scope').value;
        const deliverables = document.getElementById('p-deliverables').value;
        const cost = document.getElementById('p-cost').value;
        const timeline = document.getElementById('p-timeline').value;
        const payment = document.getElementById('p-payment').value;
        const notes = document.getElementById('p-notes').value;

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
                <img src="${LOGO}" style="height:52px;object-fit:contain;">
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
                <img src="${LOGO}" style="height:52px;object-fit:contain;">
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
    const amount = mode === 'proposal' ? parseFloat(document.getElementById('p-cost').value || 0) : activeItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    let table = mode === 'invoice' ? 'invoices' : (mode === 'proposal' ? 'proposals' : 'quotes');
    const payload = { client_name: client, created_at: new Date().toISOString() };
    if (mode === 'proposal') {
        Object.assign(payload, { project_title: subject, scope_of_work: document.getElementById('p-scope').value, deliverables: document.getElementById('p-deliverables').value, project_cost: amount, timeline: document.getElementById('p-timeline').value, payment_terms: document.getElementById('p-payment').value, notes: document.getElementById('p-notes').value });
    } else {
        payload.service = subject; payload.items = activeItems;
        if (mode === 'invoice') { payload.amount = amount; payload.status = 'Pending'; } else { payload.price = amount; }
    }
    const { error } = await supabase.from(table).insert([payload]);
    if (error) alert("Sync Error: " + error.message);
    else { alert("Synced to Cloud!"); loadHistory(); }
};

// Store history records globally so View button can access them
let _historyRecords = [];

async function loadHistory() {
    const { data: q } = await supabase.from('quotes').select('*').order('created_at', { ascending: false }).limit(10);
    const { data: i } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(10);
    const { data: p } = await supabase.from('proposals').select('*').order('created_at', { ascending: false }).limit(10);

    _historyRecords = [
        ...(q || []).map(x => ({ ...x, _type: 'quotation', _label: 'Quote', _val: x.price })),
        ...(i || []).map(x => ({ ...x, _type: 'invoice', _label: 'Invoice', _val: x.amount })),
        ...(p || []).map(x => ({ ...x, _type: 'proposal', _label: 'Proposal', _val: x.project_cost }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    document.getElementById('history-list').innerHTML = _historyRecords.map((d, idx) => `
        <tr>
            <td><span class="badge">${d._label}</span></td>
            <td style="font-weight:600;">${d.client_name || '—'}</td>
            <td>₹${(d._val || 0).toLocaleString('en-IN')}</td>
            <td style="color:#94a3b8;">${new Date(d.created_at).toLocaleDateString('en-IN')}</td>
            <td>
                <button class="btn btn-ghost" style="padding:4px 14px;font-size:0.75rem;"
                    onclick="loadDocumentFromHistory(${idx})">
                    View →
                </button>
            </td>
        </tr>`).join('');
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
    const clientEl = document.getElementById('doc-client');
    const subjectEl = document.getElementById('doc-subject');
    if (clientEl) clientEl.value = d.client_name || '';
    if (subjectEl) subjectEl.value = d.service || d.project_title || '';

    if (d._type === 'proposal') {
        // Fill proposal fields
        const fields = {
            'p-scope': d.scope_of_work || '',
            'p-deliverables': d.deliverables || '',
            'p-cost': d.project_cost || '',
            'p-timeline': d.timeline || '',
            'p-payment': d.payment_terms || '',
            'p-notes': d.notes || '',
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
        html += `
        < div style = "margin-bottom:2rem;" >
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
        </div > `;
    }
    root.innerHTML = html || `< div style = "color:var(--text-muted);padding:2rem;text-align:center;" > No services found for "${filter}"</div > `;
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
        < div style = "display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);" >
            <div style="flex:1;">
                <div style="font-size:0.85rem;font-weight:600;">${q.name}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${q.cat} · ${q.unit}</div>
            </div>
            <div style="font-size:0.9rem;font-weight:700;color:var(--primary);white-space:nowrap;">${fmtINR(q.price)}</div>
            <button onclick="toggleQQ('${q.id}')" title="Remove"
                    style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:0 2px;">✕</button>
        </div > `).join('');
}

// status tracking removed — not needed for agency workflow

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
    showCatToast(`Quote for ${ client } loaded into Business Suite ✓`);
};

window.clearQQ = () => {
    qqItems = [];
    const c=document.getElementById('qq-client'), p=document.getElementById('qq-project');
    if(c) c.value=''; if(p) p.value='';
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
    showCatToast(`"${name}" added to ${ cat } `);
};

function showCatToast(msg) {
    let t=document.getElementById('cat-toast');
    if(!t){ t=document.createElement('div'); t.id='cat-toast';
            t.style.cssText='position:fixed;bottom:24px;right:24px;background:var(--primary);color:#fff;padding:12px 20px;border-radius:10px;font-size:0.85rem;font-weight:600;transform:translateY(80px);opacity:0;transition:all .25s;z-index:9999;pointer-events:none;';
            document.body.appendChild(t); }
    t.textContent=msg; t.style.transform='translateY(0)'; t.style.opacity='1';
    setTimeout(()=>{ t.style.transform='translateY(80px)'; t.style.opacity='0'; },2800);
}
