import { messaging } from '../config/firebase';
import { User } from '../models/User';

export class NotificationService {
  /**
   * Send a push notification to a specific user
   */
  static async sendToUser(userId: string, title: string, body: string, data?: Record<string, string>) {
    if (!messaging) {
      console.warn('Firebase messaging not initialized. Cannot send notification.');
      return false;
    }

    try {
      const user = await User.findById(userId).select('+fcmToken');
      
      if (!user || !user.fcmToken) {
        console.warn(`User ${userId} does not have an FCM token.`);
        return false;
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token: user.fcmToken,
      };

      await messaging.send(message);
      return true;
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Send a push notification to multiple users (multicast)
   */
  static async sendToUsers(userIds: string[], title: string, body: string, data?: Record<string, string>) {
    if (!messaging) {
      console.warn('Firebase messaging not initialized. Cannot send notification.');
      return false;
    }

    try {
      const users = await User.find({ _id: { $in: userIds }, fcmToken: { $exists: true, $ne: null } }).select('+fcmToken');
      
      const tokens = users.map(u => u.fcmToken!).filter(t => t);

      if (tokens.length === 0) {
        console.warn('No valid FCM tokens found for the target users.');
        return false;
      }

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
      };

      const response = await messaging.sendEachForMulticast(message);
      
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.warn('List of tokens that caused failures: ' + failedTokens);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      return false;
    }
  }
}
