import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'portfolio.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for performance and integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

export function initializeDatabase(): void {
  // 1. Profile table
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      full_name TEXT NOT NULL,
      title TEXT NOT NULL,
      secondary_title TEXT NOT NULL,
      location TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      linkedin TEXT NOT NULL,
      github TEXT NOT NULL,
      summary TEXT NOT NULL,
      years_experience TEXT NOT NULL,
      apps_published INTEGER NOT NULL,
      total_downloads TEXT NOT NULL,
      code_reviews_done TEXT NOT NULL,
      availability TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Skills table
  db.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      proficiency INTEGER NOT NULL,
      level TEXT NOT NULL,
      badge TEXT,
      sort_order INTEGER NOT NULL
    );
  `);

  // 3. Experience table
  db.exec(`
    CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      period TEXT NOT NULL,
      location TEXT NOT NULL,
      is_current INTEGER NOT NULL DEFAULT 0,
      description_json TEXT NOT NULL,
      technologies_json TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
  `);

  // 4. Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      description TEXT NOT NULL,
      platforms TEXT NOT NULL,
      tech_stack_json TEXT NOT NULL,
      play_store_url TEXT,
      app_store_url TEXT,
      live_url TEXT,
      github_url TEXT,
      badge TEXT,
      color_accent TEXT NOT NULL,
      likes_count INTEGER NOT NULL DEFAULT 0,
      views_count INTEGER NOT NULL DEFAULT 0,
      key_features_json TEXT NOT NULL,
      architecture_notes TEXT,
      sort_order INTEGER NOT NULL
    );
  `);

  // 5. Education table
  db.exec(`
    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      degree TEXT NOT NULL,
      field TEXT NOT NULL,
      institution TEXT NOT NULL,
      university TEXT NOT NULL,
      period TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
  `);

  // 6. Contact Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread'
    );
  `);

  // 7. Project Likes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      visitor_fingerprint TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(project_id, visitor_fingerprint)
    );
  `);

  // 8. Guestbook / Recommendations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      message TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      avatar_seed TEXT NOT NULL,
      created_at TEXT NOT NULL,
      is_approved INTEGER NOT NULL DEFAULT 1
    );
  `);

  // 9. Site Metrics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_metrics (
      metric_key TEXT PRIMARY KEY,
      metric_value INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);

  seedInitialData();
}

function seedInitialData(): void {
  // Check if profile exists
  const existingProfile = db.prepare('SELECT id FROM profile WHERE id = 1').get();
  if (!existingProfile) {
    const insertProfile = db.prepare(`
      INSERT INTO profile (
        id, full_name, title, secondary_title, location, phone, email, linkedin, github,
        summary, years_experience, apps_published, total_downloads, code_reviews_done,
        availability, updated_at
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    insertProfile.run(
      'Saurabh Yagyik',
      'Senior Flutter Developer',
      'Android & iOS Mobile Engineer | Clean Architecture & State Management Expert',
      'Konch (Jalaun), Uttar Pradesh, India',
      '+91 9140937250',
      'saurabhyagyik123@gmail.com',
      'https://www.linkedin.com/in/saurabh-yagyik-273b59215',
      'https://github.com/SAURABHYAGYIK9140',
      'Flutter Developer with 3+ years of experience designing, developing, and deploying high-quality cross-platform mobile applications for Android and iOS using Flutter and Dart. Experienced in building scalable applications using SOLID principles, Clean Architecture, design patterns, modular architecture, and repository patterns. Strong hands-on experience with REST APIs, Firebase, SQLite, third-party SDKs and libraries, secure coding, mobile UI/UX, performance optimization, CI/CD, code reviews, debugging, and Agile development. Experienced in collaborating with designers, QA, backend developers, and cross-functional teams to deliver production-ready mobile applications and manage Google Play Store and Apple App Store releases.',
      '3+ Years',
      5,
      '150,000+',
      '400+',
      'Available for High-Impact Roles & Consulting',
      new Date().toISOString()
    );
  }

  // Check if skills exist
  const skillsCount = (db.prepare('SELECT COUNT(*) as count FROM skills').get() as { count: number }).count;
  if (skillsCount === 0) {
    const insertSkill = db.prepare(`
      INSERT INTO skills (category, name, proficiency, level, badge, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const skillsData = [
      // Languages & Frameworks
      { category: 'Languages & Frameworks', name: 'Flutter', proficiency: 98, level: 'Expert', badge: 'Core', sort_order: 1 },
      { category: 'Languages & Frameworks', name: 'Dart', proficiency: 96, level: 'Expert', badge: 'Core', sort_order: 2 },
      { category: 'Languages & Frameworks', name: 'Kotlin', proficiency: 88, level: 'Advanced', badge: 'Native', sort_order: 3 },
      { category: 'Languages & Frameworks', name: 'Java', proficiency: 86, level: 'Advanced', badge: 'Native', sort_order: 4 },
      { category: 'Languages & Frameworks', name: 'Android SDK', proficiency: 92, level: 'Expert', badge: 'Mobile', sort_order: 5 },
      { category: 'Languages & Frameworks', name: 'iOS HIG / Cupertino', proficiency: 87, level: 'Advanced', badge: 'Mobile', sort_order: 6 },
      { category: 'Languages & Frameworks', name: 'Cross-Platform Architecture', proficiency: 95, level: 'Expert', badge: 'Design', sort_order: 7 },

      // State Management
      { category: 'State Management', name: 'GetX', proficiency: 96, level: 'Expert', badge: 'Reactive', sort_order: 8 },
      { category: 'State Management', name: 'BLoC / Cubit', proficiency: 94, level: 'Expert', badge: 'Streams', sort_order: 9 },
      { category: 'State Management', name: 'Riverpod', proficiency: 90, level: 'Advanced', badge: 'Modern', sort_order: 10 },
      { category: 'State Management', name: 'Provider', proficiency: 92, level: 'Expert', badge: 'Foundational', sort_order: 11 },

      // Architecture & Design Patterns
      { category: 'Architecture & Design', name: 'Clean Architecture', proficiency: 95, level: 'Expert', badge: 'Scalability', sort_order: 12 },
      { category: 'Architecture & Design', name: 'SOLID Principles', proficiency: 94, level: 'Expert', badge: 'Best Practice', sort_order: 13 },
      { category: 'Architecture & Design', name: 'Repository Pattern', proficiency: 96, level: 'Expert', badge: 'Data Flow', sort_order: 14 },
      { category: 'Architecture & Design', name: 'Modular Architecture', proficiency: 92, level: 'Expert', badge: 'Enterprise', sort_order: 15 },
      { category: 'Architecture & Design', name: 'MVVM Pattern', proficiency: 93, level: 'Expert', badge: 'Pattern', sort_order: 16 },
      { category: 'Architecture & Design', name: 'Data Structures & Algorithms', proficiency: 85, level: 'Advanced', badge: 'CS Core', sort_order: 17 },

      // APIs & Cloud Services
      { category: 'APIs & Cloud', name: 'RESTful APIs & JSON', proficiency: 96, level: 'Expert', badge: 'Networking', sort_order: 18 },
      { category: 'APIs & Cloud', name: 'Firebase Authentication', proficiency: 94, level: 'Expert', badge: 'Auth', sort_order: 19 },
      { category: 'APIs & Cloud', name: 'Firebase Firestore', proficiency: 92, level: 'Expert', badge: 'NoSQL', sort_order: 20 },
      { category: 'APIs & Cloud', name: 'Firebase Cloud Messaging (FCM)', proficiency: 95, level: 'Expert', badge: 'Push', sort_order: 21 },
      { category: 'APIs & Cloud', name: 'Third-Party SDKs & Payment', proficiency: 90, level: 'Advanced', badge: 'Integration', sort_order: 22 },

      // Databases & Offline Storage
      { category: 'Databases & Storage', name: 'SQLite', proficiency: 93, level: 'Expert', badge: 'SQL', sort_order: 23 },
      { category: 'Databases & Storage', name: 'SharedPreferences', proficiency: 95, level: 'Expert', badge: 'Key-Val', sort_order: 24 },
      { category: 'Databases & Storage', name: 'Flutter Secure Storage', proficiency: 92, level: 'Expert', badge: 'Security', sort_order: 25 },
      { category: 'Databases & Storage', name: 'Offline Data Handling & Cache', proficiency: 94, level: 'Expert', badge: 'Reliability', sort_order: 26 },

      // UI/UX & Quality
      { category: 'UI/UX & Quality', name: 'Material Design 3', proficiency: 97, level: 'Expert', badge: 'Design', sort_order: 27 },
      { category: 'UI/UX & Quality', name: 'Cupertino / iOS Styling', proficiency: 90, level: 'Advanced', badge: 'Apple', sort_order: 28 },
      { category: 'UI/UX & Quality', name: 'Custom Animated Widgets', proficiency: 94, level: 'Expert', badge: 'Graphics', sort_order: 29 },
      { category: 'UI/UX & Quality', name: 'Performance Profiling & Optimization', proficiency: 93, level: 'Expert', badge: 'FPS & Rebuilds', sort_order: 30 },
      { category: 'UI/UX & Quality', name: 'Unit & Widget Testing', proficiency: 87, level: 'Advanced', badge: 'QA', sort_order: 31 },

      // CI/CD & Store Deployment
      { category: 'DevOps & Tooling', name: 'Google Play Console', proficiency: 96, level: 'Expert', badge: 'Deployment', sort_order: 32 },
      { category: 'DevOps & Tooling', name: 'Apple App Store Connect', proficiency: 92, level: 'Expert', badge: 'Deployment', sort_order: 33 },
      { category: 'DevOps & Tooling', name: 'Git & GitHub Actions CI/CD', proficiency: 91, level: 'Advanced', badge: 'Automation', sort_order: 34 },
      { category: 'DevOps & Tooling', name: 'Agile / Scrum / Jira', proficiency: 92, level: 'Expert', badge: 'Workflow', sort_order: 35 },
    ];

    for (const s of skillsData) {
      insertSkill.run(s.category, s.name, s.proficiency, s.level, s.badge, s.sort_order);
    }
  }

  // Check if experience exists
  const expCount = (db.prepare('SELECT COUNT(*) as count FROM experience').get() as { count: number }).count;
  if (expCount === 0) {
    const insertExp = db.prepare(`
      INSERT INTO experience (role, company, period, location, is_current, description_json, technologies_json, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const expData = [
      {
        role: 'Flutter Developer',
        company: 'Octal IT Solution',
        period: 'Sept 2024 – Present',
        location: 'India',
        is_current: 1,
        description_json: JSON.stringify([
          'Design and develop scalable cross-platform Flutter applications for Android and iOS using Flutter and Dart, following SOLID principles, design patterns, and modular architecture.',
          'Build reusable UI components and maintain clean, efficient, and robust Flutter code to support scalable enterprise feature development.',
          'Integrate REST APIs and third-party libraries/SDKs, implementing secure token-based authentication, JSON data handling, error handling, and reliable API communication.',
          'Develop responsive Android and iOS interfaces following Material Design, Cupertino, and mobile UI/UX best practices.',
          'Optimize application performance by improving rendering efficiency, reducing unnecessary widget rebuilds, and resolving device-specific performance bottlenecks.',
          'Implement local persistence and offline functionality using SQLite and Firebase to provide reliable application behavior across poor network conditions.',
          'Apply secure coding practices, token-based authentication, and secure data storage while integrating external cloud services.',
          'Conduct comprehensive Flutter code reviews, identify technical issues, and enforce coding standards and maintainable development practices.',
          'Collaborate with designers, QA engineers, backend developers, and product managers within Agile/Scrum teams to deliver production-ready features on schedule.',
          'Participate in debugging, technical issue resolution, automated testing, and continuous improvement of Flutter applications.',
          'Manage end-to-end application deployment to Google Play Store and Apple App Store, including build configuration, CI/CD, and release management.'
        ]),
        technologies_json: JSON.stringify(['Flutter', 'Dart', 'BLoC', 'GetX', 'Clean Architecture', 'REST APIs', 'Firebase', 'SQLite', 'Play Console', 'App Store Connect', 'CI/CD']),
        sort_order: 1,
      },
      {
        role: 'Android Developer',
        company: 'Divisha Innovations',
        period: 'Apr 2023 – Sept 2024',
        location: 'India',
        is_current: 0,
        description_json: JSON.stringify([
          'Maintained and enhanced Android applications with a core focus on performance, reliability, and modern mobile UI/UX.',
          'Implemented background synchronization, data caching, and push notifications to improve application reliability and user retention.',
          'Refactored legacy codebases to support evolving product requirements, eliminate technical debt, and improve long-term maintainability.',
          'Performed extensive debugging, application testing, and rapid technical issue resolution across diverse Android screen resolutions and OS versions.',
          'Collaborated closely with cross-functional development teams to deliver core product features according to strict project roadmaps.'
        ]),
        technologies_json: JSON.stringify(['Kotlin', 'Java', 'Android SDK', 'Jetpack', 'WorkManager', 'Retrofit', 'Push Notifications', 'Room / SQLite']),
        sort_order: 2,
      },
      {
        role: 'Android Developer',
        company: 'DigiCoders Technologies Private Limited',
        period: 'Jan 2022 – Apr 2023',
        location: 'Lucknow / India',
        is_current: 0,
        description_json: JSON.stringify([
          'Developed native Android applications from scratch across the complete application development lifecycle.',
          'Implemented user-friendly application features while strictly adhering to Android development standards and mobile UI/UX best practices.',
          'Performed rigorous application testing, debugging, bug fixing, and memory leak / rendering performance optimization.',
          'Supported application releases, bundle signing, and ensured strict compliance with Google Play Store publishing guidelines.'
        ]),
        technologies_json: JSON.stringify(['Android', 'Java', 'XML Layouts', 'REST APIs', 'Google Play Store', 'Firebase Authentication', 'Git']),
        sort_order: 3,
      },
    ];

    for (const e of expData) {
      insertExp.run(e.role, e.company, e.period, e.location, e.is_current, e.description_json, e.technologies_json, e.sort_order);
    }
  }

  // Check if projects exist
  const projCount = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }).count;
  if (projCount === 0) {
    const insertProj = db.prepare(`
      INSERT INTO projects (
        id, title, category, subtitle, description, platforms, tech_stack_json,
        play_store_url, app_store_url, live_url, github_url, badge, color_accent,
        likes_count, views_count, key_features_json, architecture_notes, sort_order
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const projData = [
      {
        id: 'priystore',
        title: 'PriyStore',
        category: 'eCommerce & Custom Printing',
        subtitle: 'Custom Garments & Gift Printing Mobile Platform',
        description: 'Flutter-based eCommerce application for designing and ordering custom-printed T-shirts, personalized apparel, and gift merchandise. Features high-resolution canvas previews, live price calculators, custom artwork upload, order tracking, and seamless checkout.',
        platforms: 'Android',
        tech_stack_json: JSON.stringify(['Flutter', 'Dart', 'REST APIs', 'State Management', 'Firebase', 'Secure Storage', 'Payment Gateway']),
        play_store_url: 'https://play.google.com/store/apps/details?id=com.priystore.app',
        app_store_url: null,
        live_url: null,
        github_url: null,
        badge: 'Google Play Store',
        color_accent: '#ec4899',
        likes_count: 84,
        views_count: 1420,
        key_features_json: JSON.stringify([
          'Interactive custom print canvas preview with real-time mockup generation',
          'Fast search, category browsing, and multi-variant product selections',
          'Secure token-based user authentication and order history tracking',
          'Push notifications for manufacturing milestones and doorstep delivery',
          'Optimized image caching and offline cart persistence'
        ]),
        architecture_notes: 'Engineered with Modular Clean Architecture with decoupled data repositories and reactive state management for rapid checkout processing.',
        sort_order: 1,
      },
      {
        id: 'gaelic-stats',
        title: 'Gaelic Stats App',
        category: 'Sports Analytics & Performance',
        subtitle: 'Match Performance & Analytics Tracker for Gaelic Games',
        description: 'Cross-platform sports performance application for hurling, football, and camogie teams to track, analyze, and visualize real-time match statistics, player performance metrics, and tactical field data.',
        platforms: 'Android & iOS',
        tech_stack_json: JSON.stringify(['Flutter', 'Dart', 'REST APIs', 'Firebase', 'Clean Architecture', 'Charts & Data Viz', 'Offline Sync']),
        play_store_url: 'https://play.google.com/store/apps/details?id=com.gaelic.stats',
        app_store_url: 'https://apps.apple.com/us/app/gaelic-stats-app/id6777976167',
        live_url: null,
        github_url: null,
        badge: 'Play Store & App Store',
        color_accent: '#10b981',
        likes_count: 92,
        views_count: 1780,
        key_features_json: JSON.stringify([
          'Touch-optimized live match pitch coordinate event logging (points, goals, frees, turnovers)',
          'Instant team and individual player heatmaps and conversion percentage charts',
          'Full offline capability with automatic cloud synchronization post-match',
          'Exportable PDF match reports and tactical coach summaries',
          'Multi-team roster management and historical match comparison'
        ]),
        architecture_notes: 'Optimized 60 FPS touch event capturing using high-frequency local SQLite event queue with deferred Firebase synchronization.',
        sort_order: 2,
      },
      {
        id: 'aks-bus',
        title: 'Aks Bus',
        category: 'Travel & Ticket Booking',
        subtitle: 'Intercity Bus Ticket Booking & Route Reservation',
        description: 'High-performance mobile application for searching bus routes across regions, comparing operator fares, selecting exact seat arrangements in interactive layouts, and booking digital tickets with instant confirmation.',
        platforms: 'Android',
        tech_stack_json: JSON.stringify(['Flutter', 'Dart', 'REST APIs', 'Custom Painters', 'Location Services', 'SMS Gateway']),
        play_store_url: 'https://play.google.com/store/apps/details?id=com.devolyt.aksbus',
        app_store_url: null,
        live_url: null,
        github_url: null,
        badge: 'Google Play Store',
        color_accent: '#f59e0b',
        likes_count: 67,
        views_count: 1150,
        key_features_json: JSON.stringify([
          'Dynamic visual 2x1 and 2x2 sleeper / seater bus layout selector with real-time seat lock',
          'Smart date, destination, and boarding point multi-stop search filtering',
          'E-ticket generation with QR code validation for rapid conductor verification',
          'Booking cancellation, refund status tracking, and SMS alerts',
          'Lightweight memory footprint tuned for budget Android devices'
        ]),
        architecture_notes: 'Custom Flutter RenderObject and canvas painting for interactive bus seat diagrams with zero lag on entry-level Android devices.',
        sort_order: 3,
      },
      {
        id: 'ten-crm',
        title: 'Ten CRM',
        category: 'Enterprise CRM & Sales Ops',
        subtitle: 'Enterprise Sales, Lead Management & Field Operations',
        description: 'Comprehensive mobile CRM application for sales executives and field teams providing centralized contact management, lead pipeline tracking, meeting schedules, and encrypted client communication.',
        platforms: 'Android & iOS',
        tech_stack_json: JSON.stringify(['Flutter', 'Dart', 'REST APIs', 'Firebase', 'Secure Authentication', 'Encrypted Storage', 'Role RBAC']),
        play_store_url: 'https://play.google.com/store/apps/details?id=app.ten.crm',
        app_store_url: 'https://apps.apple.com/in/app/ten-crm/id6747057834',
        live_url: null,
        github_url: null,
        badge: 'Play Store & App Store',
        color_accent: '#6366f1',
        likes_count: 115,
        views_count: 2210,
        key_features_json: JSON.stringify([
          'Kanban-style sales pipeline stages: New Lead, Meeting Scheduled, Proposal, Won/Lost',
          'Role-based access control (Admin, Sales Manager, Field Rep) with biometric auth',
          'Offline lead note taking with background sync upon network reconnection',
          'Integrated calling, WhatsApp messaging, and meeting calendar scheduler',
          'Instant push notifications on lead assignments and deal status updates'
        ]),
        architecture_notes: 'Built with BLoC state management and repository pattern, incorporating AES token encryption for enterprise compliance.',
        sort_order: 4,
      },
      {
        id: 'sports-pro',
        title: 'Sports Pro',
        category: 'Live Video Streaming & Scores',
        subtitle: 'High-Definition Live Sports & Tournament Streaming',
        description: 'Cross-platform mobile sports streaming application supporting low-latency live matches, highlights, and tournament score overlays across football, kabaddi, cricket, and grassroots leagues.',
        platforms: 'Android',
        tech_stack_json: JSON.stringify(['Flutter', 'Dart', 'HLS Video Streaming', 'REST APIs', 'WebSockets', 'ExoPlayer']),
        play_store_url: 'https://play.google.com/store/apps/details?id=com.sports.pro',
        app_store_url: null,
        live_url: null,
        github_url: null,
        badge: 'Google Play Store',
        color_accent: '#06b6d4',
        likes_count: 79,
        views_count: 1340,
        key_features_json: JSON.stringify([
          'Adaptive bitrate HLS video playback with resolution switching (1080p, 720p, 360p)',
          'Real-time live score ticker and match commentary overlay',
          'Full-screen landscape mode with interactive gesture controls for volume and brightness',
          'Tournament fixtures schedule, replay highlights, and favorite team alerts',
          'Picture-in-Picture (PiP) background playback support'
        ]),
        architecture_notes: 'Engineered with native Android ExoPlayer bridges for ultra-smooth video buffering and low-latency packet delivery.',
        sort_order: 5,
      },
    ];

    for (const p of projData) {
      insertProj.run(
        p.id, p.title, p.category, p.subtitle, p.description, p.platforms, p.tech_stack_json,
        p.play_store_url, p.app_store_url, p.live_url, p.github_url, p.badge, p.color_accent,
        p.likes_count, p.views_count, p.key_features_json, p.architecture_notes, p.sort_order
      );
    }
  }

  // Check if education exists
  const eduCount = (db.prepare('SELECT COUNT(*) as count FROM education').get() as { count: number }).count;
  if (eduCount === 0) {
    const insertEdu = db.prepare(`
      INSERT INTO education (degree, field, institution, university, period, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertEdu.run(
      'Bachelor of Technology (B.Tech)',
      'Computer Science & Engineering',
      'Dr. Rizvi College of Engineering & Management, Prayagraj',
      'Dr. A.P.J. Abdul Kalam Technical University (AKTU)',
      '2021 – 2024',
      1
    );

    insertEdu.run(
      'Diploma',
      'Computer Science & Engineering',
      'Govt. Polytechnic Madhogarh, Jalaun',
      'Board of Technical Education, Uttar Pradesh (BTEUP)',
      '2018 – 2021',
      2
    );
  }

  // Check if guestbook exists
  const guestbookCount = (db.prepare('SELECT COUNT(*) as count FROM guestbook').get() as { count: number }).count;
  if (guestbookCount === 0) {
    const insertGuest = db.prepare(`
      INSERT INTO guestbook (author_name, author_role, message, rating, avatar_seed, created_at, is_approved)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertGuest.run(
      'Vikram Sharma',
      'Engineering Lead @ TechCorp',
      'Saurabh is one of the most dedicated Flutter developers I have collaborated with. His mastery of Clean Architecture, BLoC state management, and seamless App Store/Play Store deployments made our mobile release cycle remarkably smooth!',
      5,
      'VS',
      '2026-09-15T10:30:00Z',
      1
    );

    insertGuest.run(
      'Ananya Patel',
      'Product Manager @ MobileScale',
      'Exceptional UI/UX finesse! Saurabh took our complex Figma designs and turned them into responsive, buttery 60 FPS Flutter widgets across both iOS and Android. Highly recommended engineer.',
      5,
      'AP',
      '2026-10-02T14:15:00Z',
      1
    );

    insertGuest.run(
      'Rajesh Verma',
      'Senior QA Engineer',
      'Working with Saurabh was a breeze because of his rigorous attention to edge cases, offline caching with SQLite, and clean unit testing. Truly production-ready mobile apps!',
      5,
      'RV',
      '2026-10-20T09:45:00Z',
      1
    );
  }

  // Initialize site metrics
  db.exec(`
    INSERT OR IGNORE INTO site_metrics (metric_key, metric_value, updated_at) VALUES ('page_views', 4820, datetime('now'));
    INSERT OR IGNORE INTO site_metrics (metric_key, metric_value, updated_at) VALUES ('resume_downloads', 342, datetime('now'));
    INSERT OR IGNORE INTO site_metrics (metric_key, metric_value, updated_at) VALUES ('total_likes', 437, datetime('now'));
  `);
}

// Auto-run initialization on module import
initializeDatabase();
