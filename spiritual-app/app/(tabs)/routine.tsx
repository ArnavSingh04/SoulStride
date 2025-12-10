import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RoutineConfig, TimeSlot } from '@/types/routine';
import { TIME_SLOT_LABELS } from '@/types/routine';
import {
  loadRoutineConfig,
  saveRoutineConfig,
  loadTodayCompletion,
  togglePrayerCompletion,
  getTodayStats,
  getTodayDate
} from '@/services/routine-storage';
import { scheduleRoutineReminders } from '@/services/notifications';
import { getAllPrayers, getPrayerById, Prayer } from '@/data/prayers';
import RoutineEditModal from '@/components/routine-edit-modal';

export default function Routine() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [config, setConfig] = useState<RoutineConfig | null>(null);
  const [completion, setCompletion] = useState<any>(null);
  const [stats, setStats] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [currentDate, setCurrentDate] = useState(() => {
    try {
      return getTodayDate();
    } catch (e) {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // Check if date changed (e.g., app reopened on new day)
    const interval = setInterval(() => {
      const today = getTodayDate();
      if (today !== currentDate) {
        setCurrentDate(today);
        loadData();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Schedule reminders when config changes
    if (config) {
      scheduleRoutineReminders(config).catch(console.error);
    }
  }, [config]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [routineConfig, todayCompletion] = await Promise.all([
        loadRoutineConfig(),
        loadTodayCompletion()
      ]);
      
      setConfig(routineConfig);
      setCompletion(todayCompletion);
      
      if (routineConfig) {
        const todayStats = await getTodayStats(routineConfig);
        setStats(todayStats);
      }
    } catch (error) {
      console.error('Error loading routine data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load routine');
      // Set default config on error
      const defaultConfig = {
        slots: Object.keys(TIME_SLOT_LABELS).map((slot) => ({
          timeSlot: slot as TimeSlot,
          prayerIds: [],
          reminder: {
            enabled: false,
            ...TIME_SLOT_LABELS[slot as TimeSlot].defaultTime
          }
        }))
      };
      setConfig(defaultConfig);
      setCompletion({ date: getTodayDate(), completedPrayers: {} });
      setStats({ completed: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (newConfig: RoutineConfig) => {
    try {
      await saveRoutineConfig(newConfig);
      setConfig(newConfig);
      await scheduleRoutineReminders(newConfig);
      const newStats = await getTodayStats(newConfig);
      setStats(newStats);
    } catch (error) {
      console.error('Error saving routine config:', error);
    }
  };

  const handleToggleCompletion = async (prayerId: string) => {
    if (!completion) return;
    
    const isCompleted = completion.completedPrayers[prayerId] || false;
    try {
      await togglePrayerCompletion(prayerId, !isCompleted);
      const updatedCompletion = await loadTodayCompletion();
      setCompletion(updatedCompletion);
      
      if (config) {
        const newStats = await getTodayStats(config);
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  };

  const handlePrayerPress = (prayerId: string) => {
    const prayer = getPrayerById(prayerId);
    if (prayer) {
      setSelectedPrayer(prayer);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={[styles.loadingText, { color: theme.icon }]}>
            Loading routine...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Show error state if there's an error
  if (error && !config) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.icon} />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            Error Loading Routine
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
            {error}
          </ThemedText>
          <TouchableOpacity
            onPress={loadData}
            style={[styles.createButton, { backgroundColor: theme.tint, marginTop: 16 }]}
          >
            <ThemedText style={{ color: '#fff', fontWeight: '600' }}>
              Retry
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (!config) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={theme.icon} />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No Routine Set
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
            Create your daily prayer routine to get started
          </ThemedText>
          <TouchableOpacity
            onPress={() => setShowEditModal(true)}
            style={[styles.createButton, { backgroundColor: theme.tint }]}
          >
            <ThemedText style={{ color: colorScheme === 'dark' ? '#000' : '#fff', fontWeight: '600' }}>
              Create Routine
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const allPrayerIds = config.slots.flatMap(slot => slot.prayerIds);
  const uniquePrayerIds = Array.from(new Set(allPrayerIds));
  const hasAnyPrayers = uniquePrayerIds.length > 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={styles.headerTitle}>
              Routine
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.icon }]}>
              Your daily prayer schedule
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={() => setShowEditModal(true)}
            style={styles.editButton}
          >
            <Ionicons name="create-outline" size={24} color={theme.tint} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        {stats.total > 0 && (() => {
          const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
          let progressColor = '#FF6B6B'; // Red for low progress
          if (percentage >= 100) {
            progressColor = '#4ECDC4'; // Green for 100%
          } else if (percentage >= 50) {
            progressColor = '#FFD93D'; // Yellow for 50%+
          } else if (percentage >= 25) {
            progressColor = '#FFA07A'; // Orange for 25%+
          }
          
          return (
            <View
              style={[
                styles.statsCard,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8',
                  borderLeftColor: progressColor
                }
              ]}
            >
              <View style={styles.statsContent}>
                <View>
                  <ThemedText type="subtitle" style={styles.statsTitle}>
                    Today's Progress
                  </ThemedText>
                  <ThemedText style={[styles.statsSubtitle, { color: theme.icon }]}>
                    {stats.completed} of {stats.total} prayers completed
                  </ThemedText>
                </View>
                <View style={[styles.progressCircle, { borderColor: progressColor }]}>
                  <ThemedText style={[styles.progressText, { color: progressColor }]}>
                    {percentage}%
                  </ThemedText>
                </View>
              </View>
            </View>
          );
        })()}

        {/* Routine Slots */}
        {config.slots.map((slot) => {
          const slotLabel = TIME_SLOT_LABELS[slot.timeSlot];
          const slotPrayers = slot.prayerIds
            .map(id => getPrayerById(id))
            .filter((p): p is Prayer => p !== undefined);

          if (slotPrayers.length === 0) {
            return null;
          }

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
                  {slot.reminder.enabled && (
                    <ThemedText style={[styles.reminderText, { color: theme.icon }]}>
                      <Ionicons name="notifications-outline" size={12} /> Reminder at{' '}
                      {String(slot.reminder.hour).padStart(2, '0')}:
                      {String(slot.reminder.minute).padStart(2, '0')}
                    </ThemedText>
                  )}
                </View>
              </View>

              {slotPrayers.map((prayer) => {
                const isCompleted = completion?.completedPrayers[prayer.id] || false;
                return (
                  <TouchableOpacity
                    key={prayer.id}
                    onPress={() => handlePrayerPress(prayer.id)}
                    style={[
                      styles.prayerItem,
                      {
                        backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8',
                        borderLeftColor: theme.tint,
                        opacity: isCompleted ? 0.6 : 1
                      }
                    ]}
                  >
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleCompletion(prayer.id);
                      }}
                      style={styles.checkboxContainer}
                    >
                      <Ionicons
                        name={isCompleted ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={isCompleted ? theme.tint : theme.icon}
                      />
                    </TouchableOpacity>
                    <View style={styles.prayerContent}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={[
                          styles.prayerName,
                          isCompleted && styles.completedText
                        ]}
                      >
                        {prayer.name}
                      </ThemedText>
                      <ThemedText style={[styles.prayerNamePunjabi, { color: theme.tint }]}>
                        {prayer.namePunjabi}
                      </ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.icon} />
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {/* Empty State - Show when no prayers are configured */}
        {!hasAnyPrayers && (
          <View style={styles.emptyRoutineContainer}>
            <Ionicons name="calendar-outline" size={48} color={theme.icon} />
            <ThemedText type="subtitle" style={styles.emptyRoutineTitle}>
              No Prayers in Routine
            </ThemedText>
            <ThemedText style={[styles.emptyRoutineText, { color: theme.icon }]}>
              Tap the edit button to add prayers to your routine
            </ThemedText>
            <TouchableOpacity
              onPress={() => setShowEditModal(true)}
              style={[styles.createButton, { backgroundColor: theme.tint, marginTop: 16 }]}
            >
              <ThemedText style={{ color: colorScheme === 'dark' ? '#000' : '#fff', fontWeight: '600' }}>
                Add Prayers
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      {config && (
        <RoutineEditModal
          visible={showEditModal}
          config={config}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveConfig}
        />
      )}

      {/* Prayer Detail Modal */}
      <Modal
        visible={selectedPrayer !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPrayer(null)}
      >
        {selectedPrayer && (
          <ThemedView style={styles.modalContainer}>
            <View style={[styles.modalHeader, { backgroundColor: theme.background }]}>
              <TouchableOpacity
                onPress={() => setSelectedPrayer(null)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
              <View style={styles.modalTitleContainer}>
                <ThemedText type="title" style={styles.modalTitle}>
                  {selectedPrayer.name}
                </ThemedText>
                <ThemedText
                  style={[styles.modalTitlePunjabi, { color: theme.tint }]}
                >
                  {selectedPrayer.namePunjabi}
                </ThemedText>
              </View>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <ThemedText
                style={[styles.modalDescription, { color: theme.icon }]}
              >
                {selectedPrayer.description}
              </ThemedText>

              {selectedPrayer.lines.map((line, index) => (
                <View key={index} style={styles.prayerLineContainer}>
                  <ThemedText
                    style={[styles.prayerPunjabiText, { fontFamily: 'serif' }]}
                  >
                    {line.punjabi}
                  </ThemedText>
                  <ThemedText
                    style={[styles.prayerEnglishText, { color: theme.icon }]}
                  >
                    {line.english}
                  </ThemedText>
                  {index < selectedPrayer.lines.length - 1 && (
                    <View
                      style={[
                        styles.prayerSeparator,
                        { backgroundColor: theme.icon + '20' }
                      ]}
                    />
                  )}
    </View>
              ))}
            </ScrollView>
          </ThemedView>
        )}
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  loadingText: {
    fontSize: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16
  },
  headerTitle: {
    fontSize: 32,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16
  },
  editButton: {
    padding: 8
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 4
  },
  statsSubtitle: {
    fontSize: 14
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'currentColor'
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  slotSection: {
    marginHorizontal: 20,
    marginBottom: 24
  },
  slotHeader: {
    marginBottom: 12
  },
  slotTitle: {
    fontSize: 20,
    marginBottom: 4
  },
  slotTitlePunjabi: {
    fontSize: 14
  },
  reminderText: {
    fontSize: 12,
    marginTop: 4
  },
  prayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4
  },
  checkboxContainer: {
    marginRight: 12
  },
  prayerContent: {
    flex: 1
  },
  prayerName: {
    fontSize: 16,
    marginBottom: 4
  },
  prayerNamePunjabi: {
    fontSize: 14
  },
  completedText: {
    textDecorationLine: 'line-through'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16
  },
  emptyTitle: {
    fontSize: 24,
    marginTop: 16
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center'
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8
  },
  emptyRoutineContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 12
  },
  emptyRoutineTitle: {
    fontSize: 20,
    marginTop: 8
  },
  emptyRoutineText: {
    fontSize: 14,
    textAlign: 'center'
  },
  modalContainer: {
    flex: 1
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalCloseButton: {
    padding: 4
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 4
  },
  modalTitlePunjabi: {
    fontSize: 16
  },
  modalContent: {
    flex: 1,
    padding: 20
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
    fontStyle: 'italic'
  },
  prayerLineContainer: {
    marginBottom: 20
  },
  prayerPunjabiText: {
    fontSize: 18,
    lineHeight: 32,
    marginBottom: 8,
    textAlign: 'left'
  },
  prayerEnglishText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: 4
  },
  prayerSeparator: {
    height: 1,
    marginTop: 16,
    marginBottom: 4
  }
});
