import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = '@inbox_tasks';

interface Task {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  timestamp: number;
  completed: boolean;
}

interface TasksContextType {
  tasks: Task[];
  addTask: (title: string, notes: string) => void;
  removeTask: (id: string) => void;
  loading: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (!loading) {
      saveTasks();
    }
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (jsonValue != null) {
        const loadedTasks = JSON.parse(jsonValue);
        setTasks(loadedTasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async () => {
    try {
      const jsonValue = JSON.stringify(tasks);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const addTask = (title: string, notes: string) => {
    if (title.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        sender: title,
        subject: notes || "No notes",
        preview: notes || "",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        completed: false
      };
      setTasks([newTask, ...tasks]);
    }
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <TasksContext.Provider value={{ tasks, addTask, removeTask, loading }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}