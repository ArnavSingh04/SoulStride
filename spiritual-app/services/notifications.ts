import * as Notifications from 'expo-notifications';
import { RoutineConfig, TimeSlot } from '@/types/routine';
import { TIME_SLOT_LABELS } from '@/types/routine';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

// Schedule all routine reminders
export async function scheduleRoutineReminders(config: RoutineConfig): Promise<void> {
  // Cancel all existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.warn('Notification permissions not granted');
    return;
  }
  
  for (const slot of config.slots) {
    if (slot.reminder.enabled && slot.prayerIds.length > 0) {
      const slotLabel = TIME_SLOT_LABELS[slot.timeSlot];
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Prayer Reminder',
          body: `Time for ${slotLabel.name} prayers`,
          sound: true,
          data: { timeSlot: slot.timeSlot },
        },
        trigger: {
          hour: slot.reminder.hour,
          minute: slot.reminder.minute,
          repeats: true,
        },
      });
      
      console.log(`Scheduled reminder for ${slotLabel.name} at ${slot.reminder.hour}:${slot.reminder.minute}`);
    }
  }
}

// Cancel all reminders
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

