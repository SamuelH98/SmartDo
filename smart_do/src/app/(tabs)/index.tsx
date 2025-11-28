import { View, Modal, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { useState } from "react";
import {
  Inbox, Star, Calendar, Layers, Archive, CheckSquare, Circle,
  Settings, Plus, Search, X, Trash2, Check,
} from "lucide-react-native";
import { useProjects } from "@/context/ProjectsContext";

export default function IndexScreen() {
  const router = useRouter();
  const { projects, addProject, deleteProject, addTaskToProject, deleteTaskFromProject, toggleTaskCompletion } = useProjects();
  const [newProjectModalVisible, setNewProjectModalVisible] = useState(false);
  const [projectDetailsModalVisible, setProjectDetailsModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedList, setSelectedList] = useState('inbox');

  const lists = [
    { id: 'inbox', icon: Inbox, label: 'Inbox', color: '#3b82f6', action: () => router.push('/inbox') },
    { id: 'today', icon: Star, label: 'Today', color: '#facc15' },
    { id: 'upcoming', icon: Calendar, label: 'Upcoming', color: '#ec4899' },
    { id: 'anytime', icon: Layers, label: 'Anytime', color: '#22d3ee' },
    { id: 'someday', icon: Archive, label: 'Someday', color: '#d1d5db' },
    { id: 'logbook', icon: CheckSquare, label: 'Logbook', color: '#4ade80', isLast: true, action: () => router.push('/logbook') },
  ];

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName);
      setNewProjectName('');
      setNewProjectModalVisible(false);
    }
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    setProjectDetailsModalVisible(false);
    setSelectedProjectId(null);
  };

  const handleAddTaskToProject = () => {
    if (selectedProjectId && newTaskTitle.trim()) {
      addTaskToProject(selectedProjectId, newTaskTitle);
      setNewTaskTitle('');
    }
  };

  const handleToggleTaskCompletion = (taskId: string) => {
    if (selectedProjectId) {
      toggleTaskCompletion(selectedProjectId, taskId);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (selectedProjectId) {
      deleteTaskFromProject(selectedProjectId, taskId);
    }
  };

  const openProjectDetails = (projectId: string) => {
    setSelectedProjectId(projectId);
    setProjectDetailsModalVisible(true);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Status Bar Area */}
      <View className="h-16" />

      {/* Search Bar */}
      <View className="px-5 pb-5">
        <View className="bg-gray-100 rounded-xl h-12 flex-row items-center justify-center px-4">
          <Search size={20} color="#7F8082" style={{ marginRight: 8 }} />
          <AppText className="text-[#7F8082] text-lg leading-none mt-3">
            Quick Find
          </AppText>
        </View>
      </View>

      {/* Lists */}
      <ScrollView className="flex-1 px-3">
        {lists.map((list) => {
          const Icon = list.icon;
          return (
            <TouchableOpacity
              key={list.id}
              onPress={() => {
                setSelectedList(list.id);
                if (list.action) list.action();
              }}
              className="flex-row items-center px-4 py-2 rounded-lg mb-1"
            >
              <Icon size={26} color={list.color} />
              <AppText className="text-gray-900 font-medium ml-3 mt-2 text-lg leading-none">
                {list.label}
              </AppText>
            </TouchableOpacity>
          );
        })}

        <View className="border-b border-gray-300 my-3 mx-3" />

        {/* Projects Section */}


        {projects.length === 0 ? (
          <AppText className="text-gray-400 text-sm px-4 py-2">
            No projects yet
          </AppText>
        ) : (
          projects.map((project) => (
            <TouchableOpacity
              key={project.id}
              onPress={() => openProjectDetails(project.id)}
              className="flex-row items-center px-4 py-2 rounded-lg  mb-1"
            >
              <Circle size={26} color="#7F8082" />
              <View className="flex-1 ml-3">
                <AppText className="text-gray-900 font-medium ml-3 mt-2 text-lg leading-none">
                  {project.name}
                </AppText>
                {/* <AppText className="text-gray-500 text-xs mt-1">
                  {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
                </AppText> */}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View className="px-5 pb-8 flex-row items-center justify-between">
        <TouchableOpacity className="flex-row justify-center">
          <Settings size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setNewProjectModalVisible(true)}
          className="bg-blue-500 rounded-full w-[52px] h-[52px] flex items-center justify-center shadow-lg"
        >
          <View className="flex-col items-center">
            <Plus size={28} color="white" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Create Project Modal */}
      <Modal
        visible={newProjectModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNewProjectModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="p-6 rounded-xl bg-white mx-4 w-80">
            <View className="flex-row justify-between items-center mb-4">
              <AppText className="text-2xl font-bold text-gray-900">
                New Project
              </AppText>
              <TouchableOpacity onPress={() => setNewProjectModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Project name"
              placeholderTextColor="#9CA3AF"
              value={newProjectName}
              onChangeText={setNewProjectName}
              className="border border-gray-300 rounded-lg px-3 py-2 text-base mb-4"
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setNewProjectModalVisible(false)}
                className="flex-1 bg-gray-200 rounded-lg py-2"
              >
                <AppText center className="text-gray-900 font-medium">
                  Cancel
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateProject}
                className="flex-1 bg-blue-500 rounded-lg py-2"
              >
                <AppText center className="text-white font-medium">
                  Create
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Project Details Modal */}
      <Modal
        visible={projectDetailsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProjectDetailsModalVisible(false)}
      >
        <View className="flex-1 bg-white pt-12">
          {/* Header */}
          <View className="px-5 pb-4 border-b border-gray-200 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => setProjectDetailsModalVisible(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <AppText className="text-2xl font-bold text-gray-900 flex-1 ml-4">
              {selectedProject?.name}
            </AppText>
            <TouchableOpacity
              onPress={() => selectedProjectId && handleDeleteProject(selectedProjectId)}
            >
              <Trash2 size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Tasks List */}
          <ScrollView className="flex-1 px-5 py-4">
            {selectedProject?.tasks.length === 0 ? (
              <AppText className="text-gray-400 text-center py-8">
                No tasks yet
              </AppText>
            ) : (
              selectedProject?.tasks.map((task) => (
                <View
                  key={task.id}
                  className="flex-row items-center bg-gray-50 rounded-lg px-4 py-3 mb-2"
                >
                  <TouchableOpacity
                    onPress={() => handleToggleTaskCompletion(task.id)}
                    className="mr-3"
                  >
                    {task.completed ? (
                      <Check size={24} color="#10B981" />
                    ) : (
                      <Circle size={24} color="#D1D5DB" />
                    )}
                  </TouchableOpacity>
                  <AppText
                    className={`flex-1 ${
                      task.completed
                        ? 'text-gray-400 line-through'
                        : 'text-gray-900'
                    }`}
                  >
                    {task.title}
                  </AppText>
                  <TouchableOpacity onPress={() => handleDeleteTask(task.id)}>
                    <X size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          {/* Add Task Input */}
          <View className="px-5 pb-6 border-t border-gray-200 pt-4">
            <View className="flex-row items-center gap-2">
              <TextInput
                placeholder="Add a task..."
                placeholderTextColor="#9CA3AF"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base"
              />
              <TouchableOpacity
                onPress={handleAddTaskToProject}
                className="bg-blue-500 rounded-lg px-3 py-2"
              >
                <Plus size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}