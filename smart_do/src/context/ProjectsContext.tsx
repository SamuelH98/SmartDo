import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PROJECTS_STORAGE_KEY = "@projects";

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  someday?: boolean;
}

export interface Project {
  id: string;
  name: string;
  tasks: ProjectTask[];
  createdAt: number;
  areaId?: string; // Optional - if present, project belongs to an area
}

interface ProjectsContextType {
  projects: Project[];
  addProject: (name: string, areaId?: string) => void;
  deleteProject: (id: string) => void;
  moveProject: (projectId: string, newAreaId?: string) => void;
  addTaskToProject: (projectId: string, title: string) => void;
  deleteTaskFromProject: (projectId: string, taskId: string) => void;
  toggleTaskCompletion: (projectId: string, taskId: string) => void;
  getProjectsByArea: (areaId: string) => Project[];
  getStandaloneProjects: () => Project[];
  loading: boolean;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined,
);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (!loading) {
      saveProjects();
    }
  }, [projects]);

  const loadProjects = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(PROJECTS_STORAGE_KEY);
      if (jsonValue != null) {
        const loadedProjects = JSON.parse(jsonValue);
        setProjects(loadedProjects);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProjects = async () => {
    try {
      const jsonValue = JSON.stringify(projects);
      await AsyncStorage.setItem(PROJECTS_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error("Error saving projects:", error);
    }
  };

  const addProject = useCallback((name: string, areaId?: string) => {
    if (name.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        name,
        tasks: [],
        createdAt: Date.now(),
        areaId,
      };
      setProjects((prev) => [newProject, ...prev]);
    }
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addTaskToProject = useCallback((projectId: string, title: string) => {
    if (title.trim()) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: [
                  ...p.tasks,
                  {
                    id: Date.now().toString(),
                    title,
                    completed: false,
                    createdAt: Date.now(),
                  },
                ],
              }
            : p,
        ),
      );
    }
  }, []);

  const deleteTaskFromProject = useCallback(
    (projectId: string, taskId: string) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.filter((t) => t.id !== taskId),
              }
            : p,
        ),
      );
    },
    [],
  );

  const toggleTaskCompletion = useCallback(
    (projectId: string, taskId: string) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) =>
                  t.id === taskId ? { ...t, completed: !t.completed } : t,
                ),
              }
            : p,
        ),
      );
    },
    [],
  );

  const getProjectsByArea = useCallback(
    (areaId: string) => {
      return projects.filter((p) => p.areaId === areaId);
    },
    [projects],
  );

  const moveProject = useCallback((projectId: string, newAreaId?: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, areaId: newAreaId } : p)),
    );
  }, []);

  const getStandaloneProjects = useCallback(() => {
    return projects.filter((p) => !p.areaId);
  }, [projects]);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        addProject,
        deleteProject,
        moveProject,
        addTaskToProject,
        deleteTaskFromProject,
        toggleTaskCompletion,
        getProjectsByArea,
        getStandaloneProjects,
        loading,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}
