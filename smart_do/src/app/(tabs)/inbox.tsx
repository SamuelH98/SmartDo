import { View, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, TouchableWithoutFeedback } from "react-native";
import { AppText } from "@/components/AppText";
import { Inbox, Plus, X, Calendar, Tag, List, Flag } from "lucide-react-native";
import { useState, useRef } from "react";
import { useTasks } from "@/context/TasksContext";
import { useAreas } from "@/context/AreasContext";

export default function InboxScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const lastAddedTaskRef = useRef("");
  
  const { tasks, addTask, removeTask, toggleTaskCompletion, updateTask, loading } = useTasks();
  const { areas, addTaskToArea } = useAreas();

  const activeTasks = tasks.filter(task => !task.completed);

  const handleAddTask = () => {
    const taskKey = `${taskTitle.trim()}_${Date.now()}`;
    
    if (!taskTitle.trim()) {
      return;
    }
    
    // Check if we just added this exact task
    if (lastAddedTaskRef.current === taskTitle.trim()) {
      return;
    }
    
    lastAddedTaskRef.current = taskTitle.trim();
    addTask(taskTitle, taskNotes);
    setTaskTitle("");
    setTaskNotes("");
    setModalVisible(false);
    
    // Reset after a delay
    setTimeout(() => {
      lastAddedTaskRef.current = "";
    }, 1000);
  };

  const handleToggleComplete = (taskId: string, event: any) => {
    event.stopPropagation();
    toggleTaskCompletion(taskId);
  };

  const handleTaskSelect = (task: any) => {
    if (editingTask?.id === task.id) {
      // Save changes before closing
      updateTask(task.id, taskTitle, taskNotes);
      setEditingTask(null);
      setTaskTitle("");
      setTaskNotes("");
    } else {
      setEditingTask(task);
      setTaskTitle(task.sender);
      setTaskNotes(task.preview || "");
      setModalVisible(false);
    }
  };

  const handleCloseEdit = () => {
    if (editingTask) {
      updateTask(editingTask.id, taskTitle, taskNotes);
    }
    setEditingTask(null);
    setTaskTitle("");
    setTaskNotes("");
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
    <View className="flex-1 justify-center items-center p-8 mt-[-80px]">
      {!modalVisible && !editingTask && <Inbox size={64} color="#9CA3AF" />}
    </View>
  );

  const renderMessage = ({ item }) => {
    const isEditing = editingTask?.id === item.id;
    
    if (isEditing) {
      return (
        <View className="mb-4 bg-white px-4 py-5 shadow-sm border-b border-gray-200">
          <View className="flex-row items-center mb-3">
            <TouchableOpacity 
              className="w-5 h-5 rounded border-2 border-gray-400 justify-center items-center mr-3"
              onPress={(e) => {
                e.stopPropagation();
                handleToggleComplete(item.id, e);
              }}
            >
              {item.completed && (
                <View className="w-3 h-3 rounded-sm bg-blue-500" />
              )}
            </TouchableOpacity>
            <TextInput
              className="flex-1 text-xl text-gray-900"
              placeholder="Task title"
              placeholderTextColor="#9CA3AF"
              value={taskTitle}
              onChangeText={setTaskTitle}
              onBlur={handleCloseEdit}
              returnKeyType="done"
            />
          </View>

          <TextInput
            className="text-base text-gray-500 mb-4 ml-8"
            placeholder="Notes"
            placeholderTextColor="#9CA3AF"
            value={taskNotes}
            onChangeText={setTaskNotes}
            multiline
          />

          {/* Action Bar */}
          <View className="flex-row justify-end items-center gap-4">
            <TouchableOpacity 
              className="items-center justify-center p-2"
              onPress={() => {/* Handle date picker */}}
            >
              <Calendar size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center justify-center p-2"
              onPress={() => {/* Handle tag */}}
            >
              <Tag size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center justify-center p-2"
              onPress={() => {
                setSelectedTask(item);
                setMoveModal(true);
              }}
            >
              <List size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center justify-center p-2"
              onPress={() => {/* Handle priority */}}
            >
              <Flag size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    return (
      <TouchableOpacity 
        className="flex-row px-4 py-1   bg-white active:bg-gray-50"
        onPress={() => handleTaskSelect(item)}
      >
        <TouchableOpacity 
          className="w-5 h-5 rounded border-2 border-gray-400 justify-center items-center mr-3 mt-0.5 "
          onPress={(e) => {
            e.stopPropagation();
            handleToggleComplete(item.id, e);
          }}
        >
          {item.completed && (
            <View className="w-3 h-3 rounded-sm bg-blue-500" />
          )}
        </TouchableOpacity>
        <View className="flex-1">
          <View className="flex-row justify-between items-center  ">
            <AppText className="text-gray-900 font-medium text-xl">
              {item.sender}
            </AppText>
          </View>
          {item.preview ? (
            <AppText className="text-gray-500 text-sm mt-0.5" numberOfLines={1}>
              {item.preview}
            </AppText>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <AppText className="text-gray-600">Loading tasks...</AppText>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => {
      if (editingTask) {
        handleCloseEdit();
      } else if (modalVisible) {
        setModalVisible(false);
        setTaskTitle("");
        setTaskNotes("");
      }
    }}>
      <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-6 border-gray-100 flex-row items-center">
        <Inbox size={32} color="#3b82f6" />
        <AppText className="text-3xl font-semibold text-gray-900 ml-3 mt-2">Inbox</AppText>
      </View>

      {/* Inline Add Task Card - Shows when modal is "visible" */}
      {modalVisible && (
        <View className="mb-4 bg-white px-4 py-5 shadow-sm border-b border-gray-200">
          <View className="flex-row items-center mb-3">
            <View className="w-5 h-5 rounded border-2 border-gray-400 mr-3" />
            <TextInput
              className="flex-1 text-xl text-gray-900"
              placeholder="New To-Do"
              placeholderTextColor="#9CA3AF"
              value={taskTitle}
              onChangeText={setTaskTitle}
              onSubmitEditing={() => {
                handleAddTask();
              }}
              autoFocus
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </View>

          <TextInput
            className="text-base text-gray-500 mb-4 ml-8"
            placeholder="Notes"
            placeholderTextColor="#9CA3AF"
            value={taskNotes}
            onChangeText={setTaskNotes}
            multiline
          />

          {/* Action Bar */}
          <View className="flex-row justify-end items-center gap-4">
            <TouchableOpacity 
              className="items-center justify-center p-2"
              onPress={() => {/* Handle date picker */}}
            >
              <Calendar size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center justify-center p-2"
              onPress={() => {/* Handle tag */}}
            >
              <Tag size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center justify-center p-2"
              onPress={() => {/* Handle project */}}
            >
              <List size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="items-center justify-center p-2"
              onPress={() => {/* Handle priority */}}
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
      

      
      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-blue-500 rounded-full w-[52px] h-[52px] flex items-center justify-center shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <View className="flex-col items-center">
          <Plus size={28} color="white" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      {/* Move to Project Modal */}
      <Modal
        visible={moveModal}
        animationType="fade"
        transparent
        onRequestClose={() => setMoveModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white rounded-2xl mx-6 w-[85%] max-h-[60%] p-6">
            <View className="flex-row justify-between items-center mb-4">
              <AppText className="text-xl font-semibold text-gray-900">Move to Project</AppText>
              <TouchableOpacity onPress={() => setMoveModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-80">
              {areas.length === 0 ? (
                <AppText className="text-gray-500 text-center py-4">
                  No projects yet. Create one first!
                </AppText>
              ) : (
                areas.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    className="border border-gray-200 rounded-lg px-4 py-3 mb-2 active:bg-gray-50"
                    onPress={() => handleMoveToProject(project.id)}
                  >
                    <AppText className="text-gray-900 font-medium">
                      {project.name}
                    </AppText>
                    <AppText className="text-gray-500 text-xs mt-1">
                      {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
                    </AppText>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity 
              className="bg-gray-100 py-3 rounded-lg mt-4"
              onPress={() => setMoveModal(false)}
            >
              <AppText className="text-center text-gray-700 font-medium">Cancel</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </TouchableWithoutFeedback>
  );
}