import { View, SectionList, TouchableOpacity, Modal, ScrollView, TextInput } from "react-native";
import { AppText } from "@/components/AppText";
import { Calendar, Plus, X, Check, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { useTasks } from "@/context/TasksContext";

export default function UpcomingScreen() {
  const { tasks, addTask, toggleTaskCompletion } = useTasks();
  const [showCalendarPrompt, setShowCalendarPrompt] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState("tomorrow");

  const getDayLabel = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const sections = [
    { day: 6, label: getDayLabel(1), key: 'tomorrow' },
    { day: 7, label: getDayLabel(2), key: 'day2' },
    { day: 8, label: getDayLabel(3), key: 'day3' },
    { day: 9, label: getDayLabel(4), key: 'day4' },
  ];

  const getSectionData = () => {
    return sections.map(section => ({
      ...section,
      data: tasks.filter(task => !task.completed && task.dueDate === section.key),
    }));
  };

  const handleAddTask = () => {
    if (taskTitle.trim()) {
      addTask(taskTitle, taskNotes, selectedDate);
      setTaskTitle("");
      setTaskNotes("");
      setModalVisible(false);
    }
  };

  const handleToggleComplete = (taskId: string, event: any) => {
    event.stopPropagation();
    toggleTaskCompletion(taskId);
  };

  const renderSectionHeader = ({ section }) => (
    <View className="bg-white px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
      <View className="flex-row items-center">
        <AppText className="text-3xl font-light text-gray-400 mr-3">{section.day}</AppText>
        <AppText className="text-base font-medium text-gray-600">{section.label}</AppText>
      </View>
      <ChevronRight size={18} color="#D1D5DB" />
    </View>
  );

  const renderTaskItem = ({ item, section }) => (
    <TouchableOpacity 
      className="flex-row items-center px-4 py-3 bg-white border-b border-gray-50 active:bg-gray-50"
    >
      <TouchableOpacity 
        className="w-5 h-5 rounded border-2 border-gray-300 justify-center items-center mr-3"
        onPress={(e) => handleToggleComplete(item.id, e)}
      >
        {item.completed && (
          <Check size={14} color="#3B82F6" strokeWidth={3} />
        )}
      </TouchableOpacity>
      <AppText className={`flex-1 text-gray-900 ${item.completed ? 'line-through text-gray-400' : ''}`}>
        {item.sender}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-6 flex-row items-center bg-white border-b border-gray-100">
        <Calendar size={32} color="#ec4899" />
        <AppText className="text-3xl font-semibold text-gray-900 ml-3 mt-2">Upcoming</AppText>
      </View>

      {/* Calendar Events Prompt */}
      {showCalendarPrompt && (
        <View className="mx-4 mt-4 bg-gray-800 rounded-xl p-6">
          <AppText className="text-white text-lg font-semibold mb-3 text-center">
            Calendar Events
          </AppText>
          <AppText className="text-gray-300 text-sm mb-4 text-center leading-relaxed">
            This list is your schedule for the coming days. Would you like to display events from your calendar as well?
          </AppText>
          <View className="flex-row gap-3 justify-center">
            <TouchableOpacity 
              className="px-5 py-2.5 bg-gray-700 rounded-lg"
              onPress={() => setShowCalendarPrompt(false)}
            >
              <AppText className="text-white font-medium">No Thanks</AppText>
            </TouchableOpacity>
            <TouchableOpacity 
              className="px-5 py-2.5 bg-blue-500 rounded-lg"
              onPress={() => setShowCalendarPrompt(false)}
            >
              <AppText className="text-white font-medium">Show Events</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <SectionList
        sections={getSectionData()}
        renderItem={renderTaskItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8 mt-20">
            <Calendar size={64} color="#9CA3AF" />
            <AppText className="text-gray-400 mt-4">No upcoming tasks</AppText>
          </View>
        }
        contentContainerStyle={getSectionData().length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-blue-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <Plus size={28} color="white" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white rounded-2xl mx-6 w-[85%] p-6">
            <View className="flex-row justify-between items-center mb-4">
              <AppText className="text-xl font-semibold text-gray-900">New Task</AppText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              className="border-b border-gray-300 py-3 text-base text-gray-900 mb-4"
              placeholder="Task title"
              placeholderTextColor="#9CA3AF"
              value={taskTitle}
              onChangeText={setTaskTitle}
              autoFocus
            />

            <TextInput
              className="border-b border-gray-300 py-3 text-base text-gray-900 mb-4"
              placeholder="Notes"
              placeholderTextColor="#9CA3AF"
              value={taskNotes}
              onChangeText={setTaskNotes}
              multiline
            />

            <View className="border-b border-gray-300 mb-6">
              <AppText className="text-xs text-gray-500 mb-1">Schedule for</AppText>
              <View className="flex-row flex-wrap gap-2 pb-3">
                {sections.map((section) => (
                  <TouchableOpacity
                    key={section.key}
                    className={`px-4 py-2 rounded-lg ${selectedDate === section.key ? 'bg-blue-500' : 'bg-gray-100'}`}
                    onPress={() => setSelectedDate(section.key)}
                  >
                    <AppText className={`font-medium ${selectedDate === section.key ? 'text-white' : 'text-gray-700'}`}>
                      {section.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity 
                className="flex-1 bg-gray-100 py-3 rounded-lg"
                onPress={() => setModalVisible(false)}
              >
                <AppText className="text-center text-gray-700 font-medium">Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-blue-500 py-3 rounded-lg"
                onPress={handleAddTask}
              >
                <AppText className="text-center text-white font-medium">Add</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}