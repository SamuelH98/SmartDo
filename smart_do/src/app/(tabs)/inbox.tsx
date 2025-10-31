import { View, FlatList, TouchableOpacity, Modal, TextInput, ScrollView } from "react-native";
import { AppText } from "@/components/AppText";
import { Inbox, Plus, X } from "lucide-react-native";
import { useState } from "react";
import { useTasks } from "@/context/TasksContext";

export default function InboxScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  
  const { tasks, addTask, removeTask, loading } = useTasks();

  const handleAddTask = () => {
    addTask(taskTitle, taskNotes);
    setTaskTitle("");
    setTaskNotes("");
    setModalVisible(false);
  };

  const handleToggleComplete = (taskId: string, event: any) => {
    event.stopPropagation();
    removeTask(taskId);
  };

  const handlePreview = (task: any) => {
    setSelectedTask(task);
    setPreviewModal(true);
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <View className="bg-white rounded-2xl p-8 mb-4">
        <Inbox size={48} color="#3b82f6" />
      </View>
      <AppText className="text-gray-600 text-center">
        No messages yet
      </AppText>
    </View>
  );

  const renderMessage = ({ item }) => (
    <TouchableOpacity 
      className="flex-row px-4 py-3 border-b border-gray-100 bg-white active:bg-gray-50"
      onPress={() => handlePreview(item)}
    >
      <TouchableOpacity 
        className="w-5 h-5 rounded border-2 border-gray-400 justify-center items-center mr-3 mt-0.5"
        onPress={(e) => handleToggleComplete(item.id, e)}
      >
        {item.completed && (
          <View className="w-3 h-3 rounded-sm bg-blue-500" />
        )}
      </TouchableOpacity>
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <AppText className={`text-gray-900 font-medium text-base ${item.completed ? 'line-through' : ''}`}>
            {item.sender}
          </AppText>
          <AppText className="text-gray-400 text-xs ml-2">{item.time}</AppText>
        </View>
        {item.preview && (
          <AppText className="text-gray-500 text-sm mt-0.5" numberOfLines={1}>
            {item.preview}
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <AppText className="text-gray-600">Loading tasks...</AppText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={tasks}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={tasks.length === 0 ? { flex: 1 } : {}}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-blue-500 rounded-full w-[68px] h-[68px] flex items-center justify-center shadow-lg"
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
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <AppText className="text-xl font-semibold text-gray-900">New Task</AppText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Task Title Input */}
            <TextInput
              className="border-b border-gray-300 py-3 text-base text-gray-900 mb-4"
              placeholder="Task title"
              placeholderTextColor="#9CA3AF"
              value={taskTitle}
              onChangeText={setTaskTitle}
              autoFocus
            />

            {/* Notes Input */}
            <TextInput
              className="border-b border-gray-300 py-3 text-base text-gray-900 mb-6"
              placeholder="Notes"
              placeholderTextColor="#9CA3AF"
              value={taskNotes}
              onChangeText={setTaskNotes}
              multiline
            />

            {/* Buttons */}
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
                {selectedTask?.sender}
              </AppText>
              <TouchableOpacity onPress={() => setPreviewModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="px-6 py-4">
              <View className="mb-4">
                <AppText className="text-gray-500 text-xs mb-1">Time</AppText>
                <AppText className="text-gray-900 text-base">{selectedTask?.time}</AppText>
              </View>

              {selectedTask?.preview && (
                <View className="mb-4">
                  <AppText className="text-gray-500 text-xs mb-1">Notes</AppText>
                  <AppText className="text-gray-900 text-base leading-6">
                    {selectedTask.preview}
                  </AppText>
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View className="px-6 pt-4 border-t border-gray-200">
              <TouchableOpacity 
                className="bg-red-500 py-3 rounded-lg"
                onPress={() => {
                  if (selectedTask) {
                    removeTask(selectedTask.id);
                    setPreviewModal(false);
                  }
                }}
              >
                <AppText className="text-center text-white font-medium">Complete Task</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}