import {
  View,
  SectionList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { AppText } from "@/components/AppText";
import { Check, X, Trash2, Box, CheckSquare, Plus } from "lucide-react-native";
import { useState } from "react";
import { useTasks, Task } from "@/context/TasksContext";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

export default function LogbookScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { tasks, removeTask, toggleTaskCompletion } = useTasks();
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Task | null>(null);

  // 1. Group tasks by Date (Today, Yesterday, etc.)
  const getSectionData = () => {
    const completedTasks = tasks.filter((task) => task.completed);

    const sections: { [key: string]: Task[] } = {};

    completedTasks.forEach((task) => {
      // Determine date label
      const date = new Date(task.timestamp);
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const sectionTitle = isToday ? "Today" : date.toLocaleDateString();

      if (!sections[sectionTitle]) {
        sections[sectionTitle] = [];
      }
      sections[sectionTitle].push(task);
    });

    // Convert to array format for SectionList and sort newest first
    return Object.keys(sections).map((title) => ({
      title,
      data: sections[title].sort(
        (a: Task, b: Task) => b.timestamp - a.timestamp,
      ),
    }));
  };

  const sections = getSectionData();

  const handleToggleComplete = (taskId: string, event: any) => {
    event.stopPropagation();
    toggleTaskCompletion(taskId);
  };

  const handleDeleteLog = (taskId: string) => {
    removeTask(taskId);
    setPreviewModal(false);
  };

  const handlePreview = (log: Task) => {
    setSelectedLog(log);
    setPreviewModal(true);
  };

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.card }]}>
      <AppText style={[styles.sectionTitle, { color: theme.text }]}>
        {title}
      </AppText>
    </View>
  );

  const renderLogEntry = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[
        styles.logEntry,
        { backgroundColor: theme.card, borderBottomColor: theme.borderLight },
      ]}
      onPress={() => handlePreview(item)}
    >
      {/* Left Side: Checkbox area */}
      <View style={[styles.logEntryLeft, { marginRight: 12 }]}>
        <TouchableOpacity
          style={[
            styles.completedCheckbox,
            {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            },
          ]}
          onPress={(e) => handleToggleComplete(item.id, e)}
        >
          <Check size={14} color="white" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* Right Side: Task Details */}
      <View style={styles.logEntryRight}>
        <AppText style={[styles.logEntryTitle, { color: theme.text }]}>
          {item.sender}
        </AppText>

        {item.preview ? (
          <AppText
            style={[
              styles.logEntryPreview,
              { color: theme.textTertiary, marginTop: 4 },
            ]}
            numberOfLines={1}
          >
            {item.preview}
          </AppText>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <CheckSquare size={32} color="#4ade80" />
        <AppText
          style={[styles.headerTitle, { color: theme.text, marginLeft: 12 }]}
        >
          Logbook
        </AppText>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderLogEntry}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={[styles.emptyState, { marginTop: -80 }]}>
            <CheckSquare size={64} color="#9CA3AF" />
          </View>
        }
        contentContainerStyle={
          sections.length === 0 ? { flex: 1 } : { paddingBottom: 30 }
        }
      />

      {/* Preview Modal */}
      <Modal
        visible={previewModal}
        animationType="slide"
        transparent
        onRequestClose={() => setPreviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {/* Header */}
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.border }]}
            >
              <AppText style={[styles.modalTitle, { color: theme.text }]}>
                {selectedLog?.sender}
              </AppText>
              <TouchableOpacity onPress={() => setPreviewModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.timeLoggedSection}>
                <AppText
                  style={[styles.sectionLabel, { color: theme.textSecondary }]}
                >
                  Time Logged
                </AppText>
                <AppText style={[styles.timeText, { color: theme.text }]}>
                  {selectedLog?.time}
                </AppText>
              </View>

              {selectedLog?.preview ? (
                <View style={styles.notesSection}>
                  <AppText
                    style={[
                      styles.sectionLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Notes
                  </AppText>
                  <AppText style={[styles.notesText, { color: theme.text }]}>
                    {selectedLog.preview}
                  </AppText>
                </View>
              ) : null}
            </ScrollView>

            {/* Actions */}
            <View
              style={[styles.modalActions, { borderTopColor: theme.border }]}
            >
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  { backgroundColor: "#FEF2F2", borderColor: "#FEE2E2" },
                ]}
                onPress={() => selectedLog && handleDeleteLog(selectedLog.id)}
              >
                <Trash2 size={20} color="#EF4444" style={{ marginRight: 8 }} />
                <AppText style={styles.deleteButtonText}>
                  Delete Permanently
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restoreButton}
                onPress={() => {
                  if (selectedLog) {
                    toggleTaskCompletion(selectedLog.id);
                    setPreviewModal(false);
                  }
                }}
              >
                <AppText style={styles.restoreButtonText}>
                  Mark as Not Done
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/(tabs)/inbox?add=true")}
      >
        <View style={styles.addButtonContent}>
          <Plus size={28} color="white" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "600",
    lineHeight: 36,
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  logEntry: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  logEntryLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 4,
  },
  completedCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  todayText: {
    fontSize: 10,
    fontWeight: "500",
  },
  logEntryRight: {
    flex: 1,
  },
  logEntryTitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 20,
  },
  logEntrySubtitle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  logEntrySource: {
    fontSize: 12,
  },
  logEntryPreview: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: "100%",
    maxHeight: "80%",
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  modalScrollView: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  timeLoggedSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
  },
  notesSection: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  modalActions: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  deleteButton: {
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  deleteButtonText: {
    color: "#EF4444",
    fontWeight: "500",
    textAlign: "center",
  },
  restoreButton: {
    paddingVertical: 12,
    borderRadius: 8,
  },
  restoreButtonText: {
    color: "#3b82f6",
    fontWeight: "500",
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#3b82f6",
    borderRadius: 26,
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonContent: {
    flexDirection: "column",
    alignItems: "center",
  },
});
