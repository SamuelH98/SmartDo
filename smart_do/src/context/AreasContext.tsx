import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AREAS_STORAGE_KEY = "@areas";

export interface AreaTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  someday?: boolean;
}

export interface Area {
  id: string;
  name: string;
  tasks: AreaTask[];
  createdAt: number;
}

interface AreasContextType {
  areas: Area[];
  addArea: (name: string) => void;
  deleteArea: (id: string) => void;
  addTaskToArea: (areaId: string, title: string) => void;
  deleteTaskFromArea: (areaId: string, taskId: string) => void;
  toggleTaskCompletion: (areaId: string, taskId: string) => void;
  loading: boolean;
}

const AreasContext = createContext<AreasContextType | undefined>(undefined);

export function AreasProvider({ children }: { children: React.ReactNode }) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAreas();
  }, []);

  useEffect(() => {
    if (!loading) {
      saveAreas();
    }
  }, [areas]);

  const loadAreas = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(AREAS_STORAGE_KEY);
      if (jsonValue != null) {
        const loadedAreas = JSON.parse(jsonValue);
        setAreas(loadedAreas);
      }
    } catch (error) {
      console.error("Error loading areas:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAreas = async () => {
    try {
      const jsonValue = JSON.stringify(areas);
      await AsyncStorage.setItem(AREAS_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error("Error saving areas:", error);
    }
  };

  const addArea = useCallback((name: string) => {
    if (name.trim()) {
      const newArea: Area = {
        id: Date.now().toString(),
        name,
        tasks: [],
        createdAt: Date.now(),
      };
      setAreas((prev) => [newArea, ...prev]);
    }
  }, []);

  const deleteArea = useCallback((id: string) => {
    setAreas((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addTaskToArea = useCallback((areaId: string, title: string) => {
    if (title.trim()) {
      setAreas((prev) =>
        prev.map((a) =>
          a.id === areaId
            ? {
                ...a,
                tasks: [
                  ...a.tasks,
                  {
                    id: Date.now().toString(),
                    title,
                    completed: false,
                    createdAt: Date.now(),
                  },
                ],
              }
            : a,
        ),
      );
    }
  }, []);

  const deleteTaskFromArea = useCallback((areaId: string, taskId: string) => {
    setAreas((prev) =>
      prev.map((a) =>
        a.id === areaId
          ? {
              ...a,
              tasks: a.tasks.filter((t) => t.id !== taskId),
            }
          : a,
      ),
    );
  }, []);

  const toggleTaskCompletion = useCallback((areaId: string, taskId: string) => {
    setAreas((prev) =>
      prev.map((a) =>
        a.id === areaId
          ? {
              ...a,
              tasks: a.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t,
              ),
            }
          : a,
      ),
    );
  }, []);

  return (
    <AreasContext.Provider
      value={{
        areas,
        addArea,
        deleteArea,
        addTaskToArea,
        deleteTaskFromArea,
        toggleTaskCompletion,
        loading,
      }}
    >
      {children}
    </AreasContext.Provider>
  );
}

export function useAreas() {
  const context = useContext(AreasContext);
  if (context === undefined) {
    throw new Error("useAreas must be used within an AreasProvider");
  }
  return context;
}
