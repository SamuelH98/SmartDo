import { View, SectionList, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { Clock, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTasks } from "@/context/TasksContext";
import { useAreas } from "@/context/AreasContext";
import { useProjects } from "@/context/ProjectsContext";
import { useTheme } from "@/context/ThemeContext";

interface Task {
  id: string;
  sender: string;
  preview?: string;
  completed: boolean;
  dueDate?: string;
}

interface AreaTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Area {
  id: string;
  name: string;
  tasks: AreaTask[];
}

interface UnifiedTask {
  id: string;
  title?: string;
  sender?: string;
  preview?: string;
  completed: boolean;
  isArea: boolean;
  areaId?: string;
  isProjectTask?: boolean;
  dueDate?: string;
  time?: string;
  timestamp?: number;
  subject?: string;
}

interface Section {
  title: string;
  data: UnifiedTask[];
  isArea: boolean;
  areaId?: string;
}

export default function AnytimeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { tasks, toggleTaskCompletion } = useTasks();
  const { areas, toggleTaskCompletion: toggleAreaTask } = useAreas();
  const { projects, toggleTaskCompletion: toggleProjectTask } = useProjects();

  // Filter tasks that don't have due dates and are not completed
  const anytimeTasks = tasks.filter(
    (task: Task) => !task.completed && !task.dueDate,
  );

  // Filter area tasks that don't have due dates and are not completed
  const anytimeAreaTasks = areas
    .map((area: any) => ({
      ...area,
      tasks: area.tasks.filter((task: any) => !task.completed),
    }))
    .filter((area: any) => area.tasks.length > 0);

  // Filter project tasks that don't have due dates and are not completed
  const anytimeProjectTasks = projects
    .map((project: any) => ({
      ...project,
      tasks: project.tasks.filter((task: any) => !task.completed),
    }))
    .filter((project: any) => project.tasks.length > 0);

  const handleToggleComplete = (
    taskId: string,
    isArea: boolean,
    areaId?: string,
    isProjectTask?: boolean,
    event?: any,
  ) => {
    if (event) {
      event.stopPropagation();
    }
    if (isArea && areaId) {
      if (isProjectTask) {
        toggleProjectTask(areaId, taskId);
      } else {
        toggleAreaTask(areaId, taskId);
      }
    } else {
      toggleTaskCompletion(taskId);
    }
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View
      style={[
        styles.sectionHeader,
        { backgroundColor: theme.card, borderBottomColor: theme.borderLight },
      ]}
    >
      <View style={styles.sectionHeaderLeft}>
        <View style={[styles.sectionDot, { backgroundColor: "#06b6d4" }]} />
        <AppText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {section.title}
        </AppText>
      </View>
    </View>
  );

  const renderTaskItem = ({
    item,
    section,
  }: {
    item: UnifiedTask;
    section: Section;
  }) => {
    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          { backgroundColor: theme.card, borderBottomColor: theme.borderLight },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.checkbox,
            { borderColor: theme.checkboxBorder, marginTop: 2 },
          ]}
          onPress={(e) =>
            handleToggleComplete(
              item.id,
              item.isArea,
              item.areaId,
              item.isProjectTask,
              e,
            )
          }
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
          <View style={styles.taskRow}>
            <View style={[styles.taskDot, { backgroundColor: "#06b6d4" }]} />
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
            >
              {item.preview}
            </AppText>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  // Prepare sections for SectionList
  const sections: Section[] = [];

  // Add Inbox section if there are anytime tasks
  if (anytimeTasks.length > 0) {
    sections.push({
      title: "Inbox",
      data: anytimeTasks.map((task) => ({ ...task, isArea: false })),
      isArea: false,
    });
  }

  // Add each area as a section with its anytime tasks
  anytimeAreaTasks.forEach((area: any) => {
    sections.push({
      title: area.name,
      data: area.tasks.map((task: any) => ({
        ...task,
        isArea: true,
        areaId: area.id,
        isProjectTask: false,
      })),
      isArea: true,
      areaId: area.id,
    });
  });

  // Add each project as a section with its anytime tasks
  anytimeProjectTasks.forEach((project: any) => {
    sections.push({
      title: project.name,
      data: project.tasks.map((task: any) => ({
        ...task,
        isArea: true,
        areaId: project.id,
        isProjectTask: true,
      })),
      isArea: true,
      areaId: project.id,
    });
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Clock size={32} color="#06b6d4" />
        <AppText
          style={[styles.headerTitle, { color: theme.text, marginLeft: 12 }]}
        >
          Anytime
        </AppText>
      </View>

      <SectionList
        sections={sections}
        renderItem={({ item, section }) => renderTaskItem({ item, section })}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => item.id + index}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={[styles.emptyState, { marginTop: -80 }]}>
            <Clock size={64} color="#9CA3AF" />
          </View>
        }
        contentContainerStyle={
          sections.length === 0 ? { flex: 1 } : { paddingBottom: 100 }
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/(tabs)/inbox?add=true")}
      >
        <Plus size={28} color="white" strokeWidth={2.5} />
      </TouchableOpacity>
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
  checkboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
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
