import { Alert, View, Modal, ScrollView, TouchableOpacity } from "react-native";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { useState } from "react";
import {
  Inbox, Star, Calendar, Layers, Archive, CheckSquare, Circle,
  Settings, Plus, Search, ChevronDown
} from "lucide-react-native";

export default function IndexScreen() {
  const router = useRouter();
  const canGoBack = router.canGoBack();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState('inbox');

  const lists = [
    { id: 'inbox', icon: Inbox, label: 'Inbox', color: '#3b82f6' },
    { id: 'today', icon: Star, label: 'Today', color: '#facc15' },
    { id: 'upcoming', icon: Calendar, label: 'Upcoming', color: '#ec4899' },
    { id: 'anytime', icon: Layers, label: 'Anytime', color: '#22d3ee' },
    { id: 'someday', icon: Archive, label: 'Someday', color: '#d1d5db' },
    { id: 'logbook', icon: CheckSquare, label: 'Logbook', color: '#4ade80', isLast: true },
  ];

  const handleOpenAlert = () => {
    Alert.alert("Warning!", "Are you sure you want to proceed?", [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", style: "destructive", onPress: () => console.log("Let's go!") },
    ]);
  };

  return (
    <View className="flex-1 bg-[#101112]">
      {/* Status Bar Area */}
      <View className="h-16" />

      {/* Search Bar */}
      <View className="px-5 pb-5">
        <View className="bg-[#2a2b2d] rounded-xl h-12 flex-row items-center justify-center px-4">
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
              <AppText className="text-white font-medium ml-3 mt-2 text-lg leading-none">
                {list.label}
              </AppText>
            </TouchableOpacity>
          );
        })}

        <View className="border-b border-gray-700/50 my-3 mx-3" />

        {/* Project */}
        <TouchableOpacity className="flex-row items-center px-4 py-3 rounded-lg">
          <Circle size={26} color="#7F8082" />
          <AppText className="text-white ml-3 font-medium mt-2 text-lg leading-none">
            Sample task
          </AppText>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="px-5 pb-8 flex-row items-center justify-between">
        <TouchableOpacity className="flex-row items-center">
          <Settings size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity className="bg-blue-500 rounded-full w-[68px] h-[68px] flex items-center justify-center shadow-lg">
          <View className="flex-col items-center">
            <Plus size={28} color="white" strokeWidth={2.5} className="mb-[-6px]" />
            <ChevronDown size={14} color="white" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="p-14 rounded-xl bg-white mx-4">
            <AppText center size="heading">A custom styled modal!</AppText>
            <Button title="Close" theme="secondary" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
