import { View, SectionList, TouchableOpacity, Modal, ScrollView, TextInput } from "react-native";
import { AppText } from "@/components/AppText";
import { Check, X, Trash2, Star, Plus, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { useTasks } from "@/context/TasksContext";
import { useAreas } from "@/context/AreasContext";

export default function TodayScreen() {
  const { tasks, removeTask, toggleTaskCompletion, addTask } = useTasks();
  const { areas, toggleTaskCompletion: toggleAreaTask } = useAreas();
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");

  // Filter to only show incomplete tasks in Inbox
  const incompleteTasks = tasks.filter(task => !task.completed);

  // Calculate total incomplete tasks across all areas
  const getTotalIncompleteTasks = () => {
    const inboxCount = incompleteTasks.length;
    const areasCount = areas.reduce((sum, a) => 
      sum + a.tasks.filter(t => !t.completed).length, 0
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
        data: incompleteTasks,
        isArea: false,
      });
    }

    // Add each area as a section with ALL its tasks (completed and incomplete)
    areas.forEach(area => {
      sections.push({
        title: area.name,
        data: area.tasks,
        isArea: true,
        areaId: area.id,
      });
    });

    return sections;
  };

  const sections = getSectionData();

  const handleToggleComplete = (taskId: string, isArea: boolean, areaId?: string, event?: any) => {
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

  const handleAddTask = () => {
    if (taskTitle.trim()) {
      addTask(taskTitle, taskNotes);
      setTaskTitle("");
      setTaskNotes("");
      setModalVisible(false);
    }
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
      <View className="flex-row items-center">
        <View className="w-2 h-2 rounded-full bg-yellow-400 mr-2" />
        <AppText className="text-sm font-semibold text-gray-700">{title}</AppText>
      </View>
      <ChevronRight size={16} color="#D1D5DB" />
    </View>
  );

  const renderTaskItem = ({ item, section }) => (
    <TouchableOpacity 
      className="flex-row px-4 py-3.5 bg-white border-b border-gray-50 active:bg-gray-50"
      onPress={() => handlePreview(item, section.isArea, section.areaId)}
    >
      <TouchableOpacity 
        className="w-5 h-5 rounded border-2 border-gray-300 justify-center items-center mr-3 mt-0.5"
        onPress={(e) => handleToggleComplete(item.id, section.isArea, section.areaId, e)}
      >
        {item.completed && (
          <Check size={14} color="#3B82F6" strokeWidth={3} />
        )}
      </TouchableOpacity>

      <View className="flex-1">
        <View className="flex-row items-center">
          <View className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2" />
          <AppText className={`${item.completed ? 'text-gray-400 line-through' : 'text-gray-900'} text-[15px] flex-1`}>
            {section.isArea ? item.title : item.sender}
          </AppText>
        </View>
        
        {!section.isArea && item.preview ? (
          <AppText className="text-gray-400 text-[13px] mt-1 ml-3.5" numberOfLines={1}>
            {item.preview}
          </AppText>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-6 flex-row items-center bg-white">
        <Star size={32} color="#facc15" />
        <AppText className="text-3xl font-semibold text-gray-900 ml-3 mt-2">Today</AppText>
      </View>

      {/* Task Count Banner */}
      {getTotalIncompleteTasks() > 0 && (
        <View className="bg-yellow-50 mx-4 mb-4 p-3.5 rounded-lg flex-row justify-between items-center border border-yellow-200">
          <AppText className="text-gray-800 text-[15px]">
            You have {getTotalIncompleteTasks()} new to-dos
          </AppText>
          <View className="bg-yellow-400 px-4 py-1.5 rounded">
            <AppText className="text-gray-900 font-bold text-xs">OK</AppText>
          </View>
        </View>
      )}

      <SectionList
        sections={sections}
        renderItem={renderTaskItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item, index) => item.id + index}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8 mt-[-80px]">
            <Star size={64} color="#9CA3AF" />
            <AppText className="text-gray-400 mt-4">No tasks for today</AppText>
          </View>
        }
        contentContainerStyle={sections.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
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
            <View className="flex-row justify-between items-center p-6 border-b border-gray-200">
              <AppText className="text-2xl font-semibold text-gray-900">
                {selectedTask?.isArea ? selectedTask?.title : selectedTask?.sender}
              </AppText>
              <TouchableOpacity onPress={() => setPreviewModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-6 py-4">
              {!selectedTask?.isArea && selectedTask?.preview ? (
                <View className="mb-4">
                  <AppText className="text-gray-500 text-xs mb-1">Notes</AppText>
                  <AppText className="text-gray-900 text-base leading-6">
                    {selectedTask.preview}
                  </AppText>
                </View>
              ) : null}
            </ScrollView>

            <View className="px-6 pt-4 border-t border-gray-200 gap-3">
              <TouchableOpacity 
                className="py-3 rounded-lg"
                onPress={() => {
                  if (selectedTask?.isArea && selectedTask?.areaId) {
                    toggleAreaTask(selectedTask.areaId, selectedTask.id);
                  } else {
                    toggleTaskCompletion(selectedTask?.id);
                  }
                  setPreviewModal(false);
                }}
              >
                <AppText className="text-center text-blue-500 font-medium">
                  {selectedTask?.completed ? "Mark as Not Done" : "Mark as Done"}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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