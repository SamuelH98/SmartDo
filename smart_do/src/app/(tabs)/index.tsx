import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import { useState } from "react";
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
} from "lucide-react-native";
import { useAreas } from "@/context/AreasContext";
import { useTasks } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";

export default function IndexScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const {
    areas,
    addArea,
    deleteArea,
    addTaskToArea,
    deleteTaskFromArea,
    toggleTaskCompletion,
  } = useAreas();
  const {
    tasks,
    addTask,
    toggleTaskCompletion: toggleInboxTaskCompletion,
  } = useTasks();
  const [newAreaModalVisible, setNewAreaModalVisible] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedList, setSelectedList] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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

  const openAreaDetails = (areaId: string) => {
    router.push(`/area?areaId=${areaId}`);
  };

  // Search functionality
  const getSearchResults = () => {
    if (!searchQuery.trim())
      return { inboxTasks: [], areas: [], areaTasks: [] };

    const query = searchQuery.toLowerCase();

    // Search inbox tasks
    const matchedInboxTasks = tasks.filter(
      (task) =>
        task.sender.toLowerCase().includes(query) ||
        task.preview.toLowerCase().includes(query),
    );

    // Search areas
    const matchedAreas = areas.filter((area) =>
      area.name.toLowerCase().includes(query),
    );

    // Search tasks within areas
    const matchedAreaTasks: { areaName: string; areaId: string; task: any }[] =
      [];
    areas.forEach((area) => {
      area.tasks.forEach((task) => {
        if (task.title.toLowerCase().includes(query)) {
          matchedAreaTasks.push({
            areaName: area.name,
            areaId: area.id,
            task,
          });
        }
      });
    });

    return {
      inboxTasks: matchedInboxTasks,
      areas: matchedAreas,
      areaTasks: matchedAreaTasks,
    };
  };

  const searchResults = getSearchResults();

  // Count tasks created today
  const getTasksCreatedTodayCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    return tasks.filter((task) => {
      const taskDate = new Date(task.timestamp);
      taskDate.setHours(0, 0, 0, 0); // Start of task day
      return taskDate.getTime() === today.getTime();
    }).length;
  };

  const tasksCreatedTodayCount = getTasksCreatedTodayCount();

  // Calculate inbox tasks count (only for Inbox row)
  const getInboxTasksCount = () => {
    return tasks.filter((task) => !task.completed).length;
  };

  // Calculate total incomplete tasks across all areas (for Today row)
  const getTotalIncompleteTasks = () => {
    const inboxCount = tasks.filter((task) => !task.completed).length;
    const areasCount = areas.reduce(
      (sum, a) => sum + a.tasks.filter((t) => !t.completed).length,
      0,
    );
    return inboxCount + areasCount;
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
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background }]}
        >
          {/* Status Bar Area */}
          <View style={styles.statusBarArea} />

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <View
              style={[styles.searchBar, { backgroundColor: theme.borderLight }]}
            >
              {/* 1. Left Icon: Only visible when typing or focused */}
              {(isSearching || searchQuery.length > 0) && (
                <Search size={20} color="#7F8082" style={styles.searchIcon} />
              )}

              {/* 2. Centered Overlay: Visible when NOT focused and empty */}
              {/* pointerEvents="none" allows clicks to pass through to the input behind it */}
              {!isSearching && searchQuery.length === 0 && (
                <View style={styles.centeredOverlay} pointerEvents="none">
                  <Search size={20} color="#7F8082" />
                  <AppText
                    style={[
                      styles.centeredPlaceholderText,
                      {
                        color: theme.textSecondary,
                      },
                    ]}
                  >
                    Quick Find
                  </AppText>
                </View>
              )}

              {/* 3. The Input Field */}
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearching(true)}
                onBlur={() => {
                  // Return to centered state if empty when clicking away
                  if (searchQuery.length === 0) setIsSearching(false);
                }}
                returnKeyType="search"
              />

              {/* 4. Clear Button */}
              {searchQuery.length > 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    // Optional: Keep focus or dismiss keyboard depending on preference
                    // setIsSearching(false);
                  }}
                >
                  <X size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ) : (
                // Add spacer only when searching to keep input from hitting the edge
                isSearching && <View style={styles.clearButtonSpacer} />
              )}
            </View>
          </View>

          {/* Lists */}
          <ScrollView style={styles.scrollView}>
            {isSearching && searchQuery.trim() !== "" ? (
              // Search Results View
              <>
                {searchQuery.trim() === "" ? (
                  <AppText
                    style={[styles.noResults, { color: theme.textTertiary }]}
                  >
                    Start typing to search...
                  </AppText>
                ) : (
                  <>
                    {/* Inbox Tasks Results */}
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

                    {/* Areas Results */}
                    {searchResults.areas.length > 0 && (
                      <View style={styles.searchSection}>
                        <AppText
                          style={[
                            styles.sectionTitle,
                            { color: theme.textSecondary },
                          ]}
                        >
                          Areas ({searchResults.areas.length})
                        </AppText>
                        {searchResults.areas.map((area) => (
                          <TouchableOpacity
                            key={area.id}
                            onPress={() => {
                              setSearchQuery("");
                              setIsSearching(false);
                              openAreaDetails(area.id);
                            }}
                            style={[
                              styles.searchResultItemWithRow,
                              {
                                backgroundColor: theme.card,
                                borderColor: theme.border,
                              },
                            ]}
                          >
                            <Circle size={24} color="#7F8082" />
                            <View style={styles.areaInfo}>
                              <AppText
                                style={[styles.areaName, { color: theme.text }]}
                              >
                                {area.name}
                              </AppText>
                              <AppText
                                style={[
                                  styles.taskCount,
                                  { color: theme.textSecondary },
                                ]}
                              >
                                {area.tasks.length}{" "}
                                {area.tasks.length === 1 ? "task" : "tasks"}
                              </AppText>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Area Tasks Results */}
                    {searchResults.areaTasks.length > 0 && (
                      <View style={styles.searchSection}>
                        <AppText
                          style={[
                            styles.sectionTitle,
                            { color: theme.textSecondary },
                          ]}
                        >
                          Tasks in Areas ({searchResults.areaTasks.length})
                        </AppText>
                        {searchResults.areaTasks.map((result, index) => (
                          <TouchableOpacity
                            key={`${result.areaId}-${result.task.id}`}
                            onPress={() => {
                              setSearchQuery("");
                              setIsSearching(false);
                              openAreaDetails(result.areaId);
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
                              style={[
                                styles.areaTaskArea,
                                { color: theme.textTertiary },
                              ]}
                            >
                              {result.areaName}
                            </AppText>
                            <AppText
                              style={[styles.taskTitle, { color: theme.text }]}
                            >
                              {result.task.title}
                            </AppText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* No Results */}
                    {searchResults.inboxTasks.length === 0 &&
                      searchResults.areas.length === 0 &&
                      searchResults.areaTasks.length === 0 && (
                        <AppText
                          style={[
                            styles.noResults,
                            { color: theme.textTertiary },
                          ]}
                        >
                          No results found for "{searchQuery}"
                        </AppText>
                      )}
                  </>
                )}
              </>
            ) : (
              // Normal Lists View
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

                {/* Areas Section */}

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

                {areas.length === 0 && !newAreaModalVisible ? (
                  <AppText
                    style={[styles.noAreas, { color: theme.textTertiary }]}
                  >
                    No areas yet
                  </AppText>
                ) : (
                  areas.map((area) => (
                    <TouchableOpacity
                      key={area.id}
                      onPress={() => openAreaDetails(area.id)}
                      style={[styles.areaItem, { borderColor: theme.border }]}
                    >
                      <Box size={26} color="#7F8082" />
                      <View style={styles.areaItemContent}>
                        <AppText
                          style={[styles.areaItemText, { color: theme.text }]}
                        >
                          {area.name}
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}
          </ScrollView>

          {/* Floating Action Buttons */}
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

          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setNewAreaModalVisible(true)}
          >
            <View style={styles.addButtonContent}>
              <Plus size={28} color="white" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBarArea: {
    height: 48,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchBar: {
    borderRadius: 12,
    height: 48,
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
    marginTop: 10,
  },
  centeredText: {
    lineHeight: 16,
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
  searchResultItemWithRow: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  taskPreview: {
    fontSize: 14,
  },
  areaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  areaName: {
    fontSize: 16,
    fontWeight: "500",
  },
  taskCount: {
    fontSize: 14,
  },
  areaTaskArea: {
    fontSize: 12,
    marginBottom: 8,
  },
  noResults: {
    textAlign: "center",
    paddingVertical: 32,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    backgroundColor: "#EF4444",
    borderRadius: 14,
    minWidth: 28,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    textAlign: "center",
    lineHeight: 28,
  },
  badgeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  noAreas: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  areaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderRadius: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  areaItemContent: {
    flex: 1,
  },
  areaItemText: {
    fontWeight: "500",
    marginLeft: 12,
    marginTop: 8,
    fontSize: 18,
    lineHeight: 24,
  },
  settingsFloatingButton: {
    position: "absolute",
    bottom: 2,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    borderRadius: 10,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignSelf: "center",
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
    lineHeight: 18,
    top: 4,
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
