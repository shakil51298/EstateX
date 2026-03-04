import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../screens/HomeScreen";
import MyListingsScreen from "../screens/MyListingsScreen";
import FavoritesScreen from "../screens//FavScree/FavoritesScreen";
import MessagesScreen from "../screens/MessagesScreen/MessagesScreen";
import MeScreen from "../screens/MeScreen/MeScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false, // icons only
        tabBarHideOnKeyboard: true, // ✅ keyboard won’t cover tabs
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          height: 56 + insets.bottom, // ✅ add safe-area bottom
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: "#eee",
          backgroundColor: "#fff",
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = "home-outline";

          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          if (route.name === "Property") iconName = focused ? "business" : "business-outline";
          if (route.name === "Messages") iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          if (route.name === "Me") iconName = focused ? "person" : "person-outline";
          if (route.name === "More") iconName = focused ? "grid" : "grid-outline";

          return <Ionicons name={iconName} size={size ?? 24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Property" component={MyListingsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Me" component={MeScreen} />
      <Tab.Screen name="More" component={FavoritesScreen} />
    </Tab.Navigator>
  );
}