import {
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  X,
  Trash2,
  Plus,
  Circle,
  Calendar,
  Tag,
  List,
  Flag,
  ChevronRight,
  ChevronDown,
} from "lucide-react-native";
import { useProjects } from "@/context/ProjectsContext";
import { useAreas } from "@/context/AreasContext";
import { useTasks } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";

export default function ProjectScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const { theme } = useTheme();
  const {
    projects,
    addTaskToProject,
    deleteTaskFromProject,
    toggleTaskCompletion,
    deleteProject,
  } = useProjects();
  const { areas } = useAreas();
  const {
    tasks,
    addTask,
    addCompletedTask,
    removeTask,
    toggleTaskCompletion: toggleInboxTaskCompletion,
  } = useTasks();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [moveModal, setMoveModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (!project && projectId) {
      router.back();
    }
  }, [project, projectId]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      return;
    }

    if (projectId) {
      addTaskToProject(projectId as string, newTaskTitle);
    }

    setNewTaskTitle("");
    setTaskNotes("");
    setModalVisible(false);
  };

  const handleTaskSelect = (task: any) => {
    if (editingTask?.id === task.id) {
      // Save and close
      setEditingTask(null);
      setNewTaskTitle("");
      setTaskNotes("");
    } else {
      // Open for editing
      setEditingTask(task);
      setNewTaskTitle(task.title);
      setTaskNotes("");
      setModalVisible(false);
    }
  };

  const handleCloseEdit = () => {
    if (editingTask) {
      setEditingTask(null);
      setNewTaskTitle("");
      setTaskNotes("");
    }
  };

  const handleToggleTaskCompletion = (taskId: string) => {
    if (projectId) {
      const task = project?.tasks.find((t) => t.id === taskId);

      if (task && !task.completed) {
        // When completing a project task, add it directly to logbook as completed
        addCompletedTask(task.title, "");
      }

      // Toggle completion in the project
      toggleTaskCompletion(projectId as string, taskId);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (projectId) {
      deleteTaskFromProject(projectId as string, taskId);
    }
  };

  const handleDeleteProject = () => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project and all its tasks?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (project && project.id && !isDeleting) {
              setIsDeleting(true);
              deleteProject(project.id);
              // Navigate back to home screen directly
              router.replace("/");
            }
          },
        },
      ],
    );
  };

  if (!project || isDeleting) {
    return null;
  }

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { marginTop: -80 }]}>
      {!modalVisible && <Circle size={64} color="#9CA3AF" />}
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top", "bottom"]}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          if (modalVisible) {
            setModalVisible(false);
            setNewTaskTitle("");
            setTaskNotes("");
          }
        }}
      >
        <View style={styles.container}>
          {/* Header */}
          <View
            style={[styles.header, { borderBottomColor: theme.borderLight }]}
          >
            <Circle size={32} color="#7F8082" />
            <AppText
              style={[styles.title, { color: theme.text, marginLeft: 12 }]}
            >
              {project.name}
            </AppText>
            <TouchableOpacity
              style={styles.chevronButton}
              onPress={() => setShowDeleteOptions(!showDeleteOptions)}
            >
              <ChevronDown
                size={24}
                color="#6B7280"
                style={[
                  styles.chevronIcon,
                  showDeleteOptions && styles.chevronIconRotated,
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* Delete Options */}
          {showDeleteOptions && (
            <View
              style={[
                styles.deleteOptions,
                {
                  backgroundColor: theme.card,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteProject}
              >
                <Trash2 size={20} color="#EF4444" />
                <AppText style={styles.deleteButtonText}>
                  Delete Project
                </AppText>
              </TouchableOpacity>
            </View>
          )}
          {/* Inline Add Task Card */}
          {modalVisible && (
            <View
              style={[
                styles.addTaskCard,
                {
                  backgroundColor: theme.card,
                  borderBottomColor: theme.border,
                },
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
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
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

              {/* Action Bar */}
              <View style={styles.actionBar}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    /* Handle date */
                  }}
                >
                  <Calendar size={20} color="#6B7280" />
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
                    /* Handle priority */
                  }}
                >
                  <Flag size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={project.tasks}
            renderItem={({ item: task }) => {
              const isEditing = editingTask?.id === task.id;

              if (isEditing) {
                return (
                  <View
                    style={[
                      styles.editingTaskCard,
                      {
                        backgroundColor: theme.card,
                        borderBottomColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.taskRow}>
                      <TouchableOpacity
                        style={[
                          styles.checkbox,
                          { borderColor: theme.checkboxBorder },
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          // Don't move to inbox when editing in project
                        }}
                      >
                        {task.completed && (
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
                        value={newTaskTitle}
                        onChangeText={setNewTaskTitle}
                        onBlur={handleCloseEdit}
                        returnKeyType="done"
                      />
                    </View>

                    <TextInput
                      style={[
                        styles.notesInput,
                        {
                          color: theme.textSecondary,
                          marginLeft: 12,
                          marginTop: 8,
                        },
                      ]}
                      placeholder="Notes"
                      placeholderTextColor={theme.textTertiary}
                      value={taskNotes}
                      onChangeText={setTaskNotes}
                      multiline
                    />

                    {/* Action Bar */}
                    <View style={styles.actionBar}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          /* Handle date */
                        }}
                      >
                        <Calendar size={20} color="#6B7280" />
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
                  style={[
                    styles.taskItem,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.borderLight,
                    },
                  ]}
                  onPress={() => handleTaskSelect(task)}
                >
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleToggleTaskCompletion(task.id);
                    }}
                    style={[
                      styles.checkbox,
                      { borderColor: theme.checkboxBorder, marginTop: 2 },
                    ]}
                  >
                    {task.completed && (
                      <View
                        style={[
                          styles.checkboxChecked,
                          { backgroundColor: theme.checkbox },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                  <AppText
                    style={[
                      styles.taskText,
                      task.completed && styles.taskTextCompleted,
                      {
                        color: task.completed ? theme.textTertiary : theme.text,
                      },
                    ]}
                  >
                    {task.title}
                  </AppText>
                  <TouchableOpacity onPress={() => handleDeleteTask(task.id)}>
                    <X size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={
              project.tasks.length === 0 ? { flex: 1 } : {}
            }
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
                    if (editingTask) {
                      handleDeleteTask(editingTask.id);
                      setEditingTask(null);
                      setNewTaskTitle("");
                      setTaskNotes("");
                    }
                  }}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Floating Action Button */}
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

          {/* Move to Area Modal */}
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
                    Move to Area
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
                      No areas yet.
                    </AppText>
                  ) : (
                    areas.map((area) => (
                      <TouchableOpacity
                        key={area.id}
                        style={[
                          styles.projectItem,
                          { borderColor: theme.border },
                        ]}
                        onPress={() => {
                          if (selectedTask && projectId) {
                            // Add task to new area
                            // Note: This would need to be implemented in AreasContext
                            // addTaskToArea(area.id, selectedTask.title);
                            // Remove from current project
                            deleteTaskFromProject(
                              projectId as string,
                              selectedTask.id,
                            );
                            setMoveModal(false);
                            setSelectedTask(null);
                            setEditingTask(null);
                          }
                        }}
                      >
                        <AppText
                          style={[styles.projectName, { color: theme.text }]}
                        >
                          {area.name}
                        </AppText>
                        <AppText
                          style={[
                            styles.projectTaskCount,
                            { color: theme.textSecondary, marginTop: 4 },
                          ]}
                        >
                          {area.tasks.length} task
                          {area.tasks.length !== 1 ? "s" : ""}
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
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
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
  title: {
    fontSize: 30,
    fontWeight: "600",
    lineHeight: 36,
    flex: 1,
  },
  chevronButton: {
    padding: 8,
    marginLeft: 12,
  },
  chevronIcon: {
    transition: "transform 0.2s",
  },
  chevronIconRotated: {
    transform: [{ rotate: "180deg" }],
  },
  deleteOptions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  noTasks: {
    textAlign: "center",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  checkboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
  },
  addTaskInput: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  addTaskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
  },
  addTaskTextInput: {
    flex: 1,
    fontSize: 16,
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
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  taskTitleInput: {
    flex: 1,
    fontSize: 20,
  },
  notesInput: {
    fontSize: 14,
    marginBottom: 16,
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
