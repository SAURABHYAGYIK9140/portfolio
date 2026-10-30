import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { PortfolioService } from '../services/portfolio.service';

export class PortfolioController {
  static getFullPortfolioData = (_req: Request, res: Response): void => {
    try {
      PortfolioService.recordMetricIncrement('page_views');

      const profile = PortfolioService.getProfile();
      const skills = PortfolioService.getSkills();
      const skillsList = PortfolioService.getAllSkillsList();
      const experience = PortfolioService.getExperience();
      const projects = PortfolioService.getProjects();
      const education = PortfolioService.getEducation();
      const guestbook = PortfolioService.getGuestbook();
      const metrics = PortfolioService.getMetrics();

      res.status(200).json({
        success: true,
        data: {
          profile,
          skills,
          skillsList,
          experience,
          projects,
          education,
          guestbook,
          metrics,
        },
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch portfolio data' });
    }
  };

  static getProfile = (_req: Request, res: Response): void => {
    try {
      const profile = PortfolioService.getProfile();
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
  };

  static getSkills = (_req: Request, res: Response): void => {
    try {
      const skills = PortfolioService.getSkills();
      res.status(200).json({ success: true, data: skills });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching skills' });
    }
  };

  static getExperience = (_req: Request, res: Response): void => {
    try {
      const experience = PortfolioService.getExperience();
      res.status(200).json({ success: true, data: experience });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching experience' });
    }
  };

  static getProjects = (_req: Request, res: Response): void => {
    try {
      const projects = PortfolioService.getProjects();
      res.status(200).json({ success: true, data: projects });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching projects' });
    }
  };

  static getProjectById = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const project = PortfolioService.getProjectById(String(id));
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }
      res.status(200).json({ success: true, data: project });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching project' });
    }
  };

  static likeProject = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const { fingerprint } = req.body || {};
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const fp = fingerprint || `${ip}_${req.headers['user-agent'] || 'visitor'}`;

      const result = PortfolioService.likeProject(String(id), fp);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error liking project' });
    }
  };

  static getEducation = (_req: Request, res: Response): void => {
    try {
      const education = PortfolioService.getEducation();
      res.status(200).json({ success: true, data: education });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching education' });
    }
  };

  static getGuestbook = (_req: Request, res: Response): void => {
    try {
      const entries = PortfolioService.getGuestbook();
      res.status(200).json({ success: true, data: entries });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching guestbook' });
    }
  };

  static addGuestbook = (req: Request, res: Response): void => {
    try {
      const { name, role, message, rating } = req.body || {};
      if (!name || !message) {
        res.status(400).json({ success: false, message: 'Name and message are required' });
        return;
      }

      const entry = PortfolioService.addGuestbookEntry(name, role, message, Number(rating) || 5);
      res.status(201).json({
        success: true,
        message: 'Recommendation / note added to guestbook!',
        data: entry,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error submitting to guestbook' });
    }
  };

  static submitContact = (req: Request, res: Response): void => {
    try {
      const { name, email, phone, subject, message } = req.body || {};
      if (!name || !email || !message) {
        res.status(400).json({ success: false, message: 'Name, email, and message are required' });
        return;
      }

      // Basic email check
      if (!email.includes('@') || !email.includes('.')) {
        res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        return;
      }

      const record = PortfolioService.saveContactMessage(
        name,
        email,
        phone || '',
        subject || 'New Mobile App Project Inquiry',
        message
      );

      res.status(201).json({
        success: true,
        message: 'Thank you! Your message has been saved in Saurabh Yagyik\'s database. He will get back to you shortly.',
        data: record,
      });
    } catch (error) {
      console.error('Contact error:', error);
      res.status(500).json({ success: false, message: 'Failed to record message in database' });
    }
  };

  static getContactMessages = (_req: Request, res: Response): void => {
    try {
      const messages = PortfolioService.getContactMessages();
      res.status(200).json({ success: true, count: messages.length, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving contact messages' });
    }
  };

  static updateMessageStatus = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const { status } = req.body || {};
      if (!status || !['read', 'replied', 'unread'].includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status' });
        return;
      }

      const updated = PortfolioService.markMessageStatus(Number(id), status);
      res.status(200).json({ success: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating status' });
    }
  };

  static deleteContactMessage = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const deleted = PortfolioService.deleteContactMessage(Number(id));
      res.status(200).json({ success: deleted });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting message' });
    }
  };

  static exportMessagesCSV = (_req: Request, res: Response): void => {
    try {
      const messages = PortfolioService.getContactMessages();
      let csv = 'ID,Name,Email,Phone,Subject,Message,Status,CreatedAt\n';
      for (const m of messages) {
        const row = [
          m.id,
          `"${(m.name || '').replace(/"/g, '""')}"`,
          `"${(m.email || '').replace(/"/g, '""')}"`,
          `"${(m.phone || '').replace(/"/g, '""')}"`,
          `"${(m.subject || '').replace(/"/g, '""')}"`,
          `"${(m.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          m.status,
          m.created_at,
        ].join(',');
        csv += row + '\n';
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="saurabh_yagyik_inquiries.csv"');
      res.status(200).send(csv);
    } catch (error) {
      res.status(500).send('Error exporting inquiries CSV');
    }
  };

  static downloadResume = (_req: Request, res: Response): void => {
    try {
      PortfolioService.recordMetricIncrement('resume_downloads');

      const resumePath = path.resolve(process.cwd(), 'public/assets/resume.pdf');
      if (fs.existsSync(resumePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="Saurabh_Yagyik_Flutter_Developer_Resume.pdf"');
        fs.createReadStream(resumePath).pipe(res);
      } else {
        res.status(404).send('Resume file not found');
      }
    } catch (error) {
      res.status(500).send('Error downloading resume');
    }
  };
}
