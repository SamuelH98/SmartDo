import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { useRouter } from "expo-router";
import { Moon, Sun, Settings, Plus } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top", "bottom"]}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
          <Settings size={32} color="#3b82f6" />
          <AppText
            style={[styles.title, { color: theme.text, marginLeft: 12 }]}
          >
            Settings
          </AppText>
        </View>
        {/* Settings Content */}
        <View style={styles.content}>
          {/* Dark Mode Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              {isDark ? (
                <Moon size={24} color={theme.textSecondary} />
              ) : (
                <Sun size={24} color={theme.textSecondary} />
              )}
              <AppText style={[styles.settingText, { color: theme.text }]}>
                Dark Mode
              </AppText>
            </View>

            <TouchableOpacity
              onPress={toggleTheme}
              style={[
                styles.toggleSwitch,
                {
                  backgroundColor: isDark ? theme.primary : theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  {
                    left: isDark ? 28 : 4,
                  },
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* Additional settings can be added here */}
          <View style={[styles.divider, { borderTopColor: theme.border }]} />

          <AppText
            style={[styles.comingSoonText, { color: theme.textTertiary }]}
          >
            More settings coming soon...
          </AppText>
        </View>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/(tabs)/inbox?add=true")}
      >
        <View style={styles.addButtonContent}>
          <Plus size={28} color="white" strokeWidth={2.5} />
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    lineHeight: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    fontSize: 18,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    position: "relative",
  },
  toggleThumb: {
    position: "absolute",
    top: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  divider: {
    marginTop: 24,
    borderTopWidth: 1,
  },
  comingSoonText: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 14,
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#3b82f6",
    borderRadius: 26,
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonContent: {
    flexDirection: "column",
    alignItems: "center",
  },
});
