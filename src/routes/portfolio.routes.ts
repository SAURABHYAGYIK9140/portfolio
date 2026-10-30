import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';

const router = Router();

// Public Portfolio API
router.get('/data', PortfolioController.getFullPortfolioData);
router.get('/profile', PortfolioController.getProfile);
router.get('/skills', PortfolioController.getSkills);
router.get('/experience', PortfolioController.getExperience);
router.get('/projects', PortfolioController.getProjects);
router.get('/projects/:id', PortfolioController.getProjectById);
router.post('/projects/:id/like', PortfolioController.likeProject);
router.get('/education', PortfolioController.getEducation);
router.get('/guestbook', PortfolioController.getGuestbook);
router.post('/guestbook', PortfolioController.addGuestbook);
router.post('/contact', PortfolioController.submitContact);
router.get('/resume/download', PortfolioController.downloadResume);

// Admin / Management endpoints
router.get('/messages', PortfolioController.getContactMessages);
router.get('/messages/export/csv', PortfolioController.exportMessagesCSV);
router.patch('/messages/:id/status', PortfolioController.updateMessageStatus);
router.delete('/messages/:id', PortfolioController.deleteContactMessage);

export default router;
