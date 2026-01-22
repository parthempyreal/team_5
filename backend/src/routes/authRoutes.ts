import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { registerValidator, loginValidator } from '../validators/authValidators';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (recruiter or candidate)
 * @access  Public
 */
router.post('/register', validate(registerValidator), AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginValidator), AuthController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @route   POST /api/auth/fcm-token
 * @desc    Update FCM Token
 * @access  Private
 */
router.post('/fcm-token', authenticate, AuthController.updateFcmToken);

export default router;
