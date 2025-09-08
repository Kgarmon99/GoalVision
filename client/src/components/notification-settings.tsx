import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  MessageSquare, 
  Clock, 
  Calendar, 
  Send, 
  Smartphone, 
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface NotificationSettings {
  phoneNumber: string;
  notificationEnabled: boolean;
  dailyReminderTime: string;
  weeklyReminderDay: string;
  notificationPreferences: any;
}

export function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTestSending, setIsTestSending] = useState(false);
  const [isDailySending, setIsDailySending] = useState(false);
  const [isWeeklySending, setIsWeeklySending] = useState(false);

  // Fetch notification settings
  const { data: settings, isLoading } = useQuery<NotificationSettings>({
    queryKey: ['/api/notifications/settings'],
    refetchOnWindowFocus: false,
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: (data: Partial<NotificationSettings>) => 
      apiRequest('PATCH', '/api/notifications/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] });
      toast({
        title: "Settings Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    }
  });

  // Test notification mutation
  const sendTestNotification = useMutation({
    mutationFn: () => apiRequest('POST', '/api/notifications/test'),
    onSuccess: () => {
      toast({
        title: "Test Sent!",
        description: "Check your iPhone for the test notification.",
      });
      setIsTestSending(false);
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test notification.",
        variant: "destructive",
      });
      setIsTestSending(false);
    }
  });

  // Daily reminder mutation
  const sendDailyReminder = useMutation({
    mutationFn: () => apiRequest('POST', '/api/notifications/daily-reminder'),
    onSuccess: () => {
      toast({
        title: "Daily Reminder Sent!",
        description: "Your daily goals update has been sent to your iPhone.",
      });
      setIsDailySending(false);
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send daily reminder.",
        variant: "destructive",
      });
      setIsDailySending(false);
    }
  });

  // Weekly reminder mutation
  const sendWeeklyReminder = useMutation({
    mutationFn: () => apiRequest('POST', '/api/notifications/weekly-reminder'),
    onSuccess: () => {
      toast({
        title: "Weekly Reminder Sent!",
        description: "Your weekly goals review has been sent to your iPhone.",
      });
      setIsWeeklySending(false);
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send weekly reminder.",
        variant: "destructive",
      });
      setIsWeeklySending(false);
    }
  });

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    updateSettings.mutate({ [key]: value });
  };

  const handleTestNotification = async () => {
    setIsTestSending(true);
    sendTestNotification.mutate();
  };

  const handleDailyReminder = async () => {
    setIsDailySending(true);
    sendDailyReminder.mutate();
  };

  const handleWeeklyReminder = async () => {
    setIsWeeklySending(true);
    sendWeeklyReminder.mutate();
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            iPhone Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6"
    >
      {/* Main Settings Card */}
      <Card className="border-green-500/20 bg-gradient-to-br from-slate-900/80 to-emerald-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Smartphone className="w-5 h-5" />
            iPhone Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-green-300">
              Phone Number
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="phone"
                value={formatPhoneNumber(settings?.phoneNumber || '')}
                disabled
                className="bg-slate-800/50 border-green-500/30 text-green-100"
              />
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Verified</span>
              </div>
            </div>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 border border-green-500/20 rounded-lg bg-slate-800/30">
            <div className="space-y-1">
              <Label className="text-base font-medium text-green-300">
                Enable iPhone Notifications
              </Label>
              <p className="text-sm text-slate-400">
                Receive SMS reminders about your goals and targets
              </p>
            </div>
            <Switch
              checked={settings?.notificationEnabled || false}
              onCheckedChange={(checked) => handleSettingChange('notificationEnabled', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {/* Timing Settings */}
          <AnimatePresence>
            {settings?.notificationEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Daily Reminder Time */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-300 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Daily Reminder Time
                    </Label>
                    <Select
                      value={settings?.dailyReminderTime || '09:00'}
                      onValueChange={(value) => handleSettingChange('dailyReminderTime', value)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-green-500/30 text-green-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          const time12 = new Date(`2000-01-01T${hour}:00`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          });
                          return (
                            <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                              {time12}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Weekly Reminder Day */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-300 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Weekly Reminder Day
                    </Label>
                    <Select
                      value={settings?.weeklyReminderDay || 'Monday'}
                      onValueChange={(value) => handleSettingChange('weeklyReminderDay', value)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-green-500/30 text-green-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Test & Send Actions */}
      {settings?.notificationEnabled && (
        <Card className="border-orange-500/20 bg-gradient-to-br from-slate-900/80 to-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <Send className="w-5 h-5" />
              Send Notifications Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Test Notification */}
              <Button
                onClick={handleTestNotification}
                disabled={isTestSending}
                className="bg-blue-600 hover:bg-blue-700 border border-blue-500/50"
              >
                {isTestSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Test Message
                  </>
                )}
              </Button>

              {/* Daily Reminder */}
              <Button
                onClick={handleDailyReminder}
                disabled={isDailySending}
                className="bg-green-600 hover:bg-green-700 border border-green-500/50"
              >
                {isDailySending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Daily Update
                  </>
                )}
              </Button>

              {/* Weekly Reminder */}
              <Button
                onClick={handleWeeklyReminder}
                disabled={isWeeklySending}
                className="bg-purple-600 hover:bg-purple-700 border border-purple-500/50"
              >
                {isWeeklySending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Weekly Review
                  </>
                )}
              </Button>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 bg-slate-800/50 border border-slate-600/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-300">
                <p><strong>Test Message:</strong> Confirms SMS is working</p>
                <p><strong>Daily Update:</strong> Your top 3 goals with progress</p>
                <p><strong>Weekly Review:</strong> All goals grouped by performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Card */}
      <Card className="border-slate-600/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-300">
                System Status: {settings?.notificationEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Phone: {formatPhoneNumber(settings?.phoneNumber || 'Not set')}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}