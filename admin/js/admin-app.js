import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_CONFIG } from './config.js';

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// --- State ---
let activeItems = [{ desc: 'Platform Architecture & UI Design', qty: 1, rate: 50000 }];
const company = {
    name: 'Softsync Solutions',
    address: 'Pushpak Nagar, Karanjade, Raigad, MH',
    email: 'rohith@softsyncsolutions.in',
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
    document.getElementById('doc-date').valueAsDate = new Date();
    
    initLineItems();
    renderLive();
    loadHistory();
});

// --- Navigation & Core UI ---
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
    
    if (mode === 'letterhead') {
        itemsEditor.style.display = 'none';
        preview.className = 'a4-page theme-cyan';
    } else {
        itemsEditor.style.display = 'block';
        preview.className = mode === 'quotation' ? 'a4-page theme-cyan' : 'a4-page theme-indigo';
    }
    renderLive();
};

// --- Line Item Management ---
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

// --- Reactive Rendering ---
window.renderLive = () => {
    const mode = document.getElementById('suite-mode').value;
    const client = document.getElementById('doc-client').value;
    const subject = document.getElementById('doc-subject').value;
    const date = new Date(document.getElementById('doc-date').value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    
    let subtotal = 0;
    const itemsHtml = activeItems.map(item => {
        const lineTotal = item.qty * item.rate;
        subtotal += lineTotal;
        return `<tr><td>${item.desc}</td><td style="text-align:center;">${item.qty}</td><td style="text-align:right;">₹${item.rate.toLocaleString()}</td><td style="text-align:right;">₹${lineTotal.toLocaleString()}</td></tr>`;
    }).join('');

    const title = mode === 'quotation' ? 'Quotation' : (mode === 'invoice' ? 'Tax Invoice' : 'Letterhead');

    document.getElementById('document-preview').innerHTML = `
        <div class="doc-header">
            <img src="assets/images/logo-s.png" style="height:50px;">
            <div style="text-align:right;">
                <h2 style="font-family:'Outfit'; color:var(--doc-accent); font-size:1.4rem;">${company.name}</h2>
                <p style="font-size:0.75rem; color:#666;">${company.address}</p>
                <p style="font-size:0.75rem; color:#666;">${company.email}</p>
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:2rem;">
            <div>
                <p style="font-size:0.7rem; text-transform:uppercase; color:#999; margin-bottom:4px;">Attention:</p>
                <h3 style="font-family:'Outfit'; font-size:1.2rem;">${client}</h3>
            </div>
            <div style="text-align:right;">
                <h1 class="doc-title">${title}</h1>
                <p style="font-weight:700; font-size:0.85rem;">Date: ${date}</p>
            </div>
        </div>

        <div style="margin-bottom:2rem;">
            <p style="color:#666; font-size:0.85rem; line-height:1.6;">${subject.replace(/\n/g, '<br>')}</p>
        </div>

        ${mode !== 'letterhead' ? `
            <table class="doc-table">
                <thead><tr><th style="text-align:left;">Description</th><th>Qty</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Total</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div class="doc-total">
                <span class="total-label">Grand Total:</span>
                <div class="total-amount">₹${subtotal.toLocaleString()}</div>
            </div>
        ` : ''}

        <div class="signature-block">
            <p class="signature">${company.director}</p>
            <p style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">Director, Softsync</p>
        </div>
    `;
};

// --- Data Operations ---
window.saveDocument = async () => {
    const mode = document.getElementById('suite-mode').value;
    const client = document.getElementById('doc-client').value;
    const subject = document.getElementById('doc-subject').value;
    const date = document.getElementById('doc-date').value;
    
    const amount = activeItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    
    const table = mode === 'invoice' ? 'invoices' : 'quotes';
    const payload = {
        client_name: client,
        service: subject,
        price: amount,
        items: activeItems // Saving as JSONB
    };

    if (mode === 'invoice') {
        payload.amount = amount;
        payload.status = 'Pending';
        delete payload.price;
    }

    const { error } = await supabase.from(table).insert([payload]);
    
    if (error) {
        alert("Error saving to cloud: " + error.message);
    } else {
        alert("Document synced successfully!");
        loadHistory();
    }
};

async function loadHistory() {
    const { data: qData } = await supabase.from('quotes').select('*').order('created_at', { ascending: false }).limit(5);
    const { data: iData } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(5);
    
    const tbody = document.getElementById('history-list');
    const all = [...(qData || []), ...(iData || [])].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    
    tbody.innerHTML = all.map(d => `
        <tr>
            <td><span class="badge" style="background:rgba(255,255,255,0.05);">${d.price ? 'Quotation' : 'Invoice'}</span></td>
            <td style="font-weight:600;">${d.client_name}</td>
            <td>₹${(d.price || d.amount).toLocaleString()}</td>
            <td style="color:var(--text-muted);">${new Date(d.created_at).toLocaleDateString()}</td>
            <td><button class="btn btn-ghost" style="padding:4px 10px; font-size:0.75rem" onclick="restoreDoc('${d.id}')">View</button></td>
        </tr>
    `).join('');
}
