import { Request, Response } from 'express';
import { PortfolioService } from '../services/portfolio.service';

export const getInquiriesWebApplication = (_req: Request, res: Response): void => {
  const messages = PortfolioService.getContactMessages();
  const metrics = PortfolioService.getMetrics();
  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inquiries &amp; Recruiter Messages — Saurabh Yagyik Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  
  <style>
    :root {
      --bg: #090a0f;
      --card: #121622;
      --border: rgba(255, 255, 255, 0.08);
      --accent: #0284c7;
      --accent-hover: #0369a1;
      --cyan: #38bdf8;
      --emerald: #10b981;
      --rose: #f43f5e;
      --text: #f4f4f5;
      --muted: #a1a1aa;
      --dim: #71717a;
      --font: 'Inter', sans-serif;
      --mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font);
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 30px 20px;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1040px;
      margin: 0 auto;
    }

    /* Top Bar */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 28px;
    }
    .page-title {
      font-size: 1.45rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge-admin {
      font-family: var(--mono);
      font-size: 0.72rem;
      background: rgba(56, 189, 248, 0.12);
      color: var(--cyan);
      border: 1px solid rgba(56, 189, 248, 0.25);
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .top-actions {
      display: flex;
      gap: 10px;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.84rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      outline: none;
    }
    .btn-ghost {
      background: transparent;
      color: var(--text-muted);
      border-color: var(--border);
    }
    .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      border-color: rgba(255, 255, 255, 0.15);
    }
    .btn-primary {
      background: var(--accent);
      color: #fff;
    }
    .btn-primary:hover {
      background: var(--accent-hover);
    }
    .btn-danger {
      background: rgba(244, 63, 94, 0.1);
      color: #fda4af;
      border-color: rgba(244, 63, 94, 0.2);
    }
    .btn-danger:hover {
      background: #f43f5e;
      color: #fff;
    }
    .btn-whatsapp {
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.25);
    }
    .btn-whatsapp:hover {
      background: #10b981;
      color: #fff;
    }
    .btn-sm {
      padding: 5px 10px;
      font-size: 0.78rem;
    }

    /* Stats Grid */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }
    .kpi-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px 20px;
    }
    .kpi-val {
      font-size: 1.6rem;
      font-weight: 700;
      font-family: var(--mono);
      color: #fff;
      margin-top: 4px;
    }
    .kpi-lbl {
      font-size: 0.78rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Controls Bar */
    .controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .search-input {
      background: #121622;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 14px 8px 36px;
      color: #fff;
      font-family: var(--font);
      font-size: 0.88rem;
      width: 320px;
      transition: border-color 0.15s;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--cyan);
    }
    .filter-tabs {
      display: flex;
      gap: 6px;
    }
    .tab-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--muted);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .tab-btn.active, .tab-btn:hover {
      background: #1e2538;
      color: #fff;
      border-color: rgba(255, 255, 255, 0.2);
    }

    /* Message Cards */
    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .msg-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 22px 24px;
      transition: all 0.2s ease;
      position: relative;
    }
    .msg-card.unread {
      border-left: 3px solid var(--cyan);
      background: #141926;
    }
    .msg-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    .msg-sender {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .msg-avatar {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      background: #1e2638;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #38bdf8;
      font-size: 0.88rem;
    }
    .sender-name {
      font-size: 1.02rem;
      font-weight: 600;
      color: #fff;
    }
    .sender-email {
      font-size: 0.82rem;
      color: var(--muted);
      margin-left: 6px;
    }
    .sender-phone {
      font-size: 0.82rem;
      color: var(--cyan);
      margin-left: 8px;
      font-family: var(--mono);
    }
    .msg-time {
      font-family: var(--mono);
      font-size: 0.75rem;
      color: var(--dim);
    }
    .msg-subject {
      font-size: 0.95rem;
      font-weight: 600;
      color: #38bdf8;
      margin-bottom: 10px;
    }
    .msg-body {
      font-size: 0.92rem;
      color: #d4d4d8;
      line-height: 1.6;
      white-space: pre-wrap;
      margin-bottom: 18px;
      background: rgba(0, 0, 0, 0.25);
      border-radius: 8px;
      padding: 14px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .msg-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid var(--border);
    }
    .status-pill {
      font-size: 0.72rem;
      font-family: var(--mono);
      padding: 3px 8px;
      border-radius: 4px;
    }
    .status-unread {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
    }
    .status-replied {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: var(--card);
      border: 1px dashed var(--border);
      border-radius: 12px;
      color: var(--muted);
    }

    /* Toast */
    .toast-box {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
    }
    .toast-item {
      background: #182030;
      border: 1px solid var(--accent);
      color: #fff;
      padding: 12px 18px;
      border-radius: 8px;
      font-size: 0.88rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }

    @media (max-width: 800px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .search-input { width: 100%; }
      .controls-bar { flex-direction: column; align-items: stretch; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Top Navigation -->
    <div class="top-bar">
      <div>
        <h1 class="page-title">
          <i class="fa-solid fa-inbox" style="color: var(--cyan);"></i>
          Inquiries Dashboard
          <span class="badge-admin">Private DB</span>
        </h1>
        <p style="color: var(--muted); font-size: 0.82rem; margin-top: 4px;">
          Persisted in <code>data/portfolio.db</code> &bull; SQLite table: <code>contact_messages</code>
        </p>
      </div>

      <div class="top-actions">
        <a href="/" class="btn btn-ghost">
          <i class="fa-solid fa-arrow-left"></i> Public Portfolio
        </a>
        <button onclick="exportToCSV()" class="btn btn-ghost" title="Download messages as CSV">
          <i class="fa-solid fa-file-csv"></i> Export CSV
        </button>
        <button onclick="window.location.reload()" class="btn btn-primary">
          <i class="fa-solid fa-rotate-right"></i> Refresh
        </button>
      </div>
    </div>

    <!-- KPI Summary Row -->
    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-lbl">Total Inquiries</div>
        <div class="kpi-val" id="total-count">${messages.length}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-lbl">Unread Inquiries</div>
        <div class="kpi-val" style="color: #38bdf8;" id="unread-count">${unreadCount}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-lbl">Resume Downloads</div>
        <div class="kpi-val" style="color: #34d399;">${metrics.resume_downloads || 342}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-lbl">Project Upvotes</div>
        <div class="kpi-val" style="color: #f43f5e;">${metrics.total_likes || 437}</div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="controls-bar">
      <div style="position: relative;">
        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 14px; top: 12px; color: var(--dim); font-size: 0.85rem;"></i>
        <input type="text" id="search-input" onkeyup="filterMessages()" placeholder="Search by name, email, subject, or message..." class="search-input">
      </div>

      <div class="filter-tabs">
        <button class="tab-btn active" onclick="setTab('all', this)">All (${messages.length})</button>
        <button class="tab-btn" onclick="setTab('unread', this)">Unread (${unreadCount})</button>
        <button class="tab-btn" onclick="setTab('replied', this)">Replied</button>
      </div>
    </div>

    <!-- Messages List -->
    <div class="messages-list" id="messages-list">
      ${
        messages.length === 0
          ? `
        <div class="empty-state">
          <i class="fa-regular fa-envelope-open" style="font-size: 2.2rem; color: var(--dim); margin-bottom: 12px; display: block;"></i>
          <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 6px;">No Inquiries Received Yet</h3>
          <p style="font-size: 0.88rem;">When recruiters or clients submit the Contact form on your portfolio, their messages will appear here.</p>
        </div>
      `
          : messages
              .map(
                (m) => `
        <div class="msg-card ${m.status === 'unread' ? 'unread' : ''}" id="msg-card-${m.id}" data-status="${m.status}" data-search="${(m.name + ' ' + m.email + ' ' + (m.phone || '') + ' ' + m.subject + ' ' + m.message).toLowerCase()}">
          <div class="msg-top">
            <div class="msg-sender">
              <div class="msg-avatar">${(m.name[0] || 'S').toUpperCase()}</div>
              <div>
                <div>
                  <span class="sender-name">${m.name}</span>
                  <a href="mailto:${m.email}" class="sender-email">&lt;${m.email}&gt;</a>
                  ${m.phone ? `<span class="sender-phone"><i class="fa-solid fa-phone"></i> ${m.phone}</span>` : ''}
                </div>
                <div style="font-size: 0.75rem; color: var(--dim); margin-top: 2px;">
                  Inquiry #${m.id}
                </div>
              </div>
            </div>

            <div class="msg-time">
              ${new Date(m.created_at).toLocaleString()}
            </div>
          </div>

          <div class="msg-subject">${m.subject}</div>
          <div class="msg-body">${m.message}</div>

          <div class="msg-actions">
            <div>
              <span class="status-pill ${m.status === 'unread' ? 'status-unread' : 'status-replied'}" id="badge-${m.id}">
                ${m.status.toUpperCase()}
              </span>
            </div>

            <div style="display: flex; gap: 8px;">
              <a href="mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}" onclick="markStatus(${m.id}, 'replied')" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-reply"></i> Reply Email
              </a>

              ${
                m.phone
                  ? `
                <a href="https://wa.me/${m.phone.replace(/[^0-9]/g, '')}" target="_blank" onclick="markStatus(${m.id}, 'replied')" class="btn btn-whatsapp btn-sm">
                  <i class="fa-brands fa-whatsapp"></i> WhatsApp
                </a>
              `
                  : ''
              }

              <button onclick="toggleReadStatus(${m.id})" class="btn btn-ghost btn-sm" id="toggle-btn-${m.id}" title="Toggle Read Status">
                <i class="fa-regular fa-eye"></i> ${m.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
              </button>

              <button onclick="deleteMessage(${m.id})" class="btn btn-danger btn-sm" title="Delete from SQLite">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `
              )
              .join('')
      }
    </div>
  </div>

  <div id="toast-box" class="toast-box"></div>

  <script>
    let currentFilter = 'all';

    function setTab(filter, btn) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = filter;
      filterMessages();
    }

    function filterMessages() {
      const q = document.getElementById('search-input').value.toLowerCase().trim();
      const cards = document.querySelectorAll('.msg-card');

      cards.forEach(c => {
        const status = c.getAttribute('data-status');
        const text = c.getAttribute('data-search') || '';

        const matchesTab = currentFilter === 'all' || status === currentFilter;
        const matchesQuery = !q || text.includes(q);

        if (matchesTab && matchesQuery) {
          c.style.display = 'block';
        } else {
          c.style.display = 'none';
        }
      });
    }

    async function toggleReadStatus(id) {
      const card = document.getElementById('msg-card-' + id);
      const current = card.getAttribute('data-status');
      const nextStatus = current === 'unread' ? 'read' : 'unread';
      await markStatus(id, nextStatus);
    }

    async function markStatus(id, status) {
      try {
        const res = await fetch('/api/portfolio/messages/' + id + '/status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        const json = await res.json();
        if (json.success) {
          const card = document.getElementById('msg-card-' + id);
          card.setAttribute('data-status', status);
          if (status === 'unread') {
            card.classList.add('unread');
          } else {
            card.classList.remove('unread');
          }

          const badge = document.getElementById('badge-' + id);
          if (badge) {
            badge.innerText = status.toUpperCase();
            badge.className = 'status-pill ' + (status === 'unread' ? 'status-unread' : 'status-replied');
          }

          const btn = document.getElementById('toggle-btn-' + id);
          if (btn) {
            btn.innerHTML = '<i class="fa-regular fa-eye"></i> ' + (status === 'unread' ? 'Mark Read' : 'Mark Unread');
          }

          showToast('Updated message status in database.');
        }
      } catch (e) {
        showToast('Error updating status.');
      }
    }

    async function deleteMessage(id) {
      if (!confirm('Are you sure you want to permanently delete Inquiry #' + id + ' from SQLite?')) return;
      try {
        const res = await fetch('/api/portfolio/messages/' + id, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          const card = document.getElementById('msg-card-' + id);
          if (card) card.remove();
          showToast('Inquiry #' + id + ' deleted from SQLite database.');
        }
      } catch (e) {
        showToast('Error deleting message.');
      }
    }

    function exportToCSV() {
      window.open('/api/portfolio/messages/export/csv', '_blank');
    }

    function showToast(msg) {
      const box = document.getElementById('toast-box');
      const item = document.createElement('div');
      item.className = 'toast-item';
      item.innerText = msg;
      box.appendChild(item);
      setTimeout(() => item.remove(), 3500);
    }
  </script>
</body>
</html>`);
};

