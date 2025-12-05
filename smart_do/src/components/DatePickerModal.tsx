import React, { useState } from "react";
import { View, TouchableOpacity, Modal, ScrollView, Text } from "react-native";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { AppText } from "@/components/AppText";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  onSelectSomeday: () => void;
  currentDate?: Date | null;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  onSelectSomeday,
  currentDate,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    currentDate || null,
  );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDateSelect = (day: number | null) => {
    if (!day) return;
    const date = new Date(selectedYear, selectedMonth, day);
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onSelectDate(selectedDate);
      onClose();
    }
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedMonth === today.getMonth() &&
      selectedYear === today.getFullYear()
    );
  };

  const isSelected = (day: number | null) => {
    if (!selectedDate || !day) return false;
    return (
      day === selectedDate.getDate() &&
      selectedMonth === selectedDate.getMonth() &&
      selectedYear === selectedDate.getFullYear()
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
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
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const quickDates = [
    { label: "Today", value: new Date() },
    { label: "Tomorrow", value: new Date(Date.now() + 86400000) },
    {
      label: "This Weekend",
      value: (() => {
        const date = new Date();
        const day = date.getDay();
        const daysUntilSaturday = day === 0 ? 6 : 6 - day;
        return new Date(Date.now() + daysUntilSaturday * 86400000);
      })(),
    },
    { label: "Next Week", value: new Date(Date.now() + 7 * 86400000) },
  ];

  const handleQuickDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedMonth(date.getMonth());
    setSelectedYear(date.getFullYear());
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white rounded-2xl w-[90%] max-w-md">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <View className="flex-row items-center gap-2">
              <Calendar size={20} color="#3B82F6" />
              <AppText className="text-lg font-semibold text-gray-900">
                Select Date
              </AppText>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Quick Date Buttons */}
          <View className="p-4 border-b border-gray-100">
            <View className="flex-row flex-wrap gap-2">
              {quickDates.map((quick) => (
                <TouchableOpacity
                  key={quick.label}
                  onPress={() => handleQuickDate(quick.value)}
                  className={`px-3 py-2 rounded-lg ${
                    selectedDate &&
                    formatDate(selectedDate) === formatDate(quick.value)
                      ? "bg-blue-500"
                      : "bg-gray-100"
                  }`}
                >
                  <AppText
                    className={`text-sm font-medium ${
                      selectedDate &&
                      formatDate(selectedDate) === formatDate(quick.value)
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {quick.label}
                  </AppText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => {
                  onSelectSomeday();
                  onClose();
                }}
                className="px-3 py-2 rounded-lg bg-purple-100"
              >
                <AppText className="text-sm font-medium text-purple-700">
                  Someday
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="max-h-96">
            <View className="p-4">
              {/* Month/Year Navigation */}
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={handlePreviousMonth} className="p-2">
                  <ChevronLeft size={20} color="#4B5563" />
                </TouchableOpacity>
                <AppText className="text-base font-semibold text-gray-900">
                  {monthNames[selectedMonth]} {selectedYear}
                </AppText>
                <TouchableOpacity onPress={handleNextMonth} className="p-2">
                  <ChevronRight size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>

              {/* Day Headers */}
              <View className="flex-row mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <View key={day} className="flex-1 items-center py-2">
                    <AppText className="text-xs font-medium text-gray-500">
                      {day}
                    </AppText>
                  </View>
                ))}
              </View>

              {/* Calendar Days */}
              <View className="flex-row flex-wrap">
                {generateCalendarDays().map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleDateSelect(day)}
                    disabled={!day}
                    className="w-[14.28%] aspect-square items-center justify-center p-1"
                  >
                    {day && (
                      <View
                        className={`w-full h-full items-center justify-center rounded-lg ${
                          isSelected(day)
                            ? "bg-blue-500"
                            : isToday(day)
                              ? "bg-blue-50"
                              : ""
                        }`}
                      >
                        <AppText
                          className={`text-sm ${
                            isSelected(day)
                              ? "text-white font-semibold"
                              : isToday(day)
                                ? "text-blue-600 font-semibold"
                                : "text-gray-700"
                          }`}
                        >
                          {day}
                        </AppText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Selected Date Display */}
              {selectedDate && (
                <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <AppText className="text-sm text-blue-900 text-center font-medium">
                    Selected: {formatDate(selectedDate)}
                  </AppText>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row gap-3 p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 rounded-lg bg-gray-100"
            >
              <AppText className="text-center text-gray-700 font-medium">
                Cancel
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!selectedDate}
              className={`flex-1 py-3 rounded-lg ${
                selectedDate ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <AppText
                className={`text-center font-medium ${
                  selectedDate ? "text-white" : "text-gray-400"
                }`}
              >
                Confirm
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
