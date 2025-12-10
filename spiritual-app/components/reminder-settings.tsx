import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TimeSlot, ReminderSettings } from '@/types/routine';
import { TIME_SLOT_LABELS } from '@/types/routine';

interface ReminderSettingsProps {
  timeSlot: TimeSlot;
  reminder: ReminderSettings;
  onUpdate: (reminder: ReminderSettings) => void;
}

export default function ReminderSettingsComponent({
  timeSlot,
  reminder,
  onUpdate
}: ReminderSettingsProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState(String(reminder.hour));
  const [tempMinute, setTempMinute] = useState(String(reminder.minute));

  const handleToggle = (enabled: boolean) => {
    onUpdate({ ...reminder, enabled });
  };

  const handleTimeSave = () => {
    const hour = parseInt(tempHour) || 0;
    const minute = parseInt(tempMinute) || 0;
    if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
      onUpdate({ ...reminder, hour, minute });
      setShowTimePicker(false);
    }
  };

  const formatTime = (h: number, m: number) => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Enable Reminder
          </ThemedText>
          <ThemedText style={[styles.subLabel, { color: theme.icon }]}>
            Get notified at the set time
          </ThemedText>
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={handleToggle}
          trackColor={{ false: theme.icon + '40', true: theme.tint + '80' }}
          thumbColor={reminder.enabled ? theme.tint : '#f4f3f4'}
        />
      </View>

      {reminder.enabled && (
        <TouchableOpacity
          onPress={() => {
            setTempHour(String(reminder.hour));
            setTempMinute(String(reminder.minute));
            setShowTimePicker(true);
          }}
          style={[
            styles.timeButton,
            {
              backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0'
            }
          ]}
        >
          <Ionicons name="time-outline" size={20} color={theme.icon} />
          <ThemedText style={[styles.timeText, { color: theme.text }]}>
            {formatTime(reminder.hour, reminder.minute)}
          </ThemedText>
          <Ionicons name="chevron-forward" size={20} color={theme.icon} />
        </TouchableOpacity>
      )}

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimePicker(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.background }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Set Reminder Time
            </ThemedText>
            
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <ThemedText style={[styles.timeLabel, { color: theme.icon }]}>
                  Hour (0-23)
                </ThemedText>
                <TextInput
                  style={[
                    styles.timeInput,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                      color: theme.text
                    }
                  ]}
                  value={tempHour}
                  onChangeText={setTempHour}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.timeInputGroup}>
                <ThemedText style={[styles.timeLabel, { color: theme.icon }]}>
                  Minute (0-59)
                </ThemedText>
                <TextInput
                  style={[
                    styles.timeInput,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                      color: theme.text
                    }
                  ]}
                  value={tempMinute}
                  onChangeText={setTempMinute}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0'
                  }
                ]}
              >
                <ThemedText style={{ color: theme.icon }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTimeSave}
                style={[styles.modalButton, { backgroundColor: theme.tint }]}
              >
                <ThemedText style={{ color: colorScheme === 'dark' ? '#000' : '#fff' }}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  labelContainer: {
    flex: 1
  },
  label: {
    fontSize: 16,
    marginBottom: 4
  },
  subLabel: {
    fontSize: 12
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20
  },
  timeInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  timeInputGroup: {
    flex: 1
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 8
  },
  timeInput: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'center'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  }
});

