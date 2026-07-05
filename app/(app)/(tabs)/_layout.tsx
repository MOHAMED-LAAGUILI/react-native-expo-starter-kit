import { Tabs } from "expo-router";
import { Home, Search, Settings, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home
              color={color}
              size={size}
            />
          ),
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerTitle: "Search",
          tabBarIcon: ({ color, size }) => (
            <Search
              color={color}
              size={size}
            />
          ),
          title: "Search",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User
              color={color}
              size={size}
            />
          ),
          title: "Profile",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          headerTitle: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings
              color={color}
              size={size}
            />
          ),
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
