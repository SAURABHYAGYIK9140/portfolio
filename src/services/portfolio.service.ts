import { db } from '../db';

export interface ProfileRecord {
  id: number;
  full_name: string;
  title: string;
  secondary_title: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  summary: string;
  years_experience: string;
  apps_published: number;
  total_downloads: string;
  code_reviews_done: string;
  availability: string;
  updated_at: string;
}

export interface SkillRecord {
  id: number;
  category: string;
  name: string;
  proficiency: number;
  level: string;
  badge?: string;
  sort_order: number;
}

export interface ExperienceRecord {
  id: number;
  role: string;
  company: string;
  period: string;
  location: string;
  is_current: number;
  description: string[];
  technologies: string[];
  sort_order: number;
}

export interface ProjectRecord {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  platforms: string;
  tech_stack: string[];
  play_store_url: string | null;
  app_store_url: string | null;
  live_url: string | null;
  github_url: string | null;
  badge: string | null;
  color_accent: string;
  likes_count: number;
  views_count: number;
  key_features: string[];
  architecture_notes: string | null;
  sort_order: number;
}

export interface EducationRecord {
  id: number;
  degree: string;
  field: string;
  institution: string;
  university: string;
  period: string;
  sort_order: number;
}

export interface ContactMessageRecord {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at: string;
  status: string;
}

export interface GuestbookRecord {
  id: number;
  author_name: string;
  author_role: string;
  message: string;
  rating: number;
  avatar_seed: string;
  created_at: string;
}

export class PortfolioService {
  static getProfile(): ProfileRecord {
    const row = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    return row as unknown as ProfileRecord;
  }

  static getSkills(): Record<string, SkillRecord[]> {
    const rows = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all() as unknown as SkillRecord[];
    const grouped: Record<string, SkillRecord[]> = {};
    for (const skill of rows) {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    }
    return grouped;
  }

  static getAllSkillsList(): SkillRecord[] {
    return db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all() as unknown as SkillRecord[];
  }

  static getExperience(): ExperienceRecord[] {
    const rows = db.prepare('SELECT * FROM experience ORDER BY sort_order ASC').all() as unknown as Array<{
      id: number;
      role: string;
      company: string;
      period: string;
      location: string;
      is_current: number;
      description_json: string;
      technologies_json: string;
      sort_order: number;
    }>;

    return rows.map((r) => ({
      id: r.id,
      role: r.role,
      company: r.company,
      period: r.period,
      location: r.location,
      is_current: r.is_current,
      description: JSON.parse(r.description_json || '[]'),
      technologies: JSON.parse(r.technologies_json || '[]'),
      sort_order: r.sort_order,
    }));
  }

  static getProjects(): ProjectRecord[] {
    const rows = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all() as unknown as Array<{
      id: string;
      title: string;
      category: string;
      subtitle: string;
      description: string;
      platforms: string;
      tech_stack_json: string;
      play_store_url: string | null;
      app_store_url: string | null;
      live_url: string | null;
      github_url: string | null;
      badge: string | null;
      color_accent: string;
      likes_count: number;
      views_count: number;
      key_features_json: string;
      architecture_notes: string | null;
      sort_order: number;
    }>;

    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      subtitle: p.subtitle,
      description: p.description,
      platforms: p.platforms,
      tech_stack: JSON.parse(p.tech_stack_json || '[]'),
      play_store_url: p.play_store_url,
      app_store_url: p.app_store_url,
      live_url: p.live_url,
      github_url: p.github_url,
      badge: p.badge,
      color_accent: p.color_accent,
      likes_count: p.likes_count,
      views_count: p.views_count,
      key_features: JSON.parse(p.key_features_json || '[]'),
      architecture_notes: p.architecture_notes,
      sort_order: p.sort_order,
    }));
  }

  static getProjectById(id: string): ProjectRecord | null {
    const p = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as unknown as {
      id: string;
      title: string;
      category: string;
      subtitle: string;
      description: string;
      platforms: string;
      tech_stack_json: string;
      play_store_url: string | null;
      app_store_url: string | null;
      live_url: string | null;
      github_url: string | null;
      badge: string | null;
      color_accent: string;
      likes_count: number;
      views_count: number;
      key_features_json: string;
      architecture_notes: string | null;
      sort_order: number;
    } | undefined;

    if (!p) return null;

    // increment view count
    db.prepare('UPDATE projects SET views_count = views_count + 1 WHERE id = ?').run(id);

    return {
      id: p.id,
      title: p.title,
      category: p.category,
      subtitle: p.subtitle,
      description: p.description,
      platforms: p.platforms,
      tech_stack: JSON.parse(p.tech_stack_json || '[]'),
      play_store_url: p.play_store_url,
      app_store_url: p.app_store_url,
      live_url: p.live_url,
      github_url: p.github_url,
      badge: p.badge,
      color_accent: p.color_accent,
      likes_count: p.likes_count,
      views_count: p.views_count + 1,
      key_features: JSON.parse(p.key_features_json || '[]'),
      architecture_notes: p.architecture_notes,
      sort_order: p.sort_order,
    };
  }

  static likeProject(projectId: string, fingerprint: string): { success: boolean; likes: number; alreadyLiked?: boolean } {
    try {
      db.prepare(`
        INSERT INTO project_likes (project_id, visitor_fingerprint, created_at)
        VALUES (?, ?, datetime('now'))
      `).run(projectId, fingerprint);

      db.prepare('UPDATE projects SET likes_count = likes_count + 1 WHERE id = ?').run(projectId);
      db.prepare("UPDATE site_metrics SET metric_value = metric_value + 1 WHERE metric_key = 'total_likes'").run();

      const proj = db.prepare('SELECT likes_count FROM projects WHERE id = ?').get(projectId) as unknown as { likes_count: number };
      return { success: true, likes: proj?.likes_count || 0 };
    } catch {
      // already liked
      const proj = db.prepare('SELECT likes_count FROM projects WHERE id = ?').get(projectId) as unknown as { likes_count: number };
      return { success: false, alreadyLiked: true, likes: proj?.likes_count || 0 };
    }
  }

  static getEducation(): EducationRecord[] {
    return db.prepare('SELECT * FROM education ORDER BY sort_order ASC').all() as unknown as EducationRecord[];
  }

  static getGuestbook(): GuestbookRecord[] {
    return db.prepare('SELECT * FROM guestbook WHERE is_approved = 1 ORDER BY id DESC').all() as unknown as GuestbookRecord[];
  }

  static addGuestbookEntry(name: string, role: string, message: string, rating: number = 5): GuestbookRecord {
    const initials = name
      .trim()
      .split(' ')
      .map((w) => w[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join('') || 'SY';

    const insert = db.prepare(`
      INSERT INTO guestbook (author_name, author_role, message, rating, avatar_seed, created_at, is_approved)
      VALUES (?, ?, ?, ?, ?, datetime('now'), 1)
    `);

    const info = insert.run(name.trim(), role.trim() || 'Tech Collaborator', message.trim(), Math.min(5, Math.max(1, rating)), initials);
    const row = db.prepare('SELECT * FROM guestbook WHERE id = ?').get(Number(info.lastInsertRowid));
    return row as unknown as GuestbookRecord;
  }

  static saveContactMessage(name: string, email: string, phone: string, subject: string, message: string): ContactMessageRecord {
    const insert = db.prepare(`
      INSERT INTO contact_messages (name, email, phone, subject, message, created_at, status)
      VALUES (?, ?, ?, ?, ?, datetime('now'), 'unread')
    `);

    const info = insert.run(name.trim(), email.trim(), phone.trim() || null, subject.trim() || 'New Portfolio Inquiry', message.trim());
    return db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(Number(info.lastInsertRowid)) as unknown as ContactMessageRecord;
  }

  static getContactMessages(): ContactMessageRecord[] {
    return db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all() as unknown as ContactMessageRecord[];
  }

  static markMessageStatus(id: number, status: 'read' | 'replied' | 'unread'): boolean {
    const res = db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id);
    return Number(res.changes) > 0;
  }

  static deleteContactMessage(id: number): boolean {
    const res = db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
    return Number(res.changes) > 0;
  }

  static getMetrics(): Record<string, number> {
    const rows = db.prepare('SELECT * FROM site_metrics').all() as unknown as Array<{ metric_key: string; metric_value: number }>;
    const metrics: Record<string, number> = {};
    for (const r of rows) {
      metrics[r.metric_key] = r.metric_value;
    }
    return metrics;
  }

  static recordMetricIncrement(key: string): void {
    db.prepare(`
      INSERT INTO site_metrics (metric_key, metric_value, updated_at)
      VALUES (?, 1, datetime('now'))
      ON CONFLICT(metric_key) DO UPDATE SET
        metric_value = metric_value + 1,
        updated_at = datetime('now')
    `).run(key);
  }
}
