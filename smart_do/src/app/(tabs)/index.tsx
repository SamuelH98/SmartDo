import { View, Modal, ScrollView, TouchableOpacity, TextInput, TouchableWithoutFeedback } from "react-native";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Inbox, Star, Calendar, Layers, Archive, CheckSquare, Circle,
  Settings, Plus, Search, X, Trash2, Check,
} from "lucide-react-native";
import { useAreas } from "@/context/AreasContext";
import { useTasks } from "@/context/TasksContext";

export default function IndexScreen() {
  const router = useRouter();
  const { areas, addArea, deleteArea, addTaskToArea, deleteTaskFromArea, toggleTaskCompletion } = useAreas();
  const { tasks } = useTasks();
  const [newAreaModalVisible, setNewAreaModalVisible] = useState(false);
  const [areaDetailsModalVisible, setAreaDetailsModalVisible] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [newAreaName, setNewAreaName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedList, setSelectedList] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const lists = [
    { id: 'inbox', icon: Inbox, label: 'Inbox', color: '#3b82f6', action: () => router.push('/inbox') },
    { id: 'today', icon: Star, label: 'Today', color: '#facc15', action: () => router.push('/today') },
    { id: 'upcoming', icon: Calendar, label: 'Upcoming', color: '#ec4899', action: () => router.push('/upcoming') },
    { id: 'anytime', icon: Layers, label: 'Anytime', color: '#22d3ee' },
    { id: 'someday', icon: Archive, label: 'Someday', color: '#d1d5db' },
    { id: 'logbook', icon: CheckSquare, label: 'Logbook', color: '#4ade80', isLast: true, action: () => router.push('/logbook') },
  ];

  const selectedArea = areas.find(a => a.id === selectedAreaId);

  const handleCreateArea = () => {
    if (newAreaName.trim()) {
      addArea(newAreaName);
      setNewAreaName('');
      setNewAreaModalVisible(false);
    }
  };

  const handleDeleteArea = (id: string) => {
    deleteArea(id);
    setAreaDetailsModalVisible(false);
    setSelectedAreaId(null);
  };

  const handleAddTaskToArea = () => {
    if (selectedAreaId && newTaskTitle.trim()) {
      addTaskToArea(selectedAreaId, newTaskTitle);
      setNewTaskTitle('');
      setAddTaskVisible(false);
    }
  };

  const [addTaskVisible, setAddTaskVisible] = useState(false);

  const handleToggleTaskCompletion = (taskId: string) => {
    if (selectedAreaId) {
      toggleTaskCompletion(selectedAreaId, taskId);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (selectedAreaId) {
      deleteTaskFromArea(selectedAreaId, taskId);
    }
  };

  const openAreaDetails = (areaId: string) => {
    setSelectedAreaId(areaId);
    setAreaDetailsModalVisible(true);
    setAddTaskVisible(false);
  };

  const handleCloseAreaDetails = () => {
    setAreaDetailsModalVisible(false);
    setSelectedAreaId(null);
    setAddTaskVisible(false);
    setNewTaskTitle('');
  };

  // Search functionality
  const getSearchResults = () => {
    if (!searchQuery.trim()) return { inboxTasks: [], areas: [], areaTasks: [] };

    const query = searchQuery.toLowerCase();
    
    // Search inbox tasks
    const matchedInboxTasks = tasks.filter(task => 
      task.sender.toLowerCase().includes(query) || 
      task.preview.toLowerCase().includes(query)
    );

    // Search areas
    const matchedAreas = areas.filter(area => 
      area.name.toLowerCase().includes(query)
    );

    // Search tasks within areas
    const matchedAreaTasks: Array<{ areaName: string; areaId: string; task: any }> = [];
    areas.forEach(area => {
      area.tasks.forEach(task => {
        if (task.title.toLowerCase().includes(query)) {
          matchedAreaTasks.push({
            areaName: area.name,
            areaId: area.id,
            task
          });
        }
      });
    });

    return { inboxTasks: matchedInboxTasks, areas: matchedAreas, areaTasks: matchedAreaTasks };
  };

  const searchResults = getSearchResults();

  return (
    <TouchableWithoutFeedback onPress={() => {
      if (newAreaModalVisible) {
        setNewAreaModalVisible(false);
        setNewAreaName('');
      }
    }}>
      <View className="flex-1 bg-white">
        {/* Status Bar Area */}
        <View className="h-16" />

        {/* Search Bar */}
        <View className="px-5 pb-5">
          <View className="bg-gray-100 rounded-xl h-12 flex-row items-center px-4">
            <Search size={20} color="#7F8082" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-base text-gray-900 text-center"
              placeholder="Quick Find"
              placeholderTextColor="#7F8082"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearching(true)}
              returnKeyType="search"
              style={{ textAlign: searchQuery ? 'left' : 'center' }}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setIsSearching(false);
              }}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 18 }} />
            )}
          </View>
        </View>

        {/* Lists */}
        <ScrollView className="flex-1 px-3">
          {isSearching && searchQuery.trim() !== '' ? (
            // Search Results View
            <>
              {searchQuery.trim() === '' ? (
                <AppText className="text-gray-400 text-center py-8">
                  Start typing to search...
                </AppText>
              ) : (
                <>
                  {/* Inbox Tasks Results */}
                  {searchResults.inboxTasks.length > 0 && (
                    <View className="mb-6">
                      <AppText className="text-sm font-semibold text-gray-500 mb-3 uppercase px-4">
                        Inbox Tasks ({searchResults.inboxTasks.length})
                      </AppText>
                      {searchResults.inboxTasks.map((task) => (
                        <TouchableOpacity
                          key={task.id}
                          onPress={() => {
                            setSearchQuery('');
                            setIsSearching(false);
                            router.push('/inbox');
                          }}
                          className="bg-white border border-gray-200 rounded-lg p-4 mb-2 mx-1"
                        >
                          <AppText className="text-base font-medium text-gray-900 mb-1">
                            {task.sender}
                          </AppText>
                          <AppText className="text-sm text-gray-500" numberOfLines={2}>
                            {task.preview}
                          </AppText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Areas Results */}
                  {searchResults.areas.length > 0 && (
                    <View className="mb-6">
                      <AppText className="text-sm font-semibold text-gray-500 mb-3 uppercase px-4">
                        Areas ({searchResults.areas.length})
                      </AppText>
                      {searchResults.areas.map((area) => (
                        <TouchableOpacity
                          key={area.id}
                          onPress={() => {
                            setSearchQuery('');
                            setIsSearching(false);
                            openAreaDetails(area.id);
                          }}
                          className="bg-white border border-gray-200 rounded-lg p-4 mb-2 flex-row items-center mx-1"
                        >
                          <Circle size={24} color="#7F8082" />
                          <View className="flex-1 ml-3">
                            <AppText className="text-base font-medium text-gray-900">
                              {area.name}
                            </AppText>
                            <AppText className="text-sm text-gray-500">
                              {area.tasks.length} {area.tasks.length === 1 ? 'task' : 'tasks'}
                            </AppText>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Area Tasks Results */}
                  {searchResults.areaTasks.length > 0 && (
                    <View className="mb-6">
                      <AppText className="text-sm font-semibold text-gray-500 mb-3 uppercase px-4">
                        Tasks in Areas ({searchResults.areaTasks.length})
                      </AppText>
                      {searchResults.areaTasks.map((result, index) => (
                        <TouchableOpacity
                          key={`${result.areaId}-${result.task.id}`}
                          onPress={() => {
                            setSearchQuery('');
                            setIsSearching(false);
                            openAreaDetails(result.areaId);
                          }}
                          className="bg-white border border-gray-200 rounded-lg p-4 mb-2 mx-1"
                        >
                          <AppText className="text-xs text-gray-400 mb-2">
                            {result.areaName}
                          </AppText>
                          <AppText className="text-base font-medium text-gray-900">
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
                    <AppText className="text-gray-400 text-center py-8">
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

          {/* Areas Section */}

          {/* Inline New Area Card */}
          {newAreaModalVisible && (
            <View className="mb-4 bg-white px-4 py-5 shadow-sm border border-gray-200 rounded-lg mx-1">
              <View className="flex-row items-center mb-3">
                <Circle size={26} color="#7F8082" />
                <TextInput
                  className="flex-1 text-base text-gray-900 ml-3"
                  placeholder="New Area"
                  placeholderTextColor="#9CA3AF"
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
            <AppText className="text-gray-400 text-sm px-4 py-2">
              No areas yet
            </AppText>
          ) : (
            areas.map((area) => (
              <TouchableOpacity
                key={area.id}
                onPress={() => openAreaDetails(area.id)}
                className="flex-row items-center px-4 py-2 rounded-lg mb-1"
              >
                <Circle size={26} color="#7F8082" />
                <View className="flex-1 ml-3">
                  <AppText className="text-gray-900 font-medium ml-3 mt-2 text-lg leading-none">
                    {area.name}
                  </AppText>
                </View>
              </TouchableOpacity>
            ))
          )}
            </>
          )}
        </ScrollView>

        {/* Bottom Bar */}
        <View className="px-5 pb-8 flex-row items-center justify-between">
          <TouchableOpacity className="flex-row justify-center">
            <Settings size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setNewAreaModalVisible(true)}
            className="bg-blue-500 rounded-full w-[52px] h-[52px] flex items-center justify-center shadow-lg"
          >
            <View className="flex-col items-center">
              <Plus size={28} color="white" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Area Details Modal */}
        <Modal
          visible={areaDetailsModalVisible}
          animationType="slide"
          onRequestClose={handleCloseAreaDetails}
        >
          <TouchableWithoutFeedback onPress={() => {
            if (addTaskVisible) {
              setAddTaskVisible(false);
              setNewTaskTitle('');
            }
          }}>
            <View className="flex-1 bg-white pt-12">
              {/* Header */}
              <View className="px-5 pb-4 border-b border-gray-200 flex-row items-center justify-between">
                <TouchableOpacity onPress={handleCloseAreaDetails}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
                <AppText className="text-2xl font-bold text-gray-900 flex-1 ml-4">
                  {selectedArea?.name}
                </AppText>
                <TouchableOpacity
                  onPress={() => selectedAreaId && handleDeleteArea(selectedAreaId)}
                >
                  <Trash2 size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Tasks List */}
              <ScrollView className="flex-1 px-5 py-4">
                {selectedArea?.tasks.length === 0 && !addTaskVisible ? (
                  <AppText className="text-gray-400 text-center py-8">
                    No tasks yet
                  </AppText>
                ) : (
                  <>
                    {selectedArea?.tasks.map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white active:bg-gray-50"
                      >
                        <TouchableOpacity
                          onPress={() => handleToggleTaskCompletion(task.id)}
                          className="w-5 h-5 rounded border-2 border-gray-400 justify-center items-center mr-3"
                        >
                          {task.completed && (
                            <View className="w-3 h-3 rounded-sm bg-blue-500" />
                          )}
                        </TouchableOpacity>
                        <AppText
                          className={`flex-1 text-base ${
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
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>

              {/* Floating Action Button - only show when not adding a task */}
              {!addTaskVisible && (
                <TouchableOpacity 
                  className="absolute bottom-6 right-6 bg-blue-500 rounded-full w-[52px] h-[52px] flex items-center justify-center shadow-lg"
                  onPress={() => setAddTaskVisible(true)}
                >
                  <View className="flex-col items-center">
                    <Plus size={28} color="white" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}