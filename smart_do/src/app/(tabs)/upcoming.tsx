import { View, SectionList, TouchableOpacity, StyleSheet } from "react-native";
import { AppText } from "@/components/AppText";
import { Calendar, Plus, Check, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTasks, Task } from "@/context/TasksContext";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

export default function UpcomingScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { tasks, toggleTaskCompletion } = useTasks();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDayLabel = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  const getDateFromDaysFromNow = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const sections = [
    {
      day: 6,
      label: getDayLabel(1),
      key: "tomorrow",
      date: getDateFromDaysFromNow(1),
    },
    {
      day: 7,
      label: getDayLabel(2),
      key: "day2",
      date: getDateFromDaysFromNow(2),
    },
    {
      day: 8,
      label: getDayLabel(3),
      key: "day3",
      date: getDateFromDaysFromNow(3),
    },
    {
      day: 9,
      label: getDayLabel(4),
      key: "day4",
      date: getDateFromDaysFromNow(4),
    },
  ];

  const isSameDay = (date1: Date, date2: Date | string) => {
    const d1 = new Date(date1);
    const d2 = typeof date2 === "string" ? new Date(date2) : date2;

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    return d1.getTime() === d2.getTime();
  };

  const getSectionData = useMemo(() => {
    // First 4 days
    const firstFourDays = sections.map((section) => ({
      ...section,
      data: tasks.filter(
        (task) =>
          !task.completed &&
          task.dueDate &&
          isSameDay(section.date, task.dueDate),
      ),
    }));

    // Get all tasks with dates beyond the first 4 days
    const fourDaysOut = getDateFromDaysFromNow(4);
    const futureTasks = tasks.filter((task) => {
      if (!task.dueDate || task.completed) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate > fourDaysOut;
    });

    if (futureTasks.length === 0) {
      return firstFourDays;
    }

    // Group future tasks by date
    const futureTasksByDate = new Map<string, any[]>();

    futureTasks.forEach((task) => {
      const taskDate = new Date(task.dueDate!);
      taskDate.setHours(0, 0, 0, 0);
      const dateKey = taskDate.toISOString();

      if (!futureTasksByDate.has(dateKey)) {
        futureTasksByDate.set(dateKey, []);
      }
      futureTasksByDate.get(dateKey)!.push(task);
    });

    // Create sections for future tasks
    const futureSections = Array.from(futureTasksByDate.entries())
      .map(([dateKey, tasks]) => {
        const date = new Date(dateKey);
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        return {
          day: date.getDate(),
          label: `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`,
          key: dateKey,
          date,
          isFuture: true,
          data: tasks.sort((a, b) => a.timestamp - b.timestamp),
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return [...firstFourDays, ...futureSections];
  }, [tasks]);

  const handleToggleComplete = (taskId: string, event: any) => {
    event.stopPropagation();
    toggleTaskCompletion(taskId);
  };

  const handleQuickDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const formatSelectedDate = (date: Date | null) => {
    if (!date) return "Select date";

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    if (dateToCheck.getTime() === today.getTime()) {
      return "Today";
    } else if (dateToCheck.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
    }
  };

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View
      style={[
        styles.sectionHeader,
        { backgroundColor: theme.card, borderBottomColor: theme.borderLight },
      ]}
    >
      <View style={styles.sectionHeaderLeft}>
        <AppText
          style={[
            styles.sectionDay,
            { color: theme.textTertiary, marginRight: 12 },
          ]}
        >
          {section.day}
        </AppText>
        <AppText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          {section.label}
        </AppText>
      </View>
      <ChevronRight size={18} color="#D1D5DB" />
    </View>
  );

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[
        styles.taskItem,
        { backgroundColor: theme.card, borderBottomColor: theme.borderLight },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: theme.checkboxBorder, marginRight: 12 },
        ]}
        onPress={(e) => handleToggleComplete(item.id, e)}
      >
        {item.completed && <Check size={14} color="#3B82F6" strokeWidth={3} />}
      </TouchableOpacity>
      <AppText
        style={[
          styles.taskText,
          {
            color: item.completed ? theme.textTertiary : theme.text,
            textDecorationLine: item.completed ? "line-through" : "none",
          },
        ]}
      >
        {item.sender}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.card, borderBottomColor: theme.borderLight },
        ]}
      >
        <Calendar size={32} color="#ec4899" />
        <AppText
          style={[styles.headerTitle, { color: theme.text, marginLeft: 12 }]}
        >
          Upcoming
        </AppText>
      </View>

      <SectionList
        sections={getSectionData}
        renderItem={renderTaskItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={[styles.emptyState, { marginTop: -80 }]}>
            <Calendar size={64} color="#9CA3AF" />
          </View>
        }
        contentContainerStyle={
          getSectionData.every((s) => s.data.length === 0)
            ? { flex: 1 }
            : { paddingBottom: 100 }
        }
      />

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
  sectionDay: {
    fontSize: 48,
    fontWeight: "200",
    lineHeight: 56,
    minWidth: 60,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "500",
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
  },
  taskText: {
    flex: 1,
    fontSize: 16,
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
