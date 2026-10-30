import { Request, Response } from 'express';
import { PortfolioService } from '../services/portfolio.service';

export const getPortfolioWebApplication = (_req: Request, res: Response): void => {
  // Record page view metric in SQLite DB
  PortfolioService.recordMetricIncrement('page_views');

  const profile = PortfolioService.getProfile();
  const skillsGrouped = PortfolioService.getSkills();
  const projects = PortfolioService.getProjects();
  const experience = PortfolioService.getExperience();
  const education = PortfolioService.getEducation();
  const guestbook = PortfolioService.getGuestbook();
  const metrics = PortfolioService.getMetrics();

  // Helper to render initial skills HTML server-side
  let initialSkillsHtml = '';
  for (const [category, skills] of Object.entries(skillsGrouped)) {
    initialSkillsHtml += `
      <div class="skill-group">
        <h3 class="skill-group-title">${category}</h3>
        <div class="skill-tags">
          ${skills
            .map(
              (skill) => `
            <div class="skill-chip">
              <span class="skill-chip-name">${skill.name}</span>
              <span class="skill-chip-level">${skill.level}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  // Helper to render initial projects HTML server-side
  const initialProjectsHtml = projects
    .map(
      (p) => `
    <div class="project-card">
      <div class="project-header">
        <div>
          <span class="project-category">${p.category}</span>
          <h3 class="project-title">${p.title}</h3>
        </div>
        <div class="platform-tags">
          ${p.platforms.includes('Android') ? '<span class="platform-badge"><i class="fa-brands fa-android"></i> Android</span>' : ''}
          ${p.platforms.includes('iOS') ? '<span class="platform-badge"><i class="fa-brands fa-apple"></i> iOS</span>' : ''}
        </div>
      </div>

      <p class="project-tagline">${p.subtitle}</p>
      <p class="project-summary">${p.description}</p>

      <div class="project-tech-row">
        ${(p.tech_stack || []).map((t) => `<span class="tech-tag">${t}</span>`).join('')}
      </div>

      <div class="project-actions">
        <div class="store-links">
          ${
            p.play_store_url
              ? `
            <a href="${p.play_store_url}" target="_blank" rel="noopener noreferrer" class="btn btn-store">
              <i class="fa-brands fa-google-play"></i> Google Play
            </a>
          `
              : ''
          }
          ${
            p.app_store_url
              ? `
            <a href="${p.app_store_url}" target="_blank" rel="noopener noreferrer" class="btn btn-store">
              <i class="fa-brands fa-apple"></i> App Store
            </a>
          `
              : ''
          }
          <button onclick="viewProjectDetails('${p.id}')" class="btn btn-ghost btn-sm">
            Architecture Specs
          </button>
        </div>

        <button onclick="likeProject('${p.id}', this)" class="like-button" title="Appreciate project (saved to DB)">
          <i class="fa-solid fa-heart"></i> <span class="like-count">${p.likes_count}</span>
        </button>
      </div>
    </div>
  `
    )
    .join('');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profile.full_name} — Senior Flutter &amp; Mobile Engineer</title>
  <meta name="description" content="Portfolio of ${profile.full_name}, Flutter Developer with 3+ years experience designing, building, and deploying scalable Android and iOS applications with Clean Architecture, BLoC, and SQLite.">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  
  <style>
    :root {
      --bg: #090a0f;
      --bg-subtle: #0f121a;
      --card-bg: #131722;
      --card-hover: #171c2a;
      --border: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(2, 132, 199, 0.5);
      
      --accent: #0284c7;
      --accent-hover: #0369a1;
      --accent-subtle: rgba(2, 132, 199, 0.12);
      
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --text-dim: #71717a;
      
      --emerald: #10b981;
      --emerald-bg: rgba(16, 185, 129, 0.12);
      
      --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --mono: 'JetBrains Mono', SFMono-Regular, Consolas, monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font);
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Top Navigation */
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(9, 10, 15, 0.88);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
    }
    .nav-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 68px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: #fff;
    }
    .brand-avatar {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: #1e293b;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: #38bdf8;
    }
    .brand-name {
      font-weight: 600;
      font-size: 0.98rem;
      letter-spacing: -0.01em;
    }
    .brand-role {
      font-size: 0.75rem;
      color: var(--text-dim);
      margin-left: 6px;
      padding-left: 8px;
      border-left: 1px solid var(--border);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 24px;
      list-style: none;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      transition: color 0.15s;
    }
    .nav-links a:hover {
      color: #fff;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.86rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      outline: none;
    }
    .btn-primary {
      background: #fff;
      color: #090a0f;
    }
    .btn-primary:hover {
      background: #e4e4e7;
    }
    .btn-accent {
      background: var(--accent);
      color: #fff;
    }
    .btn-accent:hover {
      background: var(--accent-hover);
    }
    .btn-ghost {
      background: transparent;
      color: var(--text-muted);
      border-color: var(--border);
    }
    .btn-ghost:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.15);
    }
    .btn-store {
      background: #181d2a;
      border-color: var(--border);
      color: #f4f4f5;
      font-size: 0.8rem;
      padding: 6px 12px;
    }
    .btn-store:hover {
      border-color: #38bdf8;
      color: #38bdf8;
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 0.8rem;
    }

    /* Hero Section */
    .hero {
      padding: 70px 0 50px;
      border-bottom: 1px solid var(--border);
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 48px;
      align-items: center;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 12px;
      background: var(--emerald-bg);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 500;
      color: #34d399;
      margin-bottom: 20px;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
    }
    .hero-title {
      font-size: 2.8rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 10px;
      color: #fff;
    }
    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--text-muted);
      font-weight: 400;
      margin-bottom: 20px;
    }
    .hero-bio {
      font-size: 0.98rem;
      color: var(--text-muted);
      line-height: 1.7;
      margin-bottom: 28px;
      max-width: 580px;
    }
    .hero-contacts {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 30px;
      font-size: 0.88rem;
      color: var(--text-dim);
    }
    .hero-contacts a {
      color: var(--text-muted);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: color 0.15s;
    }
    .hero-contacts a:hover {
      color: #38bdf8;
    }
    .hero-cta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    /* Interactive Phone Mockup Card (Real Mobile Developer Visual) */
    .phone-showcase-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .showcase-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    .showcase-label {
      font-size: 0.75rem;
      font-family: var(--mono);
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .phone-tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 16px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .phone-tab-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .phone-tab-btn:hover, .phone-tab-btn.active {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
    }
    .app-preview-box {
      background: #0d1017;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
      min-height: 240px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .preview-app-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
    }
    .preview-app-sub {
      font-size: 0.85rem;
      color: #38bdf8;
      margin-bottom: 12px;
    }
    .preview-app-desc {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .preview-app-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid var(--border);
      font-size: 0.8rem;
      color: var(--text-dim);
    }

    /* Metrics Strip */
    .stats-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 36px 0;
      border-bottom: 1px solid var(--border);
    }
    .stat-box {
      text-align: left;
      padding-right: 20px;
    }
    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      font-family: var(--mono);
      letter-spacing: -0.02em;
    }
    .stat-label {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    /* Section Structure */
    .section {
      padding: 70px 0;
      border-bottom: 1px solid var(--border);
    }
    .section-title-wrap {
      margin-bottom: 36px;
    }
    .section-eyebrow {
      font-family: var(--mono);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin-bottom: 8px;
    }
    .section-title {
      font-size: 1.85rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #fff;
    }
    .section-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 6px;
    }

    /* Projects Grid */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
    }
    .project-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }
    .project-card:hover {
      border-color: rgba(255, 255, 255, 0.18);
      background: var(--card-hover);
      transform: translateY(-2px);
    }
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .project-category {
      font-size: 0.72rem;
      font-family: var(--mono);
      text-transform: uppercase;
      color: #38bdf8;
      letter-spacing: 0.05em;
    }
    .project-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #fff;
      margin-top: 2px;
    }
    .platform-tags {
      display: flex;
      gap: 6px;
    }
    .platform-badge {
      font-size: 0.72rem;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.05);
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .project-tagline {
      font-size: 0.88rem;
      color: #cbd5e1;
      font-weight: 500;
      margin-bottom: 10px;
    }
    .project-summary {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 18px;
      flex: 1;
    }
    .project-tech-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 20px;
    }
    .tech-tag {
      font-size: 0.72rem;
      font-family: var(--mono);
      background: #181d2a;
      color: #94a3b8;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .project-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      gap: 10px;
    }
    .store-links {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .like-button {
      background: transparent;
      border: 1px solid var(--border);
      color: #cbd5e1;
      padding: 6px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.78rem;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .like-button:hover, .like-button.liked {
      border-color: #f43f5e;
      color: #f43f5e;
    }

    /* Experience Timeline */
    .experience-list {
      max-width: 820px;
    }
    .exp-item {
      padding: 28px 0;
      border-bottom: 1px solid var(--border);
    }
    .exp-item:first-child { padding-top: 0; }
    .exp-item:last-child { border-bottom: none; }
    .exp-meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 8px;
    }
    .exp-role {
      font-size: 1.15rem;
      font-weight: 600;
      color: #fff;
    }
    .exp-company {
      color: var(--accent);
      font-weight: 500;
    }
    .exp-dates {
      font-family: var(--mono);
      font-size: 0.8rem;
      color: var(--text-dim);
    }
    .exp-points {
      list-style: none;
      margin-top: 12px;
    }
    .exp-points li {
      position: relative;
      padding-left: 18px;
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 6px;
    }
    .exp-points li::before {
      content: '—';
      position: absolute;
      left: 0;
      color: var(--text-dim);
    }

    /* Skills Grid */
    .skills-wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .skill-group {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .skill-group-title {
      font-size: 0.92rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border);
    }
    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .skill-chip {
      background: #181d2a;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .skill-chip-name {
      font-size: 0.84rem;
      font-weight: 500;
      color: #e4e4e7;
    }
    .skill-chip-level {
      font-family: var(--mono);
      font-size: 0.7rem;
      color: var(--accent);
    }

    /* Education */
    .edu-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      max-width: 820px;
    }
    .edu-item {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 22px;
    }
    .edu-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
    }
    .edu-sub {
      font-size: 0.88rem;
      color: #38bdf8;
      margin-bottom: 8px;
    }
    .edu-desc {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    /* Contact Section */
    .contact-layout {
      display: grid;
      grid-template-columns: 1fr 1.25fr;
      gap: 40px;
    }
    .contact-details {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .contact-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
    }
    .contact-link {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #fff;
      text-decoration: none;
      font-size: 0.95rem;
      margin-bottom: 14px;
    }
    .contact-link i {
      color: var(--accent);
      width: 18px;
    }

    .form-box {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 28px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    .form-label {
      display: block;
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .form-control {
      width: 100%;
      background: #090a0f;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px 14px;
      color: #fff;
      font-family: var(--font);
      font-size: 0.9rem;
      transition: border-color 0.15s;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--accent);
    }

    /* Modal */
    .modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-backdrop.open { display: flex; }
    .modal-box {
      background: #11151f;
      border: 1px solid var(--border);
      border-radius: 14px;
      width: 100%;
      max-width: 680px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .modal-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-header h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #fff;
    }
    .modal-close {
      background: none;
      border: none;
      color: var(--text-dim);
      font-size: 1.4rem;
      cursor: pointer;
    }
    .modal-close:hover { color: #fff; }
    .modal-body {
      padding: 24px;
      overflow-y: auto;
    }

    /* Toast */
    .toast-tray {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2000;
    }
    .toast-msg {
      background: #181d2a;
      border: 1px solid var(--accent);
      color: #fff;
      padding: 12px 18px;
      border-radius: 8px;
      font-size: 0.88rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }

    /* Footer */
    footer {
      padding: 40px 0;
      color: var(--text-dim);
      font-size: 0.84rem;
    }
    .footer-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    @media (max-width: 900px) {
      .hero-grid { grid-template-columns: 1fr; }
      .contact-layout { grid-template-columns: 1fr; }
      .stats-strip { grid-template-columns: repeat(2, 1fr); gap: 20px; }
      .edu-row { grid-template-columns: 1fr; }
      .nav-links { display: none; }
    }
    @media (max-width: 600px) {
      .hero-title { font-size: 2.2rem; }
      .form-row { grid-template-columns: 1fr; }
      .projects-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

  <!-- Top Navigation -->
  <header>
    <div class="container nav-bar">
      <a href="#hero" class="brand">
        <div class="brand-avatar">SY</div>
        <div>
          <span class="brand-name">${profile.full_name}</span>
          <span class="brand-role">Flutter Developer</span>
        </div>
      </a>

      <ul class="nav-links">
        <li><a href="#projects">Apps &amp; Projects</a></li>
        <li><a href="#experience">Experience</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#education">Education</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <div class="nav-actions">
        <a href="/resume" target="_blank" class="btn btn-ghost btn-sm">
          <i class="fa-regular fa-file-pdf"></i> Resume
        </a>
        <a href="#contact" class="btn btn-primary btn-sm">
          Get in Touch
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="hero" class="hero">
    <div class="container">
      <div class="hero-grid">
        <div>
          <div class="status-badge">
            <span class="status-dot"></span>
            <span>Available for Flutter &amp; Mobile Roles</span>
          </div>

          <h1 class="hero-title">${profile.full_name}</h1>
          <div class="hero-subtitle">Senior Flutter Developer &amp; Mobile Engineer</div>

          <p class="hero-bio">
            I design, develop, and publish high-performance cross-platform applications for Android and iOS using <strong>Flutter and Dart</strong>. Specialized in Clean Architecture, reactive state management (BLoC, GetX), and local offline persistence (SQLite, Firebase).
          </p>

          <div class="hero-contacts">
            <span><i class="fa-solid fa-location-dot"></i> ${profile.location}</span>
            <a href="tel:${profile.phone}"><i class="fa-solid fa-phone"></i> ${profile.phone}</a>
            <a href="mailto:${profile.email}"><i class="fa-solid fa-envelope"></i> ${profile.email}</a>
            <a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-linkedin"></i> LinkedIn</a>
            <a href="${profile.github}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github"></i> GitHub</a>
          </div>

          <div class="hero-cta">
            <a href="/resume" target="_blank" class="btn btn-primary">
              <i class="fa-solid fa-arrow-down"></i> Download Resume (PDF)
            </a>
            <a href="#projects" class="btn btn-ghost">
              Explore 5 Store Apps ↓
            </a>
            <a href="https://wa.me/919140937250" target="_blank" rel="noopener noreferrer" class="btn btn-ghost" style="color: #34d399;">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </div>

        <!-- Phone Showcase Card -->
        <div class="phone-showcase-card">
          <div class="showcase-header">
            <span class="showcase-label">Published Store Apps Showcase</span>
            <span style="font-family: var(--mono); font-size: 0.75rem; color: #34d399;">5 Production Apps</span>
          </div>

          <div class="phone-tabs">
            <button class="phone-tab-btn active" onclick="switchAppTab('priystore', this)">PriyStore</button>
            <button class="phone-tab-btn" onclick="switchAppTab('gaelic', this)">Gaelic Stats</button>
            <button class="phone-tab-btn" onclick="switchAppTab('ten-crm', this)">Ten CRM</button>
            <button class="phone-tab-btn" onclick="switchAppTab('aks-bus', this)">Aks Bus</button>
            <button class="phone-tab-btn" onclick="switchAppTab('sports-pro', this)">Sports Pro</button>
          </div>

          <div class="app-preview-box" id="app-preview-box">
            <div>
              <div class="preview-app-title" id="prev-title">PriyStore</div>
              <div class="preview-app-sub" id="prev-category">eCommerce &amp; Custom Apparel</div>
              <p class="preview-app-desc" id="prev-desc">
                Flutter-based eCommerce application for designing and ordering custom-printed garments with real-time canvas preview, checkout, and push notification tracking.
              </p>
            </div>

            <div class="preview-app-meta">
              <span id="prev-platforms">Android</span>
              <div style="display: flex; gap: 8px;" id="prev-links">
                <a href="https://play.google.com/store/apps/details?id=com.priystore.app" target="_blank" class="btn btn-store"><i class="fa-brands fa-google-play"></i> Play Store</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="stats-strip">
        <div class="stat-box">
          <div class="stat-number">3+</div>
          <div class="stat-label">Years Commercial Experience</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">5</div>
          <div class="stat-label">Published Store Applications</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">150K+</div>
          <div class="stat-label">Total User Installs</div>
        </div>
        <div class="stat-box">
          <div class="stat-number" id="stats-likes-count">${metrics.total_likes || 437}</div>
          <div class="stat-label">Database Project Upvotes</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Projects Section -->
  <section id="projects" class="section">
    <div class="container">
      <div class="section-title-wrap">
        <div class="section-eyebrow">Production Portfolio</div>
        <h2 class="section-title">Selected Commercial Applications</h2>
        <p class="section-desc">
          Flagship mobile software designed, developed, and deployed to the Google Play Store and Apple App Store.
        </p>
      </div>

      <div class="projects-grid">
        ${initialProjectsHtml}
      </div>
    </div>
  </section>

  <!-- Experience Section -->
  <section id="experience" class="section">
    <div class="container">
      <div class="section-title-wrap">
        <div class="section-eyebrow">Work History</div>
        <h2 class="section-title">Professional Experience</h2>
      </div>

      <div class="experience-list">
        ${experience
          .map(
            (exp) => `
          <div class="exp-item">
            <div class="exp-meta">
              <div>
                <span class="exp-role">${exp.role}</span> &nbsp;•&nbsp; <span class="exp-company">${exp.company}</span>
              </div>
              <span class="exp-dates">${exp.period}</span>
            </div>
            <ul class="exp-points">
              ${exp.description.map((pt) => `<li>${pt}</li>`).join('')}
            </ul>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- Technical Skills Section -->
  <section id="skills" class="section">
    <div class="container">
      <div class="section-title-wrap">
        <div class="section-eyebrow">Technical Competencies</div>
        <h2 class="section-title">Engineering Stack &amp; Toolchain</h2>
        <p class="section-desc">
          Core technologies used daily across production mobile architecture, state management, and continuous delivery.
        </p>
      </div>

      <div class="skills-wrapper">
        ${initialSkillsHtml}
      </div>
    </div>
  </section>

  <!-- Education Section -->
  <section id="education" class="section">
    <div class="container">
      <div class="section-title-wrap">
        <div class="section-eyebrow">Academic Background</div>
        <h2 class="section-title">Education &amp; Qualifications</h2>
      </div>

      <div class="edu-row">
        ${education
          .map(
            (edu) => `
          <div class="edu-item">
            <h3 class="edu-title">${edu.degree}</h3>
            <div class="edu-sub">${edu.field}</div>
            <div class="edu-desc">${edu.institution} (${edu.university})</div>
            <div style="font-family: var(--mono); font-size: 0.78rem; color: var(--text-dim); margin-top: 8px;">
              ${edu.period}
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- Contact & Hire Me Section -->
  <section id="contact" class="section">
    <div class="container">
      <div class="section-title-wrap">
        <div class="section-eyebrow">Get In Touch</div>
        <h2 class="section-title">Start a Conversation</h2>
        <p class="section-desc">
          Whether you have an open Flutter / Mobile engineering role, a consulting request, or a project in mind.
        </p>
      </div>

      <div class="contact-layout">
        <div class="contact-details">
          <div class="contact-card">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 16px;">Direct Channels</h3>
            
            <a href="mailto:${profile.email}" class="contact-link">
              <i class="fa-solid fa-envelope"></i>
              <span>${profile.email}</span>
            </a>

            <a href="tel:${profile.phone}" class="contact-link">
              <i class="fa-solid fa-phone"></i>
              <span>${profile.phone}</span>
            </a>

            <div class="contact-link" style="color: var(--text-muted);">
              <i class="fa-solid fa-location-dot"></i>
              <span>${profile.location}</span>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
              <a href="https://wa.me/919140937250" target="_blank" rel="noopener noreferrer" class="btn btn-ghost" style="width: 100%; justify-content: center; color: #34d399;">
                <i class="fa-brands fa-whatsapp"></i> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div class="form-box">
          <h3 style="font-size: 1.1rem; font-weight: 600; color: #fff; margin-bottom: 16px;">Send a Direct Message</h3>
          
          <form id="contact-form" onsubmit="handleContactSubmit(event)">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Your Name *</label>
                <input type="text" id="c-name" required placeholder="Jane Doe" class="form-control">
              </div>
              <div class="form-group">
                <label class="form-label">Email Address *</label>
                <input type="email" id="c-email" required placeholder="jane@company.com" class="form-control">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Phone / WhatsApp</label>
                <input type="tel" id="c-phone" placeholder="+91 98765 43210" class="form-control">
              </div>
              <div class="form-group">
                <label class="form-label">Subject</label>
                <input type="text" id="c-subject" placeholder="Flutter Project / Opportunity" class="form-control">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Message *</label>
              <textarea id="c-message" required rows="4" placeholder="Tell me about the role, product requirements, or timeline..." class="form-control" style="resize: vertical;"></textarea>
            </div>

            <button type="submit" id="c-btn" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px;">
              Send Message (Saved to SQLite DB)
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- Inquiries Modal -->
  <div id="inbox-modal" class="modal-backdrop">
    <div class="modal-box">
      <div class="modal-header">
        <h3>Captured Inquiries (SQLite DB)</h3>
        <button class="modal-close" onclick="closeInboxModal()">&times;</button>
      </div>
      <div class="modal-body" id="inbox-list"></div>
    </div>
  </div>

  <!-- Specs Modal -->
  <div id="specs-modal" class="modal-backdrop">
    <div class="modal-box">
      <div class="modal-header">
        <h3 id="spec-modal-title">Architecture Specs</h3>
        <button class="modal-close" onclick="closeSpecsModal()">&times;</button>
      </div>
      <div class="modal-body" id="spec-modal-body"></div>
    </div>
  </div>

  <div id="toast-tray" class="toast-tray"></div>

  <!-- Footer -->
  <footer>
    <div class="container footer-inner">
      <div>
        <div style="font-weight: 600; color: #fff;">${profile.full_name}</div>
        <div style="color: var(--text-dim); font-size: 0.8rem; margin-top: 2px;">Senior Flutter Developer &nbsp;•&nbsp; ${profile.email}</div>
      </div>

      <div style="display: flex; gap: 16px;">
        <a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer" style="color: var(--text-muted); text-decoration: none;">LinkedIn</a>
        <a href="${profile.github}" target="_blank" rel="noopener noreferrer" style="color: var(--text-muted); text-decoration: none;">GitHub</a>
        <a href="/resume" target="_blank" style="color: var(--text-muted); text-decoration: none;">Resume</a>
        <a href="javascript:void(0)" onclick="openInboxModal()" style="color: var(--text-dim); text-decoration: none; font-size: 0.75rem;" title="Private Admin Inquiries (DB)">Admin</a>
      </div>
    </div>
  </footer>

  <script>
    const visitorFingerprint = 'visitor_' + Math.random().toString(36).substring(2, 9);

    const appData = {
      'priystore': {
        title: 'PriyStore',
        category: 'eCommerce & Custom Apparel',
        desc: 'Flutter-based eCommerce application for designing and ordering custom-printed garments with real-time canvas preview, checkout, and push notification tracking.',
        platforms: 'Android',
        links: '<a href="https://play.google.com/store/apps/details?id=com.priystore.app" target="_blank" class="btn btn-store"><i class="fa-brands fa-google-play"></i> Play Store</a>'
      },
      'gaelic': {
        title: 'Gaelic Stats App',
        category: 'Sports Analytics & Tactics',
        desc: 'Cross-platform sports performance tracker for hurling and football teams. High-frequency pitch coordinate event queue with offline SQLite sync.',
        platforms: 'Android & iOS',
        links: '<a href="https://play.google.com/store/apps/details?id=com.gaelic.stats" target="_blank" class="btn btn-store"><i class="fa-brands fa-google-play"></i> Play Store</a><a href="https://apps.apple.com/us/app/gaelic-stats-app/id6777976167" target="_blank" class="btn btn-store"><i class="fa-brands fa-apple"></i> App Store</a>'
      },
      'ten-crm': {
        title: 'Ten CRM',
        category: 'Enterprise Sales & Lead Operations',
        desc: 'Centralized sales pipeline tracker with role-based access, biometric login, offline contact caching, and real-time deal stage management.',
        platforms: 'Android & iOS',
        links: '<a href="https://play.google.com/store/apps/details?id=app.ten.crm" target="_blank" class="btn btn-store"><i class="fa-brands fa-google-play"></i> Play Store</a><a href="https://apps.apple.com/in/app/ten-crm/id6747057834" target="_blank" class="btn btn-store"><i class="fa-brands fa-apple"></i> App Store</a>'
      },
      'aks-bus': {
        title: 'Aks Bus',
        category: 'Transit & Ticket Reservation',
        desc: 'Regional intercity ticket booking application featuring dynamic 2x1 and 2x2 interactive sleeper seat map painter and instant SMS e-tickets.',
        platforms: 'Android',
        links: '<a href="https://play.google.com/store/apps/details?id=com.devolyt.aksbus" target="_blank" class="btn btn-store"><i class="fa-brands fa-google-play"></i> Play Store</a>'
      },
      'sports-pro': {
        title: 'Sports Pro',
        category: 'Live Video Streaming & Scores',
        desc: 'Low-latency HLS sports streaming platform with live match score overlays, ExoPlayer bridges, and gesture-controlled playback.',
        platforms: 'Android',
        links: '<a href="https://play.google.com/store/apps/details?id=com.sports.pro" target="_blank" class="btn btn-store"><i class="fa-brands fa-google-play"></i> Play Store</a>'
      }
    };

    function switchAppTab(key, btn) {
      document.querySelectorAll('.phone-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const item = appData[key];
      if (!item) return;

      document.getElementById('prev-title').innerText = item.title;
      document.getElementById('prev-category').innerText = item.category;
      document.getElementById('prev-desc').innerText = item.desc;
      document.getElementById('prev-platforms').innerText = item.platforms;
      document.getElementById('prev-links').innerHTML = item.links;
    }

    async function loadInboxCount() {
      try {
        const res = await fetch('/api/portfolio/messages');
        const json = await res.json();
        if (json.success) {
          const el = document.getElementById('nav-inbox-count');
          if (el) el.innerText = json.count;
        }
      } catch (e) {}
    }

    async function openInboxModal() {
      document.getElementById('inbox-modal').classList.add('open');
      const list = document.getElementById('inbox-list');
      list.innerHTML = '<div style="color:var(--text-dim); text-align:center; padding:20px;">Fetching from SQLite...</div>';

      try {
        const res = await fetch('/api/portfolio/messages');
        const json = await res.json();
        if (json.success) {
          if (json.data.length === 0) {
            list.innerHTML = '<div style="color:var(--text-dim); text-align:center; padding:20px;">No messages received yet.</div>';
            return;
          }
          list.innerHTML = json.data.map(m => \`
            <div style="background:#090a0f; border:1px solid var(--border); border-radius:8px; padding:16px; margin-bottom:12px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <strong style="color:#fff;">\${m.name} &lt;\${m.email}&gt;</strong>
                <span style="font-family:var(--mono); font-size:0.75rem; color:var(--text-dim);">\${new Date(m.created_at).toLocaleString()}</span>
              </div>
              <div style="color:#38bdf8; font-size:0.85rem; font-weight:600; margin-bottom:6px;">\${m.subject}</div>
              <p style="color:var(--text-muted); font-size:0.88rem; margin-bottom:12px;">\${m.message}</p>
              <div style="display:flex; justify-content:flex-end; gap:8px;">
                <a href="mailto:\${m.email}?subject=Re: \${encodeURIComponent(m.subject)}" class="btn btn-ghost btn-sm">Reply Email</a>
                \${m.phone ? \`<a href="https://wa.me/\${m.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-ghost btn-sm" style="color:#34d399;">WhatsApp</a>\` : ''}
              </div>
            </div>
          \`).join('');
        }
      } catch (e) {
        list.innerHTML = '<div style="color:#f43f5e; text-align:center;">Failed to load messages.</div>';
      }
    }

    function closeInboxModal() {
      document.getElementById('inbox-modal').classList.remove('open');
    }

    async function viewProjectDetails(id) {
      try {
        const res = await fetch('/api/portfolio/projects/' + id);
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          document.getElementById('spec-modal-title').innerText = p.title + ' — Architecture Specs';
          document.getElementById('spec-modal-body').innerHTML = \`
            <div style="margin-bottom:18px;">
              <div style="font-weight:600; color:#fff; font-size:1rem; margin-bottom:4px;">\${p.subtitle}</div>
              <p style="color:var(--text-muted); font-size:0.9rem; line-height:1.6;">\${p.description}</p>
            </div>

            <div style="background:#090a0f; border:1px solid var(--border); border-radius:8px; padding:16px; margin-bottom:16px;">
              <div style="font-size:0.78rem; font-family:var(--mono); color:#38bdf8; text-transform:uppercase; margin-bottom:6px;">Architectural Highlights</div>
              <p style="color:#e4e4e7; font-size:0.88rem; line-height:1.6;">\${p.architecture_notes}</p>
            </div>

            <div style="margin-bottom:16px;">
              <div style="font-size:0.84rem; font-weight:600; color:#fff; margin-bottom:8px;">Key Engineering Features</div>
              <ul style="list-style:none; padding:0;">
                \${(p.key_features || []).map(f => \`<li style="position:relative; padding-left:18px; color:var(--text-muted); font-size:0.86rem; margin-bottom:6px;"><span style="position:absolute; left:0; color:#10b981;">✓</span> \${f}</li>\`).join('')}
              </ul>
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:16px; padding-top:16px; border-top:1px solid var(--border);">
              \${(p.tech_stack || []).map(t => \`<span class="tech-tag">\${t}</span>\`).join('')}
            </div>
          \`;
          document.getElementById('specs-modal').classList.add('open');
        }
      } catch (e) {}
    }

    function closeSpecsModal() {
      document.getElementById('specs-modal').classList.remove('open');
    }

    async function likeProject(id, btn) {
      try {
        const res = await fetch(\`/api/portfolio/projects/\${id}/like\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fingerprint: visitorFingerprint })
        });
        const json = await res.json();
        if (json.success) {
          btn.querySelector('.like-count').innerText = json.data.likes;
          btn.classList.add('liked');
          showToast('Appreciation recorded in SQLite DB.');
        } else if (json.data && json.data.alreadyLiked) {
          showToast('You already appreciated this project.');
        }
      } catch (e) {}
    }

    async function handleContactSubmit(e) {
      e.preventDefault();
      const btn = document.getElementById('c-btn');
      btn.disabled = true;
      btn.innerText = 'Saving to SQLite...';

      const payload = {
        name: document.getElementById('c-name').value,
        email: document.getElementById('c-email').value,
        phone: document.getElementById('c-phone').value,
        subject: document.getElementById('c-subject').value,
        message: document.getElementById('c-message').value,
      };

      try {
        const res = await fetch('/api/portfolio/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          showToast('Inquiry recorded in database! Saurabh will get back to you.');
          document.getElementById('contact-form').reset();
          loadInboxCount();
        } else {
          showToast('Error: ' + json.message);
        }
      } catch (e) {
        showToast('Connection error submitting form.');
      } finally {
        btn.disabled = false;
        btn.innerText = 'Send Message (Saved to SQLite DB)';
      }
    }

    function showToast(msg) {
      const tray = document.getElementById('toast-tray');
      const el = document.createElement('div');
      el.className = 'toast-msg';
      el.innerText = msg;
      tray.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeInboxModal();
        closeSpecsModal();
      }
    });

    loadInboxCount();
  </script>
</body>
</html>`);
};
