import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AdminDashboard({ navigation }) {
  const [openSection, setOpenSection] = useState(null);

  function toggle(section) {
    LayoutAnimation.easeInEaseOut();
    setOpenSection(openSection === section ? null : section);
  }

  function MenuItem({ label, onPress }) {
    return (
      <Pressable style={styles.subItem} onPress={onPress}>
        <Text style={styles.subText}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </Pressable>
    );
  }

  function Section({ title, sectionKey, children }) {
    const isOpen = openSection === sectionKey;

    return (
      <View style={styles.section}>
        <Pressable
          style={styles.sectionHeader}
          onPress={() => toggle(sectionKey)}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#111"
          />
        </Pressable>

        {isOpen && <View style={styles.subContainer}>{children}</View>}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>Admin Dashboard</Text>

      {/* USERS */}
      <Section title="Users" sectionKey="users">
        <MenuItem
          label="Verified Users"
          onPress={() => navigation.navigate("AdminVerifiedUsers")}
        />
        <MenuItem
          label="All Users"
          onPress={() => navigation.navigate("AdminAllUsers")}
        />
      </Section>

      {/* PROPERTIES */}
      <Section title="Properties" sectionKey="properties">
        <MenuItem
          label="Verified Properties"
          onPress={() => navigation.navigate("AdminVerifiedProperties")}
        />
        <MenuItem
          label="All Properties"
          onPress={() => navigation.navigate("AdminAllProperties")}
        />
        <MenuItem
          label="Pending / Others"
          onPress={() => navigation.navigate("AdminPendingProperties")}
        />
      </Section>

      {/* SUBSCRIPTIONS */}
      <Section title="Subscriptions" sectionKey="subscriptions">
        <MenuItem
          label="Active Subscriptions"
          onPress={() => navigation.navigate("AdminActiveSubscriptions")}
        />
        <MenuItem
          label="Ended Subscriptions"
          onPress={() => navigation.navigate("AdminEndedSubscriptions")}
        />
      </Section>

      {/* REVENUE */}
      <Section title="Revenue" sectionKey="revenue">
        <MenuItem
          label="Total Revenue"
          onPress={() => navigation.navigate("AdminTotalRevenue")}
        />
        <MenuItem
          label="Boost Revenue"
          onPress={() => navigation.navigate("AdminBoostRevenue")}
        />
        <MenuItem
          label="Subscription Revenue"
          onPress={() => navigation.navigate("AdminSubscriptionRevenue")}
        />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 20,
  },

  section: {
    backgroundColor: "white",
    borderRadius: 14,
    marginBottom: 15,
    overflow: "hidden",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  subContainer: {
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  subItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },

  subText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
