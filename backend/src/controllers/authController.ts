import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { RecruiterProfile } from '../models/RecruiterProfile';
import { CandidateProfile } from '../models/CandidateProfile';
import { generateTokens } from '../config/jwt';
import { UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  /**
   * Register new user (recruiter or candidate)
   */
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, fullName, companyName, companyWebsite } =
        req.body;
      
      const role = req.body.role || UserRole.CANDIDATE;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      // Create user
      const user = await User.create({
        email,
        password,
        role,
        fullName,
      });

      // Create role-specific profile
      if (role === UserRole.RECRUITER) {
        await RecruiterProfile.create({
          userId: user._id,
          companyName: companyName || fullName,
          companyWebsite,
        });
      } else if (role === UserRole.CANDIDATE) {
        await CandidateProfile.create({
          userId: user._id,
        });
      }

      // Generate tokens
      const tokens = generateTokens({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
          ...tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user with password field
      const user = await User.findOne({ email, isActive: true }).select(
        '+password'
      );

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const tokens = generateTokens({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
          ...tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.userId;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      let profile = null;
      if (user.role === UserRole.RECRUITER) {
        profile = await RecruiterProfile.findOne({ userId: user._id });
      } else if (user.role === UserRole.CANDIDATE) {
        profile = await CandidateProfile.findOne({ userId: user._id });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
          },
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update FCM Token
   */
  static async updateFcmToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { fcmToken } = req.body;

      if (!fcmToken) {
        throw new AppError('FCM Token is required', 400);
      }

      await User.findByIdAndUpdate(userId, { fcmToken });

      res.json({
        success: true,
        message: 'FCM Token updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
