import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TASKS_STORAGE_KEY = "@inbox_tasks";

export interface Task {
  id: string;
  sender: string; // Used as Title/Sender
  subject: string;
  preview: string; // Used as Notes
  time: string;
  timestamp: number;
  completed: boolean;
  dueDate?: string; // ISO string for due date
  someday?: boolean; // Flag for someday tasks
}

interface TasksContextType {
  tasks: Task[];
  addTask: (title: string, notes: string, dueDate?: string) => void;
  addCompletedTask: (title: string, notes: string) => void;
  removeTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  updateTask: (
    id: string,
    title: string,
    notes: string,
    dueDate?: string,
  ) => void;
  setTaskSomeday: (id: string, someday: boolean) => void;
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
        setTasks(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async () => {
    try {
      const jsonValue = JSON.stringify(tasks);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const addTask = useCallback(
    (title: string, notes: string, dueDate?: string) => {
      if (title.trim()) {
        const newTask: Task = {
          id: Date.now().toString(),
          sender: title,
          subject: notes || "No notes",
          preview: notes || "",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          timestamp: Date.now(),
          completed: false,
          dueDate: dueDate,
        };
        setTasks((prev) => [newTask, ...prev]);
      }
    },
    [],
  );

  const addCompletedTask = useCallback((title: string, notes: string) => {
    if (title.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        sender: title,
        subject: notes || "No notes",
        preview: notes || "",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: Date.now(),
        completed: true, // Add as completed directly to logbook
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  const updateTask = useCallback(
    (id: string, title: string, notes: string, dueDate?: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                sender: title,
                subject: notes || "No notes",
                preview: notes || "",
                dueDate: dueDate,
              }
            : task,
        ),
      );
    },
    [],
  );

  const setTaskSomeday = useCallback((id: string, someday: boolean) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              someday: someday,
              dueDate: someday ? undefined : task.dueDate, // Clear dueDate if setting to someday
            }
          : task,
      ),
    );
  }, []);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        addCompletedTask,
        removeTask,
        toggleTaskCompletion,
        updateTask,
        setTaskSomeday,
        loading,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
