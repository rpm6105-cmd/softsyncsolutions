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

/* ── BRAND PALETTE (upgraded) ── */
const C = {
    navy:        '#0f172a',
    navyDark:    '#020617',
    violet:      '#7c3aed',
    violetLight: '#f5f3ff',
    violetMid:   '#c4b5fd',
    white:       '#ffffff',
    offWhite:    '#f8fafc',
    textDark:    '#1e293b',
    textMid:     '#475569',
    textLight:   '#94a3b8',
    border:      '#e2e8f0',
    borderMid:   '#cbd5e1',
    blue:        '#2563eb',
    blueLight:   '#eff6ff'
};

const GRADIENT = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
const LOGO = 'assets/images/company-logo-full.svg';
const LOGO_ICON = 'assets/images/company-logo-icon.svg';

/* ── SIGNATURE ── */
const sig = `
    <div style="text-align:right;">
        <p style="font-family:'Great Vibes',cursive;font-size:2.2rem;color:${C.navy};margin:0 0 2px;line-height:1.1;">Rohith P.M.</p>
        <div style="width:120px;height:2px;background:${GRADIENT};margin:0 0 5px auto;"></div>
        <p style="font-size:0.58rem;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:${C.textLight};">Director, Softsync Solutions</p>
    </div>`;

/* ── FOOTER BAR ── */
const footer = `
    <div style="background:${C.navyDark};padding:12px 18mm;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:0.55rem;color:rgba(255,255,255,0.5);letter-spacing:0.12em;text-transform:uppercase;">www.softsyncsolutions.in</span>
        <div style="width:5px;height:5px;border-radius:50%;background:${C.violet};opacity:0.8;box-shadow:0 0 10px ${C.violet};"></div>
        <span style="font-size:0.55rem;color:rgba(255,255,255,0.5);letter-spacing:0.12em;text-transform:uppercase;">Trusted Partner in Digital Transformation</span>
    </div>`;

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Admin App: Initializing...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('Admin App: Session retrieval error:', sessionError);
        }

        console.log('Admin App: Session retrieved:', !!session);
        if (!session) { 
            console.log('Admin App: No session, redirecting to login');
            window.location.href = 'admin-login.html'; 
            return; 
        }

        document.getElementById('app-layout').style.display = 'flex';
        console.log('Admin App: Layout displayed');
        
        const today = new Date();
        document.getElementById('doc-date').valueAsDate = today;
        updateDueDate();
        initLineItems();
        renderLive();
        loadHistory();
        renderCatalogue();
        renderQQ();
    } catch (err) {
        console.error('Admin App: Critical Init Error:', err);
    }
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
        // --- Rendering Engine ---
window.renderLive = () => {
    try {
        const mode    = document.getElementById('suite-mode').value;
        const client  = document.getElementById('doc-client').value || '---';
        const subject = document.getElementById('doc-subject').value || '';
        const addr    = document.getElementById('doc-client-address').value || '';
        const phone   = document.getElementById('doc-client-phone').value || '';
        const rawDate = new Date(document.getElementById('doc-date').value);
        const rawDue  = new Date(document.getElementById('doc-due-date').value);
        const dateStr = !isNaN(rawDate) ? rawDate.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';
        const validStr= !isNaN(rawDue)  ? rawDue.toLocaleDateString ('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';

        /* ══════════════════════════════════════════════
           QUOTATION & INVOICE
        ══════════════════════════════════════════════ */
        if (mode === 'quotation' || mode === 'invoice') {
            const isInv       = mode === 'invoice';
            const label       = isInv ? 'TAX INVOICE' : 'QUOTATION';
            const accentColor = isInv ? '#2563eb' : C.violet;
            const statusLabel = isInv ? 'PENDING'   : 'DRAFT';
            const statusBg    = isInv ? '#eff6ff'   : C.violetLight;
            const statusColor = isInv ? '#1e40af'   : C.violet;

            let subtotal = 0;
            const rows = activeItems.map((item, idx) => {
                const lt = item.qty * item.rate; subtotal += lt;
                return `<tr style="border-bottom:1px solid ${C.border};">
                    <td style="padding:12px 14px;font-size:0.75rem;color:${C.textMid};vertical-align:top;">${idx + 1}</td>
                    <td style="padding:12px 8px;font-size:0.85rem;color:${C.textDark};font-weight:500;line-height:1.4;">${item.desc}</td>
                    <td style="padding:12px 8px;font-size:0.85rem;color:${C.textMid};text-align:center;">${item.qty}</td>
                    <td style="padding:12px 8px;font-size:0.85rem;color:${C.textMid};text-align:right;">₹${item.rate.toLocaleString('en-IN')}</td>
                    <td style="padding:12px 14px;font-size:0.85rem;font-weight:700;color:${C.textDark};text-align:right;">₹${lt.toLocaleString('en-IN')}</td>
                </tr>`;
            }).join('');

            document.getElementById('document-preview').innerHTML = `
            <div style="background:${C.white};min-height:297mm;position:relative;font-family:'Inter',sans-serif;">
                <!-- HEADER -->
                <div style="position:relative;background:${C.white};padding:10mm 18mm 8mm;border-bottom:1px solid ${C.border};overflow:hidden;">
                    <div style="position:absolute;inset:0;background:linear-gradient(135deg, ${C.blueLight} 0%, ${C.violetLight} 100%);opacity:0.4;"></div>
                    <div style="position:relative;display:flex;justify-content:space-between;align-items:flex-start;">
                        <div style="display:flex;align-items:center;gap:15px;">
                            <div style="width:56px;height:56px;border-radius:12px;background:${GRADIENT};display:flex;align-items:center;justify-content:center;overflow:hidden;">
                                <img src="${LOGO_ICON}" style="width:36px;height:auto;filter:brightness(0) invert(1);">
                            </div>
                            <div>
                                <h1 style="font-size:1.5rem;font-weight:800;background:${GRADIENT};-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0;">${company.name}</h1>
                                <p style="font-size:0.75rem;color:${C.textMid};margin:2px 0 0;">SaaS Development Agency</p>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:1.8rem;font-weight:900;background:${GRADIENT};-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.02em;">${label}</div>
                            <div style="margin-top:8px;font-size:0.7rem;color:${C.textMid};">
                                <div style="margin-bottom:3px;"><span style="font-weight:600;color:${C.textDark};">#INV-2026-001</span></div>
                                <div>Date: <span style="font-weight:600;color:${C.textDark};">${dateStr}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                            <div style="margin-top:8px;font-size:0.7rem;color:${C.textMid};">
                                <div style="margin-bottom:3px;"><span style="font-weight:600;color:${C.textDark};">#INV-2026-001</span></div>
                                <div>Date: <span style="font-weight:600;color:${C.textDark};">${dateStr}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- BILLING INFO -->
            <div style="display:grid;grid-template-columns:1fr 1fr;background:${C.offWhite};">
                <div style="padding:8mm 18mm;border-right:1px solid ${C.border};">
                    <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:8px;">From</div>
                    <div style="font-size:1rem;font-weight:800;color:${C.textDark};margin-bottom:4px;">${company.name}</div>
                    <div style="font-size:0.75rem;color:${C.textMid};line-height:1.6;max-width:240px;">${company.address}</div>
                </div>
                <div style="padding:8mm 15mm;">
                    <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:8px;">Bill To</div>
                    <div style="font-size:1rem;font-weight:800;color:${C.textDark};margin-bottom:4px;">${client}</div>
                    <div style="font-size:0.75rem;color:${C.textMid};line-height:1.6;">${addr}</div>
                    ${phone ? `<div style="font-size:0.75rem;color:${C.textMid};margin-top:2px;">${phone}</div>` : ''}
                </div>
            </div>

            <!-- LINE ITEMS -->
            <div style="padding:8mm 18mm;background:${C.white};">
                <div style="border-radius:12px;border:1px solid ${C.border};overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:${GRADIENT};">
                                <th style="padding:14px;font-size:0.75rem;font-weight:700;color:white;text-align:left;width:30px;">#</th>
                                <th style="padding:14px 8px;font-size:0.75rem;font-weight:700;color:white;text-align:left;">Description</th>
                                <th style="padding:14px 8px;font-size:0.75rem;font-weight:700;color:white;text-align:center;width:50px;">Qty</th>
                                <th style="padding:14px 8px;font-size:0.75rem;font-weight:700;color:white;text-align:right;width:100px;">Rate</th>
                                <th style="padding:14px 14px;font-size:0.75rem;font-weight:700;color:white;text-align:right;width:110px;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows || `<tr><td colspan="5" style="padding:40px;text-align:center;color:${C.textLight};font-size:0.9rem;font-style:italic;">No items added yet</td></tr>`}
                        </tbody>
                    </table>
                </div>

                <!-- TOTALS SECTION -->
                <div style="display:flex;justify-content:flex-end;margin-top:10mm;margin-bottom:10mm;">
                    <div style="width:320px;background:${C.offWhite};border-radius:12px;padding:20px;border:1px solid ${C.border};">
                        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                            <span style="font-size:0.85rem;color:${C.textMid};">Subtotal</span>
                            <span style="font-size:0.9rem;font-weight:700;color:${C.textDark};">₹${subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
                            <span style="font-size:0.85rem;color:${C.textMid};">Tax (GST 18%)</span>
                            <span style="font-size:0.9rem;font-weight:700;color:${C.textDark};">₹${(subtotal * 0.18).toLocaleString('en-IN')}</span>
                        </div>
                        <div style="height:1px;background:${C.borderMid};margin-bottom:15px;"></div>
                        <div style="display:flex;justify-content:space-between;align-items:center;background:${GRADIENT};margin:-10px -10px -10px -10px;padding:15px;border-radius:0 0 12px 12px;">
                            <span style="font-size:1rem;font-weight:800;color:white;">Grand Total</span>
                            <span style="font-size:1.3rem;font-weight:900;color:white;">₹${(subtotal * 1.18).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                <!-- PAYMENT DETAILS -->
                <div style="margin-top:12mm;">
                    <h3 style="font-size:1.1rem;font-weight:800;color:${C.navyDark};margin-bottom:15px;display:flex;align-items:center;gap:8px;">
                        <div style="width:4px;height:18px;background:${GRADIENT};border-radius:2px;"></div>
                        Payment Details
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                        <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:12px;padding:18px;">
                            <h4 style="font-size:0.8rem;font-weight:800;color:${C.textDark};margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">Bank Transfer</h4>
                            <div style="font-size:0.75rem;color:${C.textMid};display:grid;gap:6px;">
                                <div style="display:flex;justify-content:space-between;"><span>Bank</span><span style="font-weight:600;color:${C.textDark};">HDFC Bank</span></div>
                                <div style="display:flex;justify-content:space-between;"><span>Account</span><span style="font-weight:600;color:${C.textDark};">Softsync Solutions</span></div>
                                <div style="display:flex;justify-content:space-between;"><span>IFSC</span><span style="font-weight:600;color:${C.textDark};">HDFC0001234</span></div>
                                <div style="display:flex;justify-content:space-between;"><span>Account #</span><span style="font-weight:600;color:${C.textDark};">50200012345678</span></div>
                            </div>
                        </div>
                        <div style="background:${C.offWhite};border:1px solid ${C.border};border-radius:12px;padding:18px;">
                            <h4 style="font-size:0.8rem;font-weight:800;color:${C.textDark};margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">Digital Payment</h4>
                            <div style="font-size:0.75rem;color:${C.textMid};display:grid;gap:6px;">
                                <div style="display:flex;justify-content:space-between;"><span>UPI ID</span><span style="font-weight:600;color:${C.textDark};">softsync@hdfcbank</span></div>
                                <div style="display:flex;justify-content:space-between;"><span>Google Pay</span><span style="font-weight:600;color:${C.textDark};">+91 72599 56572</span></div>
                                <div style="display:flex;justify-content:space-between;"><span>PayPal</span><span style="font-weight:600;color:${C.textDark};">payments@softsync.in</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="margin-top:10mm;padding:15px;background:${C.blueLight};border-radius:12px;border:1px solid rgba(37,99,235,0.1);">
                    <p style="font-size:0.7rem;color:${C.blue};line-height:1.6;margin:0;">
                        <span style="font-weight:800;">Instructions:</span> Please mention the document number in payment reference.
                        Payment is due within 7 days. For queries, contact billing@softsyncsolutions.in
                    </p>
                </div>
            </div>

            <div style="position:absolute;bottom:0;left:0;width:100%;">${footer}</div>
        </div>`;
    } else if (mode === 'proposal') {
        const scope        = document.getElementById('p-scope').value;
        const deliverables = document.getElementById('p-deliverables').value;
        const cost         = document.getElementById('p-cost').value;
        const timeline     = document.getElementById('p-timeline').value;
        const payment      = document.getElementById('p-payment').value;
        const notes        = document.getElementById('p-notes').value;

        const section = (num, title, content) => `
            <div style="margin-bottom:8mm;padding-bottom:6mm;border-bottom:1px solid ${C.border};">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:4mm;">
                    <div style="width:28px;height:28px;background:${GRADIENT};border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <span style="font-size:0.8rem;font-weight:800;color:white;">${num}</span>
                    </div>
                    <div style="font-size:0.9rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:${C.navyDark};">${title}</div>
                </div>
                <div style="padding-left:40px;font-size:0.85rem;color:${C.textMid};line-height:1.8;">${content || `<span style="color:${C.textLight};font-style:italic;">Not specified</span>`}</div>
            </div>`;

        document.getElementById('document-preview').innerHTML = `
        <div style="background:${C.white};min-height:297mm;position:relative;font-family:'Inter',sans-serif;">

            <!-- HEADER -->
            <div style="position:relative;background:${C.white};padding:12mm 18mm 10mm;border-bottom:1px solid ${C.border};overflow:hidden;">
                <div style="position:absolute;inset:0;background:linear-gradient(135deg, ${C.blueLight} 0%, ${C.violetLight} 100%);opacity:0.4;"></div>
                <div style="position:relative;display:flex;justify-content:space-between;align-items:flex-start;">
                    <div style="display:flex;align-items:center;gap:15px;">
                        <div style="width:64px;height:64px;border-radius:14px;background:${GRADIENT};display:flex;align-items:center;justify-content:center;overflow:hidden;">
                            <img src="${LOGO_ICON}" style="width:42px;height:auto;filter:brightness(0) invert(1);">
                        </div>
                        <div>
                            <h1 style="font-size:1.6rem;font-weight:800;background:${GRADIENT};-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0;">${company.name}</h1>
                            <p style="font-size:0.8rem;color:${C.textMid};margin:2px 0 0;">SaaS Development Agency</p>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <p style="font-size:0.75rem;color:${C.textMid};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Proposal Date</p>
                        <p style="font-size:1rem;font-weight:700;color:${C.textDark};">${dateStr}</p>
                    </div>
                </div>
                <div style="position:relative;margin-top:12mm;">
                    <h2 style="font-size:2.8rem;font-weight:900;color:${C.navyDark};letter-spacing:-0.03em;line-height:1;margin:0;">Project Proposal</h2>
                    <p style="font-size:1.1rem;color:${C.textMid};margin:8px 0 0;">Professional SaaS Development Services</p>
                </div>
            </div>

            <!-- META ROW -->
            <div style="display:grid;grid-template-columns:1.2fr 1fr 1fr;background:${C.offWhite};border-bottom:1px solid ${C.border};">
                <div style="padding:6mm 18mm;border-right:1px solid ${C.border};">
                    <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:6px;">Prepared For</div>
                    <div style="font-size:1rem;font-weight:800;color:${C.textDark};">${client}</div>
                    ${addr ? `<div style="font-size:0.75rem;color:${C.textMid};margin-top:2px;">${addr}</div>` : ''}
                </div>
                <div style="padding:6mm 10mm;border-right:1px solid ${C.border};">
                    <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:6px;">Timeline</div>
                    <div style="font-size:1rem;font-weight:700;color:${C.textDark};">${timeline || 'TBD'}</div>
                </div>
                <div style="padding:6mm 10mm;background:${C.blueLight};">
                    <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.blue};margin-bottom:6px;">Estimated Cost</div>
                    <div style="font-size:1.4rem;font-weight:900;color:${C.blue};letter-spacing:-0.02em;">₹${parseFloat(cost || 0).toLocaleString('en-IN')}</div>
                </div>
            </div>

            <!-- CONTENT -->
            <div style="padding:10mm 18mm 0;background:${C.white};">
                ${section('1', 'Scope of Work', scope.replace(/\n/g, '<br>'))}
                ${section('2', 'Deliverables', deliverables.replace(/\n/g, '<br>'))}
                ${section('3', 'Payment Terms', payment.replace(/\n/g, '<br>'))}
                ${notes ? `<div style="background:${C.violetLight};border:1px solid ${C.violetMid};border-radius:12px;padding:6mm;margin-bottom:8mm;">
                    <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.violet};margin-bottom:6px;">Additional Notes</div>
                    <div style="font-size:0.85rem;color:${C.textMid};line-height:1.8;">${notes}</div>
                </div>` : ''}
            </div>

            <!-- SIGN OFF -->
            <div style="padding:0 18mm 10mm;background:${C.white};display:flex;justify-content:space-between;align-items:flex-end;">
                <div style="font-size:0.75rem;color:${C.textMid};line-height:1.8;max-width:280px;font-style:italic;">
                    This proposal is valid for 21 days from the date above.<br>
                    Project kickoff begins upon receipt of advance payment.
                </div>
                ${sig}
            </div>

            <div style="position:absolute;bottom:0;left:0;width:100%;">${footer}</div>
        </div>`;
    } else if (mode === 'letterhead') {
        document.getElementById('document-preview').innerHTML = `
        <div style="background:${C.white};min-height:297mm;position:relative;font-family:'Inter',sans-serif;">

            <!-- HEADER -->
            <div style="position:relative;background:${C.white};padding:10mm 18mm 8mm;border-bottom:1px solid ${C.border};overflow:hidden;">
                <div style="position:absolute;top:0;right:0;width:320px;height:160px;background:linear-gradient(225deg, ${C.blueLight} 0%, transparent 100%);opacity:0.5;"></div>
                <div style="position:relative;display:flex;justify-content:space-between;align-items:center;">
                    <div style="width:52px;height:52px;border-radius:12px;background:${GRADIENT};display:flex;align-items:center;justify-content:center;overflow:hidden;">
                        <img src="${LOGO_ICON}" style="width:34px;height:auto;filter:brightness(0) invert(1);">
                    </div>
                    <div style="text-align:right;">
                        <p style="font-size:1.1rem;font-weight:800;background:${GRADIENT};-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0;">${company.name}</p>
                        <p style="font-size:0.7rem;color:${C.textMid};margin:2px 0 0;">${company.email} · www.softsyncsolutions.in</p>
                    </div>
                </div>
            </div>

            <!-- TO / DATE -->
            <div style="background:${C.offWhite};padding:6mm 18mm;display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid ${C.border};">
                <div>
                    <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:6px;">Recipient</div>
                    <div style="font-size:1.1rem;font-weight:800;color:${C.textDark};">${client}</div>
                    ${addr ? `<div style="font-size:0.8rem;color:${C.textMid};margin-top:2px;">${addr}</div>` : ''}
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${C.textLight};margin-bottom:6px;">Date</div>
                    <div style="font-size:0.9rem;font-weight:700;color:${C.textDark};">${dateStr}</div>
                </div>
            </div>

            <!-- BODY -->
            <div style="padding:12mm 18mm;min-height:160mm;background:${C.white};">
                ${subject ? `<div style="font-size:1rem;font-weight:800;color:${C.textDark};margin-bottom:10mm;padding-bottom:5mm;border-bottom:2px solid ${C.offWhite};display:flex;gap:8px;">
                    <span style="color:${C.textLight};font-weight:600;">Subject:</span> ${subject}
                </div>` : ''}
                <div style="font-size:0.95rem;color:${C.textDark};line-height:1.8;white-space:pre-wrap;">[ Your letter content here ]</div>
            </div>

            <!-- SIGNATURE -->
            <div style="padding:0 18mm 12mm;display:flex;justify-content:flex-end;">
                ${sig}
            </div>

            <div style="position:absolute;bottom:0;left:0;width:100%;">${footer}</div>
        </div>`;
    }

    } catch (err) {
        console.error('Render Error:', err);
        const preview = document.getElementById('document-preview');
        if (preview) {
            preview.innerHTML = `<div style="padding:40px;color:#ef4444;background:#fee2e2;border:1px solid #f87171;border-radius:12px;font-family:sans-serif;">
                <h3 style="margin-top:0;">Rendering Error</h3>
                <p style="font-size:0.9rem;">${err.message}</p>
                <p style="font-size:0.8rem;opacity:0.8;">Check the browser console for details.</p>
            </div>`;
        }
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
        list.innerHTML = _historyRecords.map((d, idx) => `
            <tr>
                <td><span class="badge">${d._label}</span></td>
                <td style="font-weight:600;">${d.client_name || '—'}</td>
                <td>₹${(d._val||0).toLocaleString('en-IN')}</td>
                <td style="color:#94a3b8;">${new Date(d.created_at).toLocaleDateString('en-IN')}</td>
                <td>
                    <button class="btn btn-ghost" style="padding:4px 14px;font-size:0.75rem;"
                        onclick="loadDocumentFromHistory(${idx})">
                        View →
                    </button>
                </td>
            </tr>`).join('');
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
    showCatToast(`Loaded ${d._label} for ${d.client_name || 'client'} ✓`);
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
    if (totalEl) totalEl.textContent = fmtINR(total);
    if (countEl) countEl.textContent = qqItems.length + ' service' + (qqItems.length !== 1 ? 's' : '');
    if (!qqItems.length) { if(emptyEl) emptyEl.style.display='block'; itemsEl.innerHTML=''; return; }
    if(emptyEl) emptyEl.style.display = 'none';
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
