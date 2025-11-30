import { View, SectionList, TouchableOpacity, Modal, ScrollView, TextInput } from "react-native";
import { AppText } from "@/components/AppText";
import { Check, X, Trash2, Box, CheckSquare, Plus } from "lucide-react-native";
import { useState } from "react";
import { useTasks } from "@/context/TasksContext";

export default function LogbookScreen() {
  const { tasks, removeTask, toggleTaskCompletion, addTask } = useTasks();
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");

  // 1. Group tasks by Date (Today, Yesterday, etc.)
  const getSectionData = () => {
    const completedTasks = tasks.filter(task => task.completed);
    
    const sections = {};
    
    completedTasks.forEach(task => {
      // Determine date label
      const date = new Date(task.timestamp);
      const today = new Date();
      const isToday = date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear();
      
      const sectionTitle = isToday ? "Today" : date.toLocaleDateString();

      if (!sections[sectionTitle]) {
        sections[sectionTitle] = [];
      }
      sections[sectionTitle].push(task);
    });

    // Convert to array format for SectionList and sort newest first
    return Object.keys(sections).map(title => ({
      title,
      data: sections[title].sort((a, b) => b.timestamp - a.timestamp)
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

  const handlePreview = (log: any) => {
    setSelectedLog(log);
    setPreviewModal(true);
  };

  const handleAddTask = () => {
    if (taskTitle.trim()) {
      addTask({
        sender: taskTitle,
        preview: taskNotes,
        completed: false,
      });
      setTaskTitle("");
      setTaskNotes("");
      setModalVisible(false);
    }
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View className="bg-white px-4 pt-6 pb-2">
      <AppText className="text-xl font-bold text-gray-900">{title}</AppText>
    </View>
  );

  const renderLogEntry = ({ item }) => (
    <TouchableOpacity 
      className="flex-row px-4 py-3 bg-white border-b border-gray-50 active:bg-gray-50"
      onPress={() => handlePreview(item)}
    >
      {/* Left Side: Checkbox area */}
      <View className="flex-row items-start pt-1 mr-3">
        <TouchableOpacity 
          className="w-5 h-5 rounded bg-blue-500 justify-center items-center shadow-sm"
          onPress={(e) => handleToggleComplete(item.id, e)}
        >
          <Check size={14} color="white" strokeWidth={3} />
        </TouchableOpacity>
        
        {/* The small 'today' text from the screenshot */}
        <AppText className="text-blue-500 text-[10px] ml-2 font-medium mt-[2px]">
          today
        </AppText>
      </View>

      {/* Right Side: Task Details */}
      <View className="flex-1">
        <AppText className="text-gray-900 font-medium text-base leading-5">
          {item.sender}
        </AppText>
        
        {/* Subtitle Row mimicking "My Tasks" or Project Name */}
        <View className="flex-row items-center mt-1">
          <AppText className="text-gray-400 text-xs mr-2">
            Inbox
          </AppText>
          <Box size={12} color="#9CA3AF" />
          
          {item.preview ? (
             <AppText className="text-gray-400 text-xs ml-2" numberOfLines={1}>
               • {item.preview}
             </AppText>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-6  flex-row items-center bg-white">
        <CheckSquare size={24} color="#4ade80" />
        <AppText className="text-3xl font-semibold text-gray-900 ml-3 mt-2">Logbook</AppText>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderLogEntry}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8 mt-[-80px]">
            <CheckSquare size={64} color="#9CA3AF" />
          </View>
        }
        contentContainerStyle={sections.length === 0 ? { flex: 1 } : { paddingBottom: 30 }}
      />
      
      {/* Preview Modal */}
      <Modal
        visible={previewModal}
        animationType="slide"
        transparent
        onRequestClose={() => setPreviewModal(false)}
      >
        <View className="flex-1 items-center justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl w-full max-h-[80%] pb-8">
            {/* Header */}
            <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
              <AppText className="text-2xl font-semibold text-gray-900">
                {selectedLog?.sender}
              </AppText>
              <TouchableOpacity onPress={() => setPreviewModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="px-6 py-4">
              <View className="mb-4">
                <AppText className="text-gray-500 text-xs mb-1">Time Logged</AppText>
                <AppText className="text-gray-900 text-base">{selectedLog?.time}</AppText>
              </View>

              {selectedLog?.preview ? (
                <View className="mb-4">
                  <AppText className="text-gray-500 text-xs mb-1">Notes</AppText>
                  <AppText className="text-gray-900 text-base leading-6">
                    {selectedLog.preview}
                  </AppText>
                </View>
              ) : null}
            </ScrollView>

            {/* Actions */}
            <View className="px-6 pt-4 border-t border-gray-200 gap-3">
              <TouchableOpacity 
                className="bg-red-50 py-3 rounded-lg flex-row justify-center items-center border border-red-100"
                onPress={() => handleDeleteLog(selectedLog?.id)}
              >
                <Trash2 size={20} color="#EF4444" style={{ marginRight: 8 }} />
                <AppText className="text-center text-red-500 font-medium">Delete Permanently</AppText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="py-3 rounded-lg"
                onPress={() => {
                  toggleTaskCompletion(selectedLog?.id);
                  setPreviewModal(false);
                }}
              >
                <AppText className="text-center text-blue-500 font-medium">Mark as Not Done</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-blue-500 rounded-full w-[52px] h-[52px] flex items-center justify-center shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <View className="flex-col items-center">
          <Plus size={28} color="white" strokeWidth={2.5} />
        </View>
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
              className="border-b border-gray-300 py-3 text-base text-gray-900 mb-6"
              placeholder="Notes"
              placeholderTextColor="#9CA3AF"
              value={taskNotes}
              onChangeText={setTaskNotes}
              multiline
            />
      
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