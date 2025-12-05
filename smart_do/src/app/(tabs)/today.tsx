import {
  View,
  SectionList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { AppText } from "@/components/AppText";
import { Check, X, Star, Plus, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { useTasks, Task } from "@/context/TasksContext";
import { useAreas, AreaTask, Area } from "@/context/AreasContext";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

interface UnifiedTask {
  id: string;
  title?: string;
  sender?: string;
  preview?: string;
  completed: boolean;
  isArea: boolean;
  areaId?: string;
  dueDate?: string;
  time?: string;
  timestamp?: number;
  subject?: string;
}

export default function TodayScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { tasks, toggleTaskCompletion } = useTasks();
  const { areas, toggleTaskCompletion: toggleAreaTask } = useAreas();
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UnifiedTask | null>(null);

  // Filter to only show incomplete tasks in Inbox
  const incompleteTasks = tasks.filter((task) => !task.completed);

  // Calculate total incomplete tasks across all areas
  const getTotalIncompleteTasks = () => {
    const inboxCount = incompleteTasks.length;
    const areasCount = areas.reduce(
      (sum, a) => sum + a.tasks.filter((t) => !t.completed).length,
      0,
    );
    return inboxCount + areasCount;
  };

  // Prepare sections: Only show areas (all tasks including completed)
  const getSectionData = () => {
    const sections = [];

    // Add Inbox section if there are incomplete tasks
    if (incompleteTasks.length > 0) {
      sections.push({
        title: "Inbox",
        data: incompleteTasks.map((task) => ({ ...task, isArea: false })),
        isArea: false,
      });
    }

    // Add each area as a section with ALL its tasks (completed and incomplete)
    areas.forEach((area) => {
      sections.push({
        title: area.name,
        data: area.tasks.map((task) => ({
          ...task,
          isArea: true,
          areaId: area.id,
        })),
        isArea: true,
        areaId: area.id,
      });
    });

    return sections;
  };

  const sections = getSectionData();

  const handleToggleComplete = (
    taskId: string,
    isArea: boolean,
    areaId?: string,
    event?: any,
  ) => {
    if (event) {
      event.stopPropagation();
    }
    if (isArea && areaId) {
      // For area tasks, we toggle completion (they stay in area)
      toggleAreaTask(areaId, taskId);
    } else {
      // For inbox tasks, marking done moves them to logbook
      toggleTaskCompletion(taskId);
    }
  };

  const handlePreview = (task: any, isArea: boolean, areaId?: string) => {
    setSelectedTask({ ...task, isArea, areaId });
    setPreviewModal(true);
  };

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View
      style={[
        styles.sectionHeader,
        { backgroundColor: theme.card, borderBottomColor: theme.borderLight },
      ]}
    >
      <View style={styles.sectionHeaderLeft}>
        <View style={[styles.sectionDot, { backgroundColor: "#facc15" }]} />
        <AppText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {title}
        </AppText>
      </View>
      <ChevronRight size={16} color="#D1D5DB" />
    </View>
  );

  const renderTaskItem = ({
    item,
    section,
  }: {
    item: UnifiedTask;
    section: any;
  }) => (
    <TouchableOpacity
      style={[
        styles.taskItem,
        { backgroundColor: theme.card, borderBottomColor: theme.borderLight },
      ]}
      onPress={() => handlePreview(item, item.isArea, item.areaId)}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: theme.checkboxBorder, marginTop: 2 },
        ]}
        onPress={(e) =>
          handleToggleComplete(item.id, item.isArea, item.areaId, e)
        }
      >
        {item.completed && <Check size={14} color="#3B82F6" strokeWidth={3} />}
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <View style={styles.taskRow}>
          <View style={[styles.taskDot, { backgroundColor: "#facc15" }]} />
          <AppText
            style={[
              styles.taskText,
              {
                color: item.completed ? theme.textTertiary : theme.text,
                textDecorationLine: item.completed ? "line-through" : "none",
              },
            ]}
          >
            {item.isArea ? item.title : item.sender}
          </AppText>
        </View>

        {!item.isArea && item.preview ? (
          <AppText
            style={[
              styles.taskPreview,
              { color: theme.textTertiary, marginTop: 4, marginLeft: 14 },
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
        <Star size={32} color="#facc15" />
        <AppText
          style={[styles.headerTitle, { color: theme.text, marginLeft: 12 }]}
        >
          Today
        </AppText>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderTaskItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => item.id + index}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={[styles.emptyState, { marginTop: -80 }]}>
            <Star size={64} color="#9CA3AF" />
          </View>
        }
        contentContainerStyle={
          sections.length === 0 ? { flex: 1 } : { paddingBottom: 100 }
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
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.border }]}
            >
              <AppText style={[styles.modalTitle, { color: theme.text }]}>
                {selectedTask?.isArea
                  ? selectedTask?.title
                  : selectedTask?.sender}
              </AppText>
              <TouchableOpacity onPress={() => setPreviewModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {!selectedTask?.isArea && selectedTask?.preview ? (
                <View style={styles.notesSection}>
                  <AppText
                    style={[styles.notesLabel, { color: theme.textSecondary }]}
                  >
                    Notes
                  </AppText>
                  <AppText style={[styles.notesText, { color: theme.text }]}>
                    {selectedTask.preview}
                  </AppText>
                </View>
              ) : null}
            </ScrollView>

            <View
              style={[styles.modalActions, { borderTopColor: theme.border }]}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (selectedTask?.isArea && selectedTask?.areaId) {
                    toggleAreaTask(selectedTask.areaId, selectedTask.id);
                  } else if (selectedTask?.id) {
                    toggleTaskCompletion(selectedTask.id);
                  }
                  setPreviewModal(false);
                }}
              >
                <AppText style={styles.actionButtonText}>
                  {selectedTask?.completed
                    ? "Mark as Not Done"
                    : "Mark as Done"}
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
        <Plus size={28} color="white" strokeWidth={2.5} />
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
    paddingBottom: 28,
    paddingTop: 28,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "600",
    lineHeight: 36,
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  taskItem: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  taskText: {
    fontSize: 15,
    flex: 1,
  },
  taskPreview: {
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
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
  notesSection: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 12,
    marginBottom: 4,
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
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    textAlign: "center",
    color: "#3b82f6",
    fontWeight: "500",
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#3b82f6",
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
