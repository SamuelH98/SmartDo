import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  StyleSheet,
  Modal,
  PanResponder,
  LayoutAnimation,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import {
  Inbox,
  Star,
  Calendar,
  Layers,
  Archive,
  CheckSquare,
  Circle,
  Settings,
  Plus,
  Search,
  X,
  Trash2,
  Box,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  MoreVertical,
} from "lucide-react-native";
import { useAreas } from "@/context/AreasContext";
import { useProjects } from "@/context/ProjectsContext";
import { useTasks } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";

export default function IndexScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    areas,
    addArea,
    deleteArea,
    addTaskToArea,
    toggleTaskCompletion: toggleAreaTaskCompletion,
    deleteTaskFromArea,
  } = useAreas();
  const {
    projects,
    addProject,
    deleteProject,
    moveProject,
    getProjectsByArea,
    getStandaloneProjects,
    toggleTaskCompletion: toggleProjectTaskCompletion,
    deleteTaskFromProject,
  } = useProjects();
  const {
    tasks,
    addTask,
    toggleTaskCompletion: toggleInboxTaskCompletion,
    addCompletedTask,
  } = useTasks();
  const [newAreaModalVisible, setNewAreaModalVisible] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedAreaForProject, setSelectedAreaForProject] = useState<
    string | undefined
  >();

  const [selectedList, setSelectedList] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [showAreaDeleteOptions, setShowAreaDeleteOptions] = useState<
    string | null
  >(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    visible: boolean;
    areaId: string;
    areaName: string;
  }>({
    visible: false,
    areaId: "",
    areaName: "",
  });
  const [deleteProjectConfirmModal, setDeleteProjectConfirmModal] = useState<{
    visible: boolean;
    projectId: string;
    projectName: string;
  }>({
    visible: false,
    projectId: "",
    projectName: "",
  });
  const scrollViewRef = useRef<ScrollView>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [highlightedArea, setHighlightedArea] = useState<string | null>(null);
  const [dragStarted, setDragStarted] = useState(false);
  const areaRefs = useRef<Map<string, { y: number; height: number }>>(
    new Map(),
  );

  // PanResponder for drag and drop
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only start dragging if moved more than 5 pixels
        const shouldDrag =
          Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
        if (shouldDrag && !dragStarted) {
          setDragStarted(true);
          setIsDragging(true);
        }
        return shouldDrag;
      },
      onPanResponderGrant: (evt, gestureState) => {
        // Don't set dragging here, wait for actual movement
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!dragStarted) return;

        setDragPosition({
          x: gestureState.dx,
          y: gestureState.dy,
        });

        // Check if dragging over an area using pageY
        const { pageY } = evt.nativeEvent;
        let foundArea: string | null = null;

        areaRefs.current.forEach((bounds, areaId) => {
          if (pageY >= bounds.y && pageY <= bounds.y + bounds.height) {
            foundArea = areaId;
          }
        });

        setHighlightedArea(foundArea);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (dragStarted && highlightedArea) {
          // Create project in the highlighted area
          setSelectedAreaForProject(highlightedArea);
          setNewProjectModalVisible(true);
          setNewAreaModalVisible(false);
        } else if (!dragStarted) {
          // This was a tap, not a drag
          setNewAreaModalVisible(true);
          setNewProjectModalVisible(false);
        }

        // Reset drag state
        setIsDragging(false);
        setDragPosition({ x: 0, y: 0 });
        setHighlightedArea(null);
        setDragStarted(false);
      },
    }),
  ).current;

  const lists = [
    {
      id: "inbox",
      icon: Inbox,
      label: "Inbox",
      color: "#3b82f6",
      action: () => router.push("/inbox"),
      showTotal: true,
    },
    {
      id: "today",
      icon: Star,
      label: "Today",
      color: "#facc15",
      action: () => router.push("/today"),
      showBadge: true,
      showTotal: true,
    },
    {
      id: "upcoming",
      icon: Calendar,
      label: "Upcoming",
      color: "#ec4899",
      action: () => router.push("/upcoming"),
    },
    {
      id: "anytime",
      icon: Layers,
      label: "Anytime",
      color: "#22d3ee",
      action: () => router.push("/anytime"),
    },
    {
      id: "someday",
      icon: Archive,
      label: "Someday",
      color: "#d1d5db",
      action: () => router.push("/someday"),
    },
    {
      id: "logbook",
      icon: CheckSquare,
      label: "Logbook",
      color: "#4ade80",
      isLast: true,
      action: () => router.push("/logbook"),
    },
  ];

  const handleCreateArea = () => {
    if (newAreaName.trim()) {
      addArea(newAreaName);
      setNewAreaName("");
      setNewAreaModalVisible(false);
    }
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName, selectedAreaForProject);
      setNewProjectName("");
      setNewProjectModalVisible(false);
      setSelectedAreaForProject(undefined);
    }
  };

  const toggleAreaExpanded = (areaId: string) => {
    setExpandedAreas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(areaId)) {
        newSet.delete(areaId);
      } else {
        newSet.add(areaId);
      }
      return newSet;
    });
  };

  // Search functionality
  const getSearchResults = () => {
    if (!searchQuery.trim())
      return { inboxTasks: [], areas: [], projects: [], projectTasks: [] };

    const query = searchQuery.toLowerCase();

    const matchedInboxTasks = tasks.filter(
      (task) =>
        task.sender.toLowerCase().includes(query) ||
        task.preview.toLowerCase().includes(query),
    );

    const matchedAreas = areas.filter((area) =>
      area.name.toLowerCase().includes(query),
    );

    const matchedProjects = projects.filter((project) =>
      project.name.toLowerCase().includes(query),
    );

    const matchedProjectTasks: {
      projectName: string;
      projectId: string;
      task: any;
    }[] = [];
    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        if (task.title.toLowerCase().includes(query)) {
          matchedProjectTasks.push({
            projectName: project.name,
            projectId: project.id,
            task,
          });
        }
      });
    });

    return {
      inboxTasks: matchedInboxTasks,
      areas: matchedAreas,
      projects: matchedProjects,
      projectTasks: matchedProjectTasks,
    };
  };

  const searchResults = getSearchResults();

  const getTasksCreatedTodayCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      const taskDate = new Date(task.timestamp);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    }).length;
  };

  const tasksCreatedTodayCount = getTasksCreatedTodayCount();

  const getInboxTasksCount = () => {
    return tasks.filter((task) => !task.completed).length;
  };

  const getTotalIncompleteTasks = () => {
    const inboxCount = tasks.filter((task) => !task.completed).length;
    const projectsCount = projects.reduce(
      (sum, p) => sum + p.tasks.filter((t) => !t.completed).length,
      0,
    );
    return inboxCount + projectsCount;
  };

  const getTasksFromArea = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId);
    const areaProjects = getProjectsByArea(areaId);
    const allTasks: {
      task: any;
      projectName: string;
      projectId: string;
      isAreaTask: boolean;
    }[] = [];

    // Add area tasks
    if (area) {
      area.tasks.forEach((task) => {
        allTasks.push({
          task,
          projectName: area.name,
          projectId: areaId,
          isAreaTask: true,
        });
      });
    }

    // Add project tasks
    areaProjects.forEach((project) => {
      project.tasks.forEach((task) => {
        allTasks.push({
          task,
          projectName: project.name,
          projectId: project.id,
          isAreaTask: false,
        });
      });
    });

    return allTasks.filter(({ task }) => !task.completed);
  };

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback
        onPress={() => {
          if (newAreaModalVisible) {
            setNewAreaModalVisible(false);
            setNewAreaName("");
          }
        }}
      >
        <View
          style={[
            styles.container,
            { backgroundColor: theme.background, paddingTop: insets.top },
          ]}
        >
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <View
              style={[styles.searchBar, { backgroundColor: theme.borderLight }]}
            >
              {(isSearching || searchQuery.length > 0) && (
                <Search size={20} color="#7F8082" style={styles.searchIcon} />
              )}

              {!isSearching && searchQuery.length === 0 && (
                <View style={styles.centeredOverlay} pointerEvents="none">
                  <Search size={20} color="#7F8082" />
                  <AppText
                    style={[
                      styles.centeredPlaceholderText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Quick Find
                  </AppText>
                </View>
              )}

              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearching(true)}
                onBlur={() => {
                  if (searchQuery.length === 0) setIsSearching(false);
                }}
                returnKeyType="search"
              />

              {searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <X size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ) : (
                isSearching && <View style={styles.clearButtonSpacer} />
              )}
            </View>
          </View>

          {/* Lists */}
          <ScrollView style={styles.scrollView} ref={scrollViewRef}>
            {isSearching && searchQuery.trim() !== "" ? (
              <>
                {/* Search Results View */}
                {searchResults.inboxTasks.length > 0 && (
                  <View style={styles.searchSection}>
                    <AppText
                      style={[
                        styles.sectionTitle,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Inbox Tasks ({searchResults.inboxTasks.length})
                    </AppText>
                    {searchResults.inboxTasks.map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        onPress={() => {
                          setSearchQuery("");
                          setIsSearching(false);
                          router.push("/inbox");
                        }}
                        style={[
                          styles.searchResultItem,
                          {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <AppText
                          style={[styles.taskTitle, { color: theme.text }]}
                        >
                          {task.sender}
                        </AppText>
                        <AppText
                          style={[
                            styles.taskPreview,
                            { color: theme.textSecondary },
                          ]}
                          numberOfLines={2}
                        >
                          {task.preview}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {searchResults.areas.length === 0 &&
                  searchResults.projects.length === 0 &&
                  searchResults.projectTasks.length === 0 &&
                  searchResults.inboxTasks.length === 0 && (
                    <AppText
                      style={[styles.noResults, { color: theme.textTertiary }]}
                    >
                      No results found for "{searchQuery}"
                    </AppText>
                  )}
              </>
            ) : (
              <>
                {lists.map((list) => {
                  const Icon = list.icon;
                  const shouldShowBadge =
                    list.showBadge && tasksCreatedTodayCount > 0;

                  return (
                    <TouchableOpacity
                      key={list.id}
                      onPress={() => {
                        setSelectedList(list.id);
                        if (list.action) list.action();
                      }}
                      style={styles.listItem}
                    >
                      <Icon size={26} color={list.color} />
                      <AppText style={[styles.listText, { color: theme.text }]}>
                        {list.label}
                      </AppText>
                      <View style={styles.countContainer}>
                        {shouldShowBadge && (
                          <View style={styles.badge}>
                            <AppText style={styles.badgeText}>
                              {tasksCreatedTodayCount}
                            </AppText>
                          </View>
                        )}
                        {list.showTotal &&
                          (list.id === "inbox"
                            ? getInboxTasksCount()
                            : getTotalIncompleteTasks()) > 0 && (
                            <AppText
                              style={[
                                styles.totalCount,
                                { color: theme.textSecondary },
                              ]}
                            >
                              {list.id === "inbox"
                                ? getInboxTasksCount()
                                : getTotalIncompleteTasks()}
                            </AppText>
                          )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                <View style={[styles.divider, { borderColor: theme.border }]} />

                {/* Inline New Area Card */}
                {newAreaModalVisible && (
                  <View
                    style={[
                      styles.newAreaCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.newAreaInputRow}>
                      <Circle size={26} color="#7F8082" />
                      <TextInput
                        style={styles.newAreaInput}
                        placeholder="New Area"
                        placeholderTextColor={theme.textTertiary}
                        value={newAreaName}
                        onChangeText={setNewAreaName}
                        onSubmitEditing={handleCreateArea}
                        autoFocus
                        returnKeyType="done"
                        blurOnSubmit={true}
                      />
                    </View>
                  </View>
                )}

                {/* Areas with nested projects */}
                {areas.map((area) => {
                  const areaProjects = getProjectsByArea(area.id);
                  const isExpanded = expandedAreas.has(area.id);

                  return (
                    <View key={area.id}>
                      <TouchableOpacity
                        onPress={() => toggleAreaExpanded(area.id)}
                        onLongPress={() => {
                          // Hold to delete area
                          setDeleteConfirmModal({
                            visible: true,
                            areaId: area.id,
                            areaName: area.name,
                          });
                        }}
                        onLayout={(event) => {
                          const { y, height } = event.nativeEvent.layout;
                          areaRefs.current.set(area.id, { y, height });
                        }}
                        style={[
                          styles.areaItem,
                          {
                            borderColor: theme.border,
                            backgroundColor:
                              highlightedArea === area.id
                                ? theme.borderLight
                                : "transparent",
                          },
                        ]}
                      >
                        <View style={styles.areaHeader}>
                          <Box size={24} color="#7F8082" />
                          <AppText
                            style={[styles.areaItemText, { color: theme.text }]}
                          >
                            {area.name}
                          </AppText>
                          {areaProjects.length > 0 && (
                            <AppText
                              style={[
                                styles.projectCount,
                                { color: theme.textSecondary },
                              ]}
                            >
                              {areaProjects.length}
                            </AppText>
                          )}

                          <TouchableOpacity
                            onPress={() =>
                              setShowAreaDeleteOptions(
                                showAreaDeleteOptions === area.id
                                  ? null
                                  : area.id,
                              )
                            }
                            style={styles.chevronButton}
                          >
                            <ChevronDown
                              size={16}
                              color="#7F8082"
                              style={[
                                styles.chevronIcon,
                                showAreaDeleteOptions === area.id &&
                                  styles.chevronIconRotated,
                              ]}
                            />
                          </TouchableOpacity>
                          <View style={styles.chevronContainer}>
                            {areaProjects.length > 0 &&
                              (isExpanded ? (
                                <ChevronDown size={20} color="#7F8082" />
                              ) : (
                                <ChevronRight size={20} color="#7F8082" />
                              ))}
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Nested Projects */}
                      {isExpanded &&
                        areaProjects.map((project) => (
                          <View key={project.id}>
                            <TouchableOpacity
                              onPress={() =>
                                router.push(`/project?projectId=${project.id}`)
                              }
                              onLongPress={() => {
                                // Hold to delete project
                                setDeleteProjectConfirmModal({
                                  visible: true,
                                  projectId: project.id,
                                  projectName: project.name,
                                });
                              }}
                              style={[
                                styles.projectItem,
                                {
                                  borderColor: theme.border,
                                },
                              ]}
                            >
                              <Circle size={24} color="#7F8082" />
                              <View style={styles.areaItemContent}>
                                <AppText
                                  style={[
                                    styles.projectItemText,
                                    { color: theme.text },
                                  ]}
                                >
                                  {project.name}
                                </AppText>
                              </View>
                            </TouchableOpacity>

                            {/* Project Tasks */}
                            {project.tasks
                              .filter((task) => !task.completed)
                              .map((task) => (
                                <TouchableOpacity
                                  key={task.id}
                                  onPress={() =>
                                    toggleProjectTaskCompletion(
                                      project.id,
                                      task.id,
                                    )
                                  }
                                  style={[
                                    styles.areaTaskItem,
                                    {
                                      borderColor: theme.border,
                                      backgroundColor: theme.card,
                                    },
                                  ]}
                                >
                                  <View style={styles.areaTaskCheckbox}>
                                    {task.completed && (
                                      <View
                                        style={styles.areaTaskCheckboxChecked}
                                      />
                                    )}
                                  </View>
                                  <AppText
                                    style={[
                                      styles.areaTaskText,
                                      {
                                        color: task.completed
                                          ? theme.textTertiary
                                          : theme.text,
                                        textDecorationLine: task.completed
                                          ? "line-through"
                                          : "none",
                                      },
                                    ]}
                                  >
                                    {task.title}
                                  </AppText>
                                </TouchableOpacity>
                              ))}
                          </View>
                        ))}

                      {/* Area Tasks Summary */}
                      {isExpanded &&
                        (() => {
                          const areaTasks = getTasksFromArea(area.id);
                          return areaTasks.length > 0 ? (
                            <View style={styles.areaTasksSection}>
                              <AppText
                                style={[
                                  styles.areaTasksTitle,
                                  { color: theme.textSecondary },
                                ]}
                              >
                                Tasks ({areaTasks.length})
                              </AppText>
                              {areaTasks.map(
                                ({
                                  task,
                                  projectName,
                                  projectId,
                                  isAreaTask,
                                }) => (
                                  <TouchableOpacity
                                    key={task.id}
                                    onPress={() => {
                                      if (isAreaTask) {
                                        // Move area task to logbook
                                        addCompletedTask(task.title, "");
                                        deleteTaskFromArea(projectId, task.id);
                                      } else {
                                        // Move project task to logbook
                                        addCompletedTask(task.title, "");
                                        deleteTaskFromProject(
                                          projectId,
                                          task.id,
                                        );
                                      }
                                    }}
                                    style={[
                                      styles.areaTaskItem,
                                      {
                                        borderColor: theme.border,
                                        backgroundColor: theme.card,
                                      },
                                    ]}
                                  >
                                    <View style={styles.areaTaskCheckbox}>
                                      {task.completed && (
                                        <View
                                          style={styles.areaTaskCheckboxChecked}
                                        />
                                      )}
                                    </View>
                                    <View style={styles.areaTaskContent}>
                                      <AppText
                                        style={[
                                          styles.areaTaskText,
                                          {
                                            color: task.completed
                                              ? theme.textTertiary
                                              : theme.text,
                                            textDecorationLine: task.completed
                                              ? "line-through"
                                              : "none",
                                          },
                                        ]}
                                      >
                                        {task.title}
                                      </AppText>
                                      <AppText
                                        style={[
                                          styles.areaTaskProject,
                                          { color: theme.textTertiary },
                                        ]}
                                      >
                                        {isAreaTask ? area.name : projectName}
                                      </AppText>
                                    </View>
                                  </TouchableOpacity>
                                ),
                              )}
                            </View>
                          ) : null;
                        })()}
                    </View>
                  );
                })}

                {/* Inline New Project Card */}
                {newProjectModalVisible && (
                  <View
                    style={[
                      styles.newAreaCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View style={styles.newAreaInputRow}>
                      <Circle size={26} color="#7F8082" />
                      <TextInput
                        style={styles.newAreaInput}
                        placeholder={
                          selectedAreaForProject
                            ? `New Project in ${areas.find((a) => a.id === selectedAreaForProject)?.name}`
                            : "New Project"
                        }
                        placeholderTextColor={theme.textTertiary}
                        value={newProjectName}
                        onChangeText={setNewProjectName}
                        onSubmitEditing={handleCreateProject}
                        autoFocus
                        returnKeyType="done"
                        blurOnSubmit={true}
                      />
                    </View>
                  </View>
                )}

                {/* Standalone Projects */}
                {getStandaloneProjects().map((project) => (
                  <View key={project.id}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/project?projectId=${project.id}`)
                      }
                      onLongPress={() => {
                        // Hold to delete project
                        setDeleteProjectConfirmModal({
                          visible: true,
                          projectId: project.id,
                          projectName: project.name,
                        });
                      }}
                      style={[
                        styles.projectItem,
                        {
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Circle size={24} color="#7F8082" />
                      <View style={styles.areaItemContent}>
                        <AppText
                          style={[
                            styles.projectItemText,
                            { color: theme.text },
                          ]}
                        >
                          {project.name}
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          {/* Settings Button */}
          <TouchableOpacity
            style={styles.settingsFloatingButton}
            onPress={() => router.push("/settings")}
          >
            <Settings size={24} color={theme.textSecondary} />
            <AppText
              style={[
                styles.settingsButtonText,
                { color: theme.textSecondary },
              ]}
            >
              Settings
            </AppText>
          </TouchableOpacity>

          {/* FAB */}
          {newAreaModalVisible || newProjectModalVisible ? (
            <View style={styles.fabOptions}>
              <TouchableOpacity
                style={[styles.fabOption, { backgroundColor: theme.card }]}
                onPress={() => {
                  setNewAreaModalVisible(true);
                  setNewProjectModalVisible(false);
                }}
              >
                <AppText style={[styles.fabOptionText, { color: theme.text }]}>
                  New Area
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fabOption, { backgroundColor: theme.card }]}
                onPress={() => {
                  setNewProjectModalVisible(true);
                  setNewAreaModalVisible(false);
                }}
              >
                <AppText style={[styles.fabOptionText, { color: theme.text }]}>
                  New Project
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.fabOption,
                  styles.fabCancel,
                  { backgroundColor: theme.card },
                ]}
                onPress={() => {
                  setNewAreaModalVisible(false);
                  setNewProjectModalVisible(false);
                }}
              >
                <AppText style={[styles.fabOptionText, { color: theme.text }]}>
                  Cancel
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                styles.floatingButtonContainer,
                {
                  transform: [
                    { translateX: dragPosition.x },
                    { translateY: dragPosition.y },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  if (!isDragging) {
                    setNewAreaModalVisible(true);
                    setNewProjectModalVisible(false);
                  }
                }}
                style={[
                  styles.floatingButton,
                  isDragging && styles.floatingButtonDragging,
                ]}
                {...panResponder.panHandlers}
              >
                <View style={styles.addButtonContent}>
                  <Plus size={28} color="white" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Delete Confirmation Modal */}
          <Modal
            visible={deleteConfirmModal.visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() =>
              setDeleteConfirmModal({
                visible: false,
                areaId: "",
                areaName: "",
              })
            }
          >
            <TouchableWithoutFeedback
              onPress={() =>
                setDeleteConfirmModal({
                  visible: false,
                  areaId: "",
                  areaName: "",
                })
              }
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View
                    style={[
                      styles.confirmModal,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <AppText
                      style={[styles.confirmModalTitle, { color: theme.text }]}
                    >
                      Delete Area
                    </AppText>
                    <AppText
                      style={[
                        styles.confirmModalMessage,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Are you sure you want to delete "
                      {deleteConfirmModal.areaName}"? This will also delete all
                      projects within this area.
                    </AppText>
                    <View style={styles.confirmModalButtons}>
                      <TouchableOpacity
                        style={[
                          styles.confirmModalButton,
                          styles.cancelButton,
                          { backgroundColor: theme.borderLight },
                        ]}
                        onPress={() =>
                          setDeleteConfirmModal({
                            visible: false,
                            areaId: "",
                            areaName: "",
                          })
                        }
                      >
                        <AppText
                          style={[
                            styles.confirmModalButtonText,
                            { color: theme.text },
                          ]}
                        >
                          Cancel
                        </AppText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.confirmModalButton,
                          styles.deleteButton,
                          { backgroundColor: "#EF4444" },
                        ]}
                        onPress={() => {
                          deleteArea(deleteConfirmModal.areaId);
                          setDeleteConfirmModal({
                            visible: false,
                            areaId: "",
                            areaName: "",
                          });
                        }}
                      >
                        <AppText style={styles.confirmModalButtonText}>
                          Delete
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Delete Project Confirmation Modal */}
          <Modal
            visible={deleteProjectConfirmModal.visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() =>
              setDeleteProjectConfirmModal({
                visible: false,
                projectId: "",
                projectName: "",
              })
            }
          >
            <TouchableWithoutFeedback
              onPress={() =>
                setDeleteProjectConfirmModal({
                  visible: false,
                  projectId: "",
                  projectName: "",
                })
              }
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View
                    style={[
                      styles.confirmModal,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <AppText
                      style={[styles.confirmModalTitle, { color: theme.text }]}
                    >
                      Delete Project
                    </AppText>
                    <AppText
                      style={[
                        styles.confirmModalMessage,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Are you sure you want to delete "
                      {deleteProjectConfirmModal.projectName}"? This will also
                      delete all tasks within this project.
                    </AppText>
                    <View style={styles.confirmModalButtons}>
                      <TouchableOpacity
                        style={[
                          styles.confirmModalButton,
                          styles.cancelButton,
                          { backgroundColor: theme.borderLight },
                        ]}
                        onPress={() =>
                          setDeleteProjectConfirmModal({
                            visible: false,
                            projectId: "",
                            projectName: "",
                          })
                        }
                      >
                        <AppText
                          style={[
                            styles.confirmModalButtonText,
                            { color: theme.text },
                          ]}
                        >
                          Cancel
                        </AppText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.confirmModalButton,
                          styles.deleteButton,
                          { backgroundColor: "#EF4444" },
                        ]}
                        onPress={() => {
                          deleteProject(deleteProjectConfirmModal.projectId);
                          setDeleteProjectConfirmModal({
                            visible: false,
                            projectId: "",
                            projectName: "",
                          });
                        }}
                      >
                        <AppText style={styles.confirmModalButtonText}>
                          Delete
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBar: {
    borderRadius: 12,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    position: "relative",
  },
  searchIcon: {
    marginRight: 8,
  },
  centeredOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  centeredPlaceholderText: {
    fontSize: 16,
    marginLeft: 8,
    marginTop: 8,
  },
  clearButtonSpacer: {
    width: 18,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    paddingHorizontal: 16,
  },
  searchResultItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  taskPreview: {
    fontSize: 14,
  },
  noResults: {
    textAlign: "center",
    paddingVertical: 32,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 0.5,
    borderRadius: 8,
    marginBottom: 4,
  },
  listText: {
    fontWeight: "500",
    marginLeft: 12,
    marginTop: 8,
    fontSize: 18,
    lineHeight: 24,
    flex: 1,
  },
  countContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    justifyContent: "flex-end",
  },
  badge: {
    backgroundColor: "#E6517D",
    borderRadius: 14,
    minWidth: 28,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  badgeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 3.5,
  },
  totalCount: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 12,
    marginHorizontal: 12,
  },
  newAreaCard: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  newAreaInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  newAreaInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    marginLeft: 12,
  },

  areaItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
  },
  areaHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevronContainer: {
    width: 20,
    marginLeft: 0,
    alignItems: "center",
  },
  areaItemText: {
    fontWeight: "500",
    marginLeft: 12,
    fontSize: 18,
    flex: 1,
  },
  projectCount: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  addProjectButton: {
    padding: 4,
    marginRight: 8,
  },

  chevronIcon: {
    transition: "transform 0.2s",
  },
  chevronIconRotated: {
    transform: [{ rotate: "180deg" }],
  },

  nestedProject: {
    paddingLeft: 32,
  },
  projectItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
  },
  areaItemContent: {
    flex: 1,
  },
  projectItemText: {
    fontWeight: "500",
    marginLeft: 12,
    fontSize: 16,
  },
  settingsFloatingButton: {
    position: "absolute",
    bottom: 2,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
    top: 4,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  floatingButton: {
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
  fabOptions: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "transparent",
    borderRadius: 12,
    minWidth: 150,
  },
  fabOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  fabCancel: {
    marginBottom: 0,
  },
  fabOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  confirmModal: {
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    width: "100%",
    maxWidth: 320,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  confirmModalMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  confirmModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  confirmModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  chevronButton: {
    padding: 4,
  },
  floatingButtonDragging: {
    backgroundColor: "#22d3ee",
    shadowColor: "#22d3ee",
    shadowOpacity: 0.6,
    elevation: 12,
  },
  areaTasksSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  areaTasksTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    opacity: 0.7,
  },
  areaTaskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginLeft: 32,
    marginRight: 8,
  },
  areaTaskCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#7F8082",
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  areaTaskCheckboxChecked: {
    width: 12,
    height: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  areaTaskContent: {
    flex: 1,
  },
  areaTaskText: {
    fontSize: 16,
    lineHeight: 22,
  },
  areaTaskProject: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
});
