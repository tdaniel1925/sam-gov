// =============================================================================
// NOTIFICATIONS PAGE
// Following CodeBakers pattern 04-frontend.md
// =============================================================================

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Bell, Plus, Trash2, Loader2, Mail, Send } from 'lucide-react';
import { notificationsAPI, type NotificationSubscription } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  naicsCode: z.string().regex(/^\d{1,6}$/, 'NAICS code must be 1-6 digits'),
  frequency: z.enum(['daily', 'weekly', 'realtime']),
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;

export default function NotificationsPage() {
  const { session } = useAuth();
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');

  // General notification preferences
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailFrequency, setEmailFrequency] = useState<'daily' | 'weekly' | 'realtime' | 'off'>('daily');
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubscribeFormData>({
    resolver: zodResolver(subscribeSchema),
    defaultValues: {
      email: '',
      naicsCode: '',
      frequency: 'daily',
    },
  });

  // Load general preferences on mount
  useEffect(() => {
    if (session?.access_token) {
      loadPreferences();
    }
  }, [session]);

  const loadPreferences = async () => {
    try {
      setPrefsLoading(true);
      const response = await fetch('http://localhost:3001/api/notification-preferences', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      });

      if (!response.ok) throw new Error('Failed to load preferences');

      const data = await response.json();
      setEmailEnabled(data.data.emailEnabled);
      setEmailFrequency(data.data.emailFrequency);
    } catch (error) {
      console.error('Load preferences error:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setPrefsLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setPrefsSaving(true);
      const response = await fetch('http://localhost:3001/api/notification-preferences', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailEnabled, emailFrequency }),
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      const data = await response.json();
      toast.success(data.message || 'Preferences saved successfully');
    } catch (error) {
      console.error('Save preferences error:', error);
      toast.error('Failed to save preferences');
    } finally {
      setPrefsSaving(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      setTestEmailSending(true);
      const response = await fetch('http://localhost:3001/api/notification-preferences/test', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      });

      if (!response.ok) throw new Error('Failed to send test email');

      const data = await response.json();
      toast.success(data.message);
    } catch (error) {
      console.error('Test email error:', error);
      toast.error('Failed to send test email');
    } finally {
      setTestEmailSending(false);
    }
  };

  const loadSubscriptions = async (email: string) => {
    if (!email) return;

    setIsLoading(true);
    try {
      const data = await notificationsAPI.getAll(email);
      setSubscriptions(data);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SubscribeFormData) => {
    setIsSubmitting(true);
    try {
      await notificationsAPI.subscribe(data.email, data.naicsCode, data.frequency);
      toast.success('Subscription created!');
      setUserEmail(data.email);
      await loadSubscriptions(data.email);
      reset({
        email: data.email,
        naicsCode: '',
        frequency: 'daily',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to subscribe';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await notificationsAPI.unsubscribe(id);
      setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
      toast.success('Unsubscribed successfully');
    } catch (error) {
      toast.error('Failed to unsubscribe');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* General Notification Preferences */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Mail className="text-blue-600" size={28} />
          Notification Preferences
        </h2>

        {prefsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Email Enabled Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive email digests and alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Email Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Digest Frequency
              </label>
              <select
                value={emailFrequency}
                onChange={(e) => setEmailFrequency(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!emailEnabled}
              >
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
                <option value="realtime">Real-time Alerts</option>
                <option value="off">Off</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                {emailFrequency === 'daily' && 'Receive one email per day with all new opportunities'}
                {emailFrequency === 'weekly' && 'Receive one email per week with a summary'}
                {emailFrequency === 'realtime' && 'Receive emails immediately when opportunities are found'}
                {emailFrequency === 'off' && 'No automated emails (manual alerts only)'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={savePreferences}
                disabled={prefsSaving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {prefsSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </button>

              <button
                onClick={sendTestEmail}
                disabled={testEmailSending}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:text-white"
              >
                {testEmailSending ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Test Email
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NAICS Subscriptions Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Bell className="text-blue-600" size={28} />
          NAICS Code Subscriptions
        </h2>

        <p className="text-gray-600 mb-6">
          Get notified when new contracting opportunities are posted for specific NAICS codes.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => {
                if (e.target.value && e.target.value.includes('@')) {
                  setUserEmail(e.target.value);
                  loadSubscriptions(e.target.value);
                }
              }}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* NAICS Code */}
          <div>
            <label htmlFor="naicsCode" className="block text-sm font-medium text-gray-700 mb-2">
              NAICS Code
            </label>
            <input
              {...register('naicsCode')}
              type="text"
              id="naicsCode"
              placeholder="e.g., 541330"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.naicsCode && (
              <p className="mt-1 text-sm text-red-600">{errors.naicsCode.message}</p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
              Notification Frequency
            </label>
            <select
              {...register('frequency')}
              id="frequency"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="realtime">Real-time (as posted)</option>
            </select>
            {errors.frequency && (
              <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Subscribing...
              </>
            ) : (
              <>
                <Plus size={20} />
                Subscribe
              </>
            )}
          </button>
        </form>
      </div>

      {/* Sample Email Preview */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-8 border border-blue-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Sample Email Preview
        </h3>

        <p className="text-gray-600 mb-4 text-sm">
          Here's what you'll receive when new opportunities match your NAICS codes:
        </p>

        {/* Email Mockup */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Email Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h4 className="text-2xl font-bold mb-2">New SAM.gov Opportunities</h4>
            <p className="text-blue-100 text-sm">5 new contracts matching NAICS 541512</p>
          </div>

          {/* Email Body */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">Hello,</p>
            <p className="text-gray-700 mb-6">
              We found <strong>5 new opportunities</strong> that match your saved search criteria:
            </p>

            {/* Sample Opportunity 1 */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h5 className="text-lg font-semibold text-blue-600 mb-2">
                IT Infrastructure Support Services - Cloud Migration
              </h5>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Department:</span> Department of Defense
                </div>
                <div>
                  <span className="font-medium">NAICS:</span> 541512
                </div>
                <div>
                  <span className="font-medium">Posted:</span> Jan 28, 2026
                </div>
                <div className="text-orange-600 font-medium">
                  <span className="font-medium">Deadline:</span> Feb 15, 2026
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Seeking qualified contractors to provide comprehensive IT infrastructure support including network management, cybersecurity, and cloud migration services...
              </p>
              <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                View Full Details →
              </a>
            </div>

            {/* Sample Opportunity 2 */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h5 className="text-lg font-semibold text-blue-600 mb-2">
                Cybersecurity Assessment and Remediation
              </h5>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                <div>
                  <span className="font-medium">Department:</span> DHS/CISA
                </div>
                <div>
                  <span className="font-medium">NAICS:</span> 541512
                </div>
                <div>
                  <span className="font-medium">Posted:</span> Jan 28, 2026
                </div>
                <div className="text-orange-600 font-medium">
                  <span className="font-medium">Deadline:</span> Feb 20, 2026
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Federal cybersecurity assessment project requiring comprehensive vulnerability testing and remediation planning...
              </p>
              <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
                View Full Details →
              </a>
            </div>

            {/* More Opportunities Link */}
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-3">+ 3 more opportunities</p>
              <a href="#" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                View All 5 Opportunities
              </a>
            </div>

            {/* Email Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500 mb-2">
                You're receiving this because you subscribed to alerts for NAICS 541512
              </p>
              <p className="text-xs text-gray-400">
                SAM.gov Opportunities Platform |
                <a href="#" className="text-blue-600 hover:underline ml-1">Manage Subscriptions</a> |
                <a href="#" className="text-blue-600 hover:underline ml-1">Unsubscribe</a>
              </p>
            </div>
          </div>
        </div>

        {/* Frequency Note */}
        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
          <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Frequency Options
          </h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><strong>Daily:</strong> Receive one email per day at 8 AM with all new opportunities</li>
            <li><strong>Weekly:</strong> Receive one email every Monday with the week's opportunities</li>
            <li><strong>Real-time:</strong> Receive an email immediately when a new opportunity is posted</li>
          </ul>
        </div>
      </div>

      {/* Current Subscriptions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Your Subscriptions</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No active subscriptions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">NAICS {sub.naicsCode}</p>
                  <p className="text-sm text-gray-600">{sub.email}</p>
                  <p className="text-sm text-gray-500">
                    Frequency: {sub.frequency.charAt(0).toUpperCase() + sub.frequency.slice(1)} •{' '}
                    {sub.active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(sub.id)}
                  disabled={deletingId === sub.id}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                >
                  {deletingId === sub.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Unsubscribe
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
