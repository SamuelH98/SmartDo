import {
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import {
  Inbox,
  Plus,
  X,
  Calendar,
  Tag,
  List,
  Flag,
  Trash2,
  ChevronRight,
} from "lucide-react-native";
import React, { useState, useRef, useEffect } from "react";
import { useTasks, Task } from "@/context/TasksContext";
import { useAreas } from "@/context/AreasContext";
import { DatePickerModal } from "@/components/DatePickerModal";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

export default function InboxScreen() {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskDueDate, setTaskDueDate] = useState<Date | null>(null);
  const lastAddedTaskRef = useRef("");
  const { add: shouldAddTask } = useLocalSearchParams();

  const {
    tasks,
    addTask,
    removeTask,
    toggleTaskCompletion,
    updateTask,
    setTaskSomeday,
    loading,
  } = useTasks();
  const { areas, addTaskToArea } = useAreas();

  const activeTasks = tasks.filter((task) => !task.completed);

  // Open modal when navigated with add=true parameter
  useEffect(() => {
    if (shouldAddTask === "true" && !editingTask && !modalVisible) {
      setModalVisible(true);
    }
  }, [shouldAddTask, editingTask, modalVisible]);

  const handleAddTask = () => {
    if (!taskTitle.trim()) {
      return;
    }

    if (lastAddedTaskRef.current === taskTitle.trim()) {
      return;
    }

    lastAddedTaskRef.current = taskTitle.trim();

    // Format date for storage if it exists
    const dueDateString = taskDueDate ? taskDueDate.toISOString() : undefined;
    addTask(taskTitle, taskNotes, dueDateString);

    setTaskTitle("");
    setTaskNotes("");
    setTaskDueDate(null);
    setModalVisible(false);

    setTimeout(() => {
      lastAddedTaskRef.current = "";
    }, 1000);
  };

  const handleToggleComplete = (taskId: string, event: any) => {
    event.stopPropagation();
    toggleTaskCompletion(taskId);
  };

  const handleTaskSelect = (task: Task) => {
    if (editingTask?.id === task.id) {
      // Save and close
      const dueDateString = taskDueDate ? taskDueDate.toISOString() : undefined;
      updateTask(task.id, taskTitle, taskNotes, dueDateString);
      setEditingTask(null);
      setTaskTitle("");
      setTaskNotes("");
      setTaskDueDate(null);
    } else {
      // Open for editing
      setEditingTask(task);
      setTaskTitle(task.sender);
      setTaskNotes(task.preview || "");
      setTaskDueDate(task.dueDate ? new Date(task.dueDate) : null);
      setModalVisible(false);
    }
  };

  const handleCloseEdit = () => {
    if (editingTask) {
      const dueDateString = taskDueDate ? taskDueDate.toISOString() : undefined;
      updateTask(editingTask.id, taskTitle, taskNotes, dueDateString);
    }
    setEditingTask(null);
    setTaskTitle("");
    setTaskNotes("");
    setTaskDueDate(null);
  };

  // Auto-save when date changes
  useEffect(() => {
    if (editingTask && taskDueDate !== null) {
      const dueDateString = taskDueDate ? taskDueDate.toISOString() : undefined;
      updateTask(editingTask.id, taskTitle, taskNotes, dueDateString);
    }
  }, [taskDueDate, editingTask, taskTitle, taskNotes]);

  const handleDateSelect = (date: Date) => {
    setTaskDueDate(date);
  };

  const handleSelectSomeday = () => {
    if (editingTask) {
      setTaskSomeday(editingTask.id, true);
      setTaskDueDate(null);
    } else if (modalVisible) {
      // For new tasks, we'll handle this differently
      // For now, just close the date picker
    }
  };

  const formatDueDate = (date: Date | string | null) => {
    if (!date) return null;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);

    if (dateObj.getTime() === today.getTime()) {
      return "Today";
    } else if (dateObj.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
      };
      return dateObj.toLocaleDateString("en-US", options);
    }
  };

  const handleMoveToProject = (projectId: string) => {
    if (selectedTask) {
      addTaskToArea(projectId, selectedTask.sender);
      removeTask(selectedTask.id);
      setMoveModal(false);
      setSelectedTask(null);
    }
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { marginTop: -80 }]}>
      {!modalVisible && !editingTask && <Inbox size={64} color="#9CA3AF" />}
    </View>
  );

  const renderMessage = ({ item }: { item: Task }) => {
    const isEditing = editingTask?.id === item.id;

    if (isEditing) {
      return (
        <View
          style={[
            styles.editingTaskCard,
            { backgroundColor: theme.card, borderBottomColor: theme.border },
          ]}
        >
          <View style={styles.taskRow}>
            <TouchableOpacity
              style={[styles.checkbox, { borderColor: theme.checkboxBorder }]}
              onPress={(e) => {
                e.stopPropagation();
                handleToggleComplete(item.id, e);
              }}
            >
              {item.completed && (
                <View
                  style={[
                    styles.checkboxChecked,
                    { backgroundColor: theme.checkbox },
                  ]}
                />
              )}
            </TouchableOpacity>
            <TextInput
              style={[styles.taskTitleInput, { color: theme.text }]}
              placeholder="Task title"
              placeholderTextColor={theme.textTertiary}
              value={taskTitle}
              onChangeText={setTaskTitle}
              onBlur={handleCloseEdit}
              returnKeyType="done"
            />
          </View>

          <TextInput
            style={[
              styles.notesInput,
              { color: theme.text, marginLeft: 12, marginTop: 8 },
            ]}
            placeholder="Notes"
            placeholderTextColor={theme.textTertiary}
            value={taskNotes}
            onChangeText={setTaskNotes}
            multiline
          />

          {/* Due Date Display */}
          {taskDueDate && (
            <View style={[styles.dueDateContainer, { marginLeft: 32 }]}>
              <View style={styles.dueDateTag}>
                <Calendar size={14} color="#3B82F6" />
                <AppText style={styles.dueDateText}>
                  {formatDueDate(taskDueDate)}
                </AppText>
                <TouchableOpacity
                  style={styles.dueDateRemove}
                  onPress={() => setTaskDueDate(null)}
                >
                  <X size={14} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Someday Display */}
          {editingTask && (editingTask as any).someday && (
            <View style={[styles.dueDateContainer, { marginLeft: 32 }]}>
              <View style={styles.somedayTag}>
                <AppText style={styles.somedayText}>Someday</AppText>
                <TouchableOpacity
                  style={styles.dueDateRemove}
                  onPress={() => setTaskSomeday(editingTask.id, false)}
                >
                  <X size={14} color="#7C3AED" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setDatePickerVisible(true)}
            >
              <Calendar size={20} color={taskDueDate ? "#3B82F6" : "#6B7280"} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                /* Handle tag */
              }}
            >
              <Tag size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedTask(item);
                setMoveModal(true);
              }}
            >
              <List size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                /* Handle priority */
              }}
            >
              <Flag size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.taskItem, { backgroundColor: theme.card }]}
        onPress={() => handleTaskSelect(item)}
      >
        <TouchableOpacity
          style={[
            styles.checkbox,
            { borderColor: theme.checkboxBorder, marginTop: 2 },
          ]}
          onPress={(e) => {
            e.stopPropagation();
            handleToggleComplete(item.id, e);
          }}
        >
          {item.completed && (
            <View
              style={[
                styles.checkboxChecked,
                { backgroundColor: theme.checkbox },
              ]}
            />
          )}
        </TouchableOpacity>
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <AppText style={[styles.taskTitle, { color: theme.text, flex: 1 }]}>
              {item.sender}
            </AppText>
            <View style={styles.taskTags}>
              {(item as any).someday && (
                <View style={styles.taskSomedayTag}>
                  <AppText style={styles.taskSomedayText}>Someday</AppText>
                </View>
              )}
              {item.dueDate && (
                <View style={styles.taskDueDateTag}>
                  <Calendar size={12} color="#3B82F6" />
                  <AppText style={styles.taskDueDateText}>
                    {formatDueDate(item.dueDate)}
                  </AppText>
                </View>
              )}
            </View>
          </View>
          {item.preview ? (
            <AppText
              style={[
                styles.taskPreview,
                { color: theme.textSecondary, marginTop: 2 },
              ]}
              numberOfLines={1}
            >
              {item.preview}
            </AppText>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <AppText style={{ color: theme.textSecondary }}>
          Loading tasks...
        </AppText>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (editingTask) {
          handleCloseEdit();
        } else if (modalVisible) {
          setModalVisible(false);
          setTaskTitle("");
          setTaskNotes("");
          setTaskDueDate(null);
        }
      }}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
          <Inbox size={32} color="#3b82f6" />
          <AppText
            style={[styles.headerTitle, { color: theme.text, marginLeft: 12 }]}
          >
            Inbox
          </AppText>
        </View>

        {/* Inline Add Task Card */}
        {modalVisible && (
          <View
            style={[
              styles.addTaskCard,
              { backgroundColor: theme.card, borderBottomColor: theme.border },
            ]}
          >
            <View style={styles.taskRow}>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.checkboxBorder, marginRight: 12 },
                ]}
              />
              <TextInput
                style={[styles.taskTitleInput, { color: theme.text }]}
                placeholder="New To-Do"
                placeholderTextColor={theme.textTertiary}
                value={taskTitle}
                onChangeText={setTaskTitle}
                onSubmitEditing={handleAddTask}
                autoFocus
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>

            <TextInput
              style={[
                styles.notesInput,
                { color: theme.textSecondary, marginLeft: 32 },
              ]}
              placeholder="Notes"
              placeholderTextColor={theme.textTertiary}
              value={taskNotes}
              onChangeText={setTaskNotes}
              multiline
            />

            {/* Due Date Display */}
            {taskDueDate && (
              <View style={[styles.dueDateContainer, { marginLeft: 32 }]}>
                <View style={styles.dueDateTag}>
                  <Calendar size={14} color="#3B82F6" />
                  <AppText style={styles.dueDateText}>
                    {formatDueDate(taskDueDate)}
                  </AppText>
                  <TouchableOpacity
                    style={styles.dueDateRemove}
                    onPress={() => setTaskDueDate(null)}
                  >
                    <X size={14} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Action Bar */}
            <View style={styles.actionBar}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setDatePickerVisible(true)}
              >
                <Calendar
                  size={20}
                  color={taskDueDate ? "#3B82F6" : "#6B7280"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  /* Handle tag */
                }}
              >
                <Tag size={20} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  /* Handle project */
                }}
              >
                <List size={20} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  /* Handle priority */
                }}
              >
                <Flag size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <FlatList
          data={activeTasks}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={activeTasks.length === 0 ? { flex: 1 } : {}}
        />

        {/* Edit Mode Controls */}
        {editingTask && (
          <View
            style={[
              styles.editControls,
              { backgroundColor: theme.card, borderTopColor: theme.border },
            ]}
          >
            <View style={styles.editControlsRow}>
              {/* Move Button */}
              <TouchableOpacity
                style={styles.moveButton}
                onPress={() => {
                  setSelectedTask(editingTask);
                  setMoveModal(true);
                }}
              >
                <ChevronRight size={16} color="#6B7280" />
                <AppText style={styles.moveButtonText}>Move</AppText>
              </TouchableOpacity>

              {/* Trash Button */}
              <TouchableOpacity
                style={styles.trashButton}
                onPress={() => {
                  if (editingTask) removeTask(editingTask.id);
                  setEditingTask(null);
                  setTaskTitle("");
                  setTaskNotes("");
                  setTaskDueDate(null);
                }}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Floating Action Button - Only show when not editing */}
        {!editingTask && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.addButtonContent}>
              <Plus size={28} color="white" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        )}

        {/* Date Picker Modal */}
        <DatePickerModal
          visible={datePickerVisible}
          onClose={() => setDatePickerVisible(false)}
          onSelectDate={handleDateSelect}
          onSelectSomeday={handleSelectSomeday}
          currentDate={taskDueDate}
        />

        {/* Move to Project Modal */}
        <Modal
          visible={moveModal}
          animationType="fade"
          transparent
          onRequestClose={() => setMoveModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: theme.card }]}
            >
              <View style={styles.modalHeader}>
                <AppText style={[styles.modalTitle, { color: theme.text }]}>
                  Move to Project
                </AppText>
                <TouchableOpacity onPress={() => setMoveModal(false)}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                {areas.length === 0 ? (
                  <AppText
                    style={[
                      styles.noProjectsText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    No projects yet. Create one first!
                  </AppText>
                ) : (
                  areas.map((project) => (
                    <TouchableOpacity
                      key={project.id}
                      style={[
                        styles.projectItem,
                        { borderColor: theme.border },
                      ]}
                      onPress={() => handleMoveToProject(project.id)}
                    >
                      <AppText
                        style={[styles.projectName, { color: theme.text }]}
                      >
                        {project.name}
                      </AppText>
                      <AppText
                        style={[
                          styles.projectTaskCount,
                          { color: theme.textSecondary, marginTop: 4 },
                        ]}
                      >
                        {project.tasks.length} task
                        {project.tasks.length !== 1 ? "s" : ""}
                      </AppText>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setMoveModal(false)}
              >
                <AppText style={styles.cancelButtonText}>Cancel</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  editingTaskCard: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderBottomWidth: 1,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  checkboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  taskTitleInput: {
    flex: 1,
    fontSize: 20,
  },
  notesInput: {
    fontSize: 14,
    marginBottom: 16,
  },
  dueDateContainer: {
    marginBottom: 12,
  },
  dueDateTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  dueDateText: {
    fontSize: 14,
    color: "#2563EB",
    marginLeft: 8,
    fontWeight: "500",
  },
  dueDateRemove: {
    marginLeft: 8,
  },
  somedayTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  somedayText: {
    fontSize: 14,
    color: "#7C3AED",
    marginLeft: 8,
    fontWeight: "500",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  taskItem: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTags: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "500",
  },
  taskDueDateTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  taskDueDateText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  taskSomedayTag: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskSomedayText: {
    color: "#7C3AED",
    fontSize: 11,
    fontWeight: "500",
  },
  taskPreview: {
    fontSize: 14,
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
  addTaskCard: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderBottomWidth: 1,
  },
  editControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  editControlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  moveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  moveButtonText: {
    color: "#374151",
    fontWeight: "500",
    marginLeft: 8,
  },
  trashButton: {
    padding: 10,
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
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderRadius: 16,
    marginHorizontal: 24,
    width: "85%",
    maxHeight: "60%",
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  modalScrollView: {
    maxHeight: 320,
  },
  noProjectsText: {
    textAlign: "center",
    paddingVertical: 16,
  },
  projectItem: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "500",
  },
  projectTaskCount: {
    fontSize: 12,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  cancelButtonText: {
    textAlign: "center",
    color: "#374151",
    fontWeight: "500",
  },
});
