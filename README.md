# SmartDo

A Things3-inspired task management app built for Android using React Native and Expo.

## Overview

SmartDo is a modern task management application that brings the elegant simplicity of Things3 to Android. With its clean interface and powerful organizational features, SmartDo helps you capture, organize, and complete tasks efficiently.

## Features

### 📋 Task Organization

- **Inbox** - Quick capture for tasks and ideas
- **Today** - Focus on what matters now
- **Upcoming** - Plan ahead with scheduled tasks
- **Anytime** - Tasks without specific dates
- **Someday** - Future ideas and projects
- **Logbook** - Track completed accomplishments

### 🏗️ Projects & Areas

- **Areas** - Organize projects by life areas (Work, Personal, etc.)
- **Projects** - Break down complex goals into manageable tasks
- **Hierarchical structure** - Areas contain projects, projects contain tasks
- **Drag & drop** - Intuitive organization with gesture controls

### 🎨 User Experience

- **Dark/Light theme** - Automatic theme switching with system preferences
- **Search** - Quick find across all tasks, projects, and areas
- **Clean interface** - Minimalist design inspired by Things3
- **Smooth animations** - Fluid interactions and transitions
- **Native performance** - Built with React Native for optimal Android experience

### ⚡ Core Functionality

- **Task completion** - Simple checkbox interactions
- **Task management** - Create, edit, and delete tasks
- **Project management** - Organize tasks within projects
- **Area management** - Group related projects
- **Real-time updates** - Instant UI updates with state management

## Technology Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tooling
- **Expo Router** - File-based routing
- **TypeScript** - Type-safe development
- **NativeWind** - Tailwind CSS for React Native
- **Lucide React Native** - Beautiful icons
- **Async Storage** - Local data persistence

## Getting Started

### Prerequisites

- Node.js (18+)
- npm or yarn
- Expo CLI
- Android Studio or Android Emulator

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/smart-do.git
cd smart-do
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm start
# or
yarn start
```

4. Run on Android:

```bash
npm run android
# or
yarn android
```

## Project Structure

```
src/
├── app/
│   ├── (tabs)/           # Tab navigation screens
│   │   ├── index.tsx     # Home screen with all lists
│   │   ├── inbox.tsx     # Inbox view
│   │   ├── today.tsx     # Today's tasks
│   │   ├── upcoming.tsx  # Upcoming tasks
│   │   ├── anytime.tsx   # Anytime tasks
│   │   ├── someday.tsx   # Someday tasks
│   │   ├── logbook.tsx   # Completed tasks
│   │   ├── project.tsx   # Project details
│   │   └── settings.tsx  # App settings
│   ├── _layout.tsx       # Root layout
│   └── components/       # Reusable components
├── context/              # React Context providers
│   ├── AreasContext.tsx  # Areas state management
│   ├── ProjectsContext.tsx # Projects state management
│   ├── TasksContext.tsx  # Tasks state management
│   └── ThemeContext.tsx  # Theme management
└── utils/                # Utility functions
    └── cn.ts            # Tailwind class utilities
```

## Key Components

### Context Providers

- **AreasContext** - Manages life areas and their projects
- **ProjectsContext** - Handles project creation and task management
- **TasksContext** - Manages inbox tasks and completion tracking
- **ThemeContext** - Provides dark/light theme switching

### Core Screens

- **Home (index.tsx)** - Main dashboard with all lists and quick actions
- **Project View** - Detailed project management with task lists
- **Settings** - Theme preferences and app configuration

## Data Model

### Task

```typescript
interface Task {
  id: string;
  title: string;
  completed: boolean;
  timestamp: Date;
  // Additional fields for inbox tasks
  sender?: string;
  preview?: string;
}
```

### Project

```typescript
interface Project {
  id: string;
  name: string;
  areaId?: string;
  tasks: Task[];
  order: number;
}
```

### Area

```typescript
interface Area {
  id: string;
  name: string;
  tasks: Task[];
  order: number;
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Lint code
npm run lint
```



## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the design and functionality of [Things3](https://culturedcode.com/things/)
- Built with [Expo](https://expo.dev/) and [React Native](https://reactnative.dev/)
- Icons by [Lucide](https://lucide.dev/)

---

**SmartDo** - Simplify your task management on Android.
