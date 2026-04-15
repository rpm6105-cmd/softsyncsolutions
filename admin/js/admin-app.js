import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_CONFIG } from './config.js';

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// --- State & Auth ---
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'admin-login.html';
        return;
    }

    document.getElementById('app-layout').style.display = 'flex';
    init();
});

async function init() {
    loadQuotes();
    loadInvoices();
    loadProjects();
    updateStats();
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

window.logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'admin-login.html';
});

// --- UI Helpers ---
window.showForm = (type) => document.getElementById(`form-${type}`).style.display = 'block';
window.hideForm = (type) => document.getElementById(`form-${type}`).style.display = 'none';

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// --- Quotes Module ---
window.handleQuoteSubmit = async (e) => {
    e.preventDefault();
    const quote = {
        client_name: document.getElementById('q-client').value,
        service: document.getElementById('q-service').value,
        price: parseFloat(document.getElementById('q-price').value)
    };

    const { error } = await supabase.from('quotes').insert([quote]);
    if (!error) {
        e.target.reset();
        hideForm('quote');
        loadQuotes();
        updateStats();
    }
};

async function loadQuotes() {
    const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    const tbody = document.getElementById('list-quotes');
    if (data) {
        tbody.innerHTML = data.map(q => `
            <tr>
                <td style="font-weight:600;">${q.client_name}</td>
                <td>${q.service}</td>
                <td>₹${q.price.toLocaleString()}</td>
                <td>${formatDate(q.created_at)}</td>
            </tr>
        `).join('');
    }
}

// --- Invoices Module ---
window.handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    const invoice = {
        client_name: document.getElementById('i-client').value,
        amount: parseFloat(document.getElementById('i-amount').value),
        status: document.getElementById('i-status').value
    };

    const { error } = await supabase.from('invoices').insert([invoice]);
    if (!error) {
        e.target.reset();
        hideForm('invoice');
        loadInvoices();
        updateStats();
    }
};

async function loadInvoices() {
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    const tbody = document.getElementById('list-invoices');
    if (data) {
        tbody.innerHTML = data.map(i => `
            <tr>
                <td style="font-weight:600;">${i.client_name}</td>
                <td>₹${i.amount.toLocaleString()}</td>
                <td><span class="badge badge-${i.status.toLowerCase()}">${i.status}</span></td>
                <td>${formatDate(i.created_at)}</td>
            </tr>
        `).join('');
    }
}

// --- Projects Module ---
window.handleProjectSubmit = async (e) => {
    e.preventDefault();
    const project = {
        client_name: document.getElementById('p-client').value,
        project_name: document.getElementById('p-name').value,
        status: document.getElementById('p-status').value
    };

    const { error } = await supabase.from('projects').insert([project]);
    if (!error) {
        e.target.reset();
        hideForm('project');
        loadProjects();
        updateStats();
    }
};

async function loadProjects() {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    const tbody = document.getElementById('list-projects');
    if (data) {
        tbody.innerHTML = data.map(p => `
            <tr>
                <td style="font-weight:600;">${p.client_name}</td>
                <td>${p.project_name}</td>
                <td><span class="badge" style="background:rgba(255,255,255,0.05);">${p.status}</span></td>
            </tr>
        `).join('');
    }
}

async function updateStats() {
    const { count: qCount } = await supabase.from('quotes').select('*', { count: 'exact', head: true });
    const { count: iCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true, filter: 'status.eq.Pending' });
    const { count: pCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });

    document.getElementById('stats-quotes').textContent = qCount || 0;
    document.getElementById('stats-invoices').textContent = iCount || 0;
    document.getElementById('stats-projects').textContent = pCount || 0;
}
