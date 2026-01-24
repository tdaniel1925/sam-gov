// =============================================================================
// NOTIFICATIONS PAGE
// Following CodeBakers pattern 04-frontend.md
// =============================================================================

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Bell, Plus, Trash2, Loader2 } from 'lucide-react';
import { notificationsAPI, type NotificationSubscription } from '../services/api';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  naicsCode: z.string().regex(/^\d{1,6}$/, 'NAICS code must be 1-6 digits'),
  frequency: z.enum(['daily', 'weekly', 'realtime']),
});

type SubscribeFormData = z.infer<typeof subscribeSchema>;

export default function NotificationsPage() {
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');

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
      {/* Subscribe Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Bell className="text-blue-600" size={28} />
          Email Notifications
        </h2>

        <p className="text-gray-600 mb-6">
          Get notified when new contracting opportunities are posted for your NAICS codes.
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
