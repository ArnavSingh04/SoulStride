import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RoutineConfig, TimeSlot } from '@/types/routine';
import { getAllPrayers, Prayer } from '@/data/prayers';
import { TIME_SLOT_LABELS } from '@/types/routine';
import ReminderSettings from './reminder-settings';

interface RoutineEditModalProps {
  visible: boolean;
  config: RoutineConfig;
  onClose: () => void;
  onSave: (config: RoutineConfig) => void;
}

export default function RoutineEditModal({
  visible,
  config,
  onClose,
  onSave
}: RoutineEditModalProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [localConfig, setLocalConfig] = useState<RoutineConfig>(config);
  const [allPrayers, setAllPrayers] = useState<Prayer[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    setAllPrayers(getAllPrayers());
    setLocalConfig(config);
  }, [config]);

  const togglePrayerInSlot = (timeSlot: TimeSlot, prayerId: string) => {
    setLocalConfig(prev => ({
      slots: prev.slots.map(slot => {
        if (slot.timeSlot === timeSlot) {
          const prayerIds = slot.prayerIds.includes(prayerId)
            ? slot.prayerIds.filter(id => id !== prayerId)
            : [...slot.prayerIds, prayerId];
          return { ...slot, prayerIds };
        }
        return slot;
      })
    }));
  };

  const updateReminder = (timeSlot: TimeSlot, reminder: { enabled: boolean; hour: number; minute: number }) => {
    setLocalConfig(prev => ({
      slots: prev.slots.map(slot => {
        if (slot.timeSlot === timeSlot) {
          return { ...slot, reminder };
        }
        return slot;
      })
    }));
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            Edit Routine
          </ThemedText>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <ThemedText style={{ color: theme.tint, fontSize: 16, fontWeight: '600' }}>
              Save
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {localConfig.slots.map((slot) => {
            const slotLabel = TIME_SLOT_LABELS[slot.timeSlot];
            const slotPrayers = allPrayers.filter(p => slot.prayerIds.includes(p.id));
            
            return (
              <View key={slot.timeSlot} style={styles.slotSection}>
                <View style={styles.slotHeader}>
                  <View>
                    <ThemedText type="subtitle" style={styles.slotTitle}>
                      {slotLabel.name}
                    </ThemedText>
                    <ThemedText style={[styles.slotTitlePunjabi, { color: theme.tint }]}>
                      {slotLabel.namePunjabi}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedSlot(selectedSlot === slot.timeSlot ? null : slot.timeSlot)}
                    style={styles.expandButton}
                  >
                    <Ionicons
                      name={selectedSlot === slot.timeSlot ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={theme.icon}
                    />
                  </TouchableOpacity>
                </View>

                {selectedSlot === slot.timeSlot && (
                  <View style={styles.slotContent}>
                    {/* Reminder Settings */}
                    <ReminderSettings
                      timeSlot={slot.timeSlot}
                      reminder={slot.reminder}
                      onUpdate={(reminder) => updateReminder(slot.timeSlot, reminder)}
                    />

                    {/* Prayer Selection */}
                    <View style={styles.prayerSelection}>
                      <ThemedText style={[styles.sectionLabel, { color: theme.icon }]}>
                        Select Prayers
                      </ThemedText>
                      {allPrayers.map((prayer) => {
                        const isSelected = slot.prayerIds.includes(prayer.id);
                        return (
                          <TouchableOpacity
                            key={prayer.id}
                            onPress={() => togglePrayerInSlot(slot.timeSlot, prayer.id)}
                            style={[
                              styles.prayerOption,
                              {
                                backgroundColor: isSelected
                                  ? theme.tint + '20'
                                  : colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8',
                                borderColor: isSelected ? theme.tint : 'transparent',
                                borderWidth: isSelected ? 2 : 0
                              }
                            ]}
                          >
                            <View style={styles.prayerOptionContent}>
                              <View style={styles.prayerOptionText}>
                                <ThemedText type="defaultSemiBold">
                                  {prayer.name}
                                </ThemedText>
                                <ThemedText style={[styles.prayerOptionPunjabi, { color: theme.tint }]}>
                                  {prayer.namePunjabi}
                                </ThemedText>
                              </View>
                              <Ionicons
                                name={isSelected ? 'checkbox' : 'checkbox-outline'}
                                size={24}
                                color={isSelected ? theme.tint : theme.icon}
                              />
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Summary */}
                <View style={styles.slotSummary}>
                  <ThemedText style={[styles.summaryText, { color: theme.icon }]}>
                    {slotPrayers.length} prayer{slotPrayers.length !== 1 ? 's' : ''} selected
                    {slot.reminder.enabled && (
                      <> • Reminder at {String(slot.reminder.hour).padStart(2, '0')}:{String(slot.reminder.minute).padStart(2, '0')}</>
                    )}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  closeButton: {
    padding: 4,
    width: 36
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20
  },
  saveButton: {
    padding: 4,
    width: 60,
    alignItems: 'flex-end'
  },
  content: {
    flex: 1,
    padding: 16
  },
  slotSection: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent'
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent'
  },
  slotTitle: {
    fontSize: 18,
    marginBottom: 4
  },
  slotTitlePunjabi: {
    fontSize: 14
  },
  expandButton: {
    padding: 4
  },
  slotContent: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  slotSummary: {
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  summaryText: {
    fontSize: 12
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '600'
  },
  prayerSelection: {
    marginTop: 16
  },
  prayerOption: {
    borderRadius: 8,
    marginBottom: 8,
    padding: 12
  },
  prayerOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  prayerOptionText: {
    flex: 1
  },
  prayerOptionPunjabi: {
    fontSize: 12,
    marginTop: 2
  }
});

