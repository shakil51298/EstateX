import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { supabase } from "../../api/supabase";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function AdminScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data } = await supabase.auth.getSession();
    const userId = data?.session?.user?.id;

    if (!userId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setUser(profile);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  function MenuItem({ icon, label, onPress }) {
    return (
      <Pressable style={styles.menuItem} onPress={onPress}>
        {icon}
        <Text style={styles.menuText}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color="#999" />
      </Pressable>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* TOP PROFILE SECTION */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri:
              user?.avatar_url ||
              "https://i.pravatar.cc/150?img=3",
          }}
          style={styles.avatar}
        />

        <View>
          <Text style={styles.name}>
            {user?.full_name || "Admin"}
          </Text>
          <Text style={styles.subText}>
            EstateX Administrator
          </Text>
        </View>
      </View>

      {/* MENU SECTION */}
      <View style={styles.menuSection}>
        <MenuItem
          icon={<Ionicons name="speedometer-outline" size={22} color="#111" />}
          label="Dashboard"
          onPress={() => navigation.navigate("AdminDashboard")}
        />

        <MenuItem
          icon={<Ionicons name="people-outline" size={22} color="#111" />}
          label="Users"
          onPress={() => navigation.navigate("AdminUsers")}
        />

        <MenuItem
          icon={<Ionicons name="home-outline" size={22} color="#111" />}
          label="Properties"
          onPress={() => navigation.navigate("AdminProperties")}
        />

        <MenuItem
          icon={<MaterialIcons name="trending-up" size={22} color="#111" />}
          label="Boosts"
          onPress={() => navigation.navigate("AdminBoosts")}
        />

        <MenuItem
          icon={<FontAwesome5 name="crown" size={20} color="#111" />}
          label="Subscriptions"
          onPress={() => navigation.navigate("AdminSubscriptions")}
        />

        <MenuItem
          icon={<Ionicons name="settings-outline" size={22} color="#111" />}
          label="Settings"
          onPress={() => navigation.navigate("AdminSettings")}
        />
      </View>

      {/* LOGOUT */}
      <Pressable style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={22} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
  },

  subText: {
    color: "#777",
    marginTop: 4,
  },

  menuSection: {
    marginTop: 20,
    backgroundColor: "white",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    gap: 14,
  },

  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },

  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "#111",
    margin: 20,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  logoutText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});
