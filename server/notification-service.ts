import twilio from 'twilio';

export interface NotificationMessage {
  to: string;
  body: string;
}

export interface GoalReminder {
  goalName: string;
  current: number;
  target: number;
  unit: string;
  progressPercentage: number;
  deadline?: string;
}

export class NotificationService {
  private client: any;

  constructor() {
    // Initialize Twilio client if credentials are available
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  async sendSMS(message: NotificationMessage): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Twilio not configured - SMS not sent');
      return false;
    }

    try {
      // Clean the phone number to remove any extra text
      const cleanFromNumber = '+18334201263'; // Fixed Twilio number
      
      const result = await this.client.messages.create({
        body: message.body,
        from: cleanFromNumber,
        to: message.to
      });

      console.log(`SMS sent successfully - SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  formatDailyGoalsReminder(goals: GoalReminder[]): string {
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });

    let message = `🎯 Daily Goals Update - ${date}\n\n`;

    if (goals.length === 0) {
      message += "No active goals found. Time to set some targets! 🚀";
      return message;
    }

    const topGoals = goals.slice(0, 3); // Show top 3 goals
    
    topGoals.forEach((goal, index) => {
      const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
      const progress = `${goal.current}${goal.unit}/${goal.target}${goal.unit}`;
      const percentage = Math.round(goal.progressPercentage);
      
      message += `${emoji} ${goal.goalName}\n`;
      message += `   Progress: ${progress} (${percentage}%)\n`;
      
      if (goal.deadline) {
        const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0) {
          message += `   ⏰ ${daysLeft} days left\n`;
        }
      }
      message += '\n';
    });

    // Add motivational message based on overall progress
    const avgProgress = topGoals.reduce((sum, goal) => sum + goal.progressPercentage, 0) / topGoals.length;
    
    if (avgProgress >= 80) {
      message += "🔥 You're crushing it! Keep up the momentum!";
    } else if (avgProgress >= 50) {
      message += "💪 Great progress! You're on the right track!";
    } else {
      message += "🚀 Time to accelerate! Every step counts!";
    }

    return message;
  }

  formatWeeklyGoalsReminder(goals: GoalReminder[], weekStart: string): string {
    let message = `📊 Weekly Goals Review - Week of ${weekStart}\n\n`;

    if (goals.length === 0) {
      message += "No goals to track this week. Let's set some targets! 🎯";
      return message;
    }

    // Group goals by progress level
    const crushing = goals.filter(g => g.progressPercentage >= 80);
    const onTrack = goals.filter(g => g.progressPercentage >= 50 && g.progressPercentage < 80);
    const needsAttention = goals.filter(g => g.progressPercentage < 50);

    if (crushing.length > 0) {
      message += `🔥 CRUSHING IT (${crushing.length}):\n`;
      crushing.forEach(goal => {
        message += `• ${goal.goalName} - ${Math.round(goal.progressPercentage)}%\n`;
      });
      message += '\n';
    }

    if (onTrack.length > 0) {
      message += `✅ ON TRACK (${onTrack.length}):\n`;
      onTrack.forEach(goal => {
        message += `• ${goal.goalName} - ${Math.round(goal.progressPercentage)}%\n`;
      });
      message += '\n';
    }

    if (needsAttention.length > 0) {
      message += `⚠️ NEEDS FOCUS (${needsAttention.length}):\n`;
      needsAttention.forEach(goal => {
        message += `• ${goal.goalName} - ${Math.round(goal.progressPercentage)}%\n`;
      });
      message += '\n';
    }

    message += "💡 Focus on your biggest opportunities this week!";
    
    return message;
  }

  async sendDailyReminder(phoneNumber: string, goals: GoalReminder[]): Promise<boolean> {
    const message = this.formatDailyGoalsReminder(goals);
    return this.sendSMS({ to: phoneNumber, body: message });
  }

  async sendWeeklyReminder(phoneNumber: string, goals: GoalReminder[]): Promise<boolean> {
    const weekStart = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const message = this.formatWeeklyGoalsReminder(goals, weekStart);
    return this.sendSMS({ to: phoneNumber, body: message });
  }

  async sendTestMessage(phoneNumber: string): Promise<boolean> {
    const message = `🧪 Test notification from your Goals Tracker!\n\nThis confirms SMS notifications are working correctly. You'll receive daily and weekly goal reminders at your scheduled times.\n\n🎯 Ready to crush your goals!`;
    return this.sendSMS({ to: phoneNumber, body: message });
  }
}

export const notificationService = new NotificationService();