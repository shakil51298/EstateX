import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../api/supabase";

export default function AdminVerifiedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_verified", true)
      .order("created_at", { ascending: false });

    if (!error) setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView horizontal>
      <View>
        {/* HEADER */}
        <View style={[styles.row, styles.header]}>
          <Text style={styles.cellHeader}>Name</Text>
          <Text style={styles.cellHeader}>Email</Text>
          <Text style={styles.cellHeader}>Phone</Text>
          <Text style={styles.cellHeader}>Role</Text>
          <Text style={styles.cellHeader}>Created At</Text>
          <Text style={styles.cellHeader}>User ID</Text>
        </View>

        {/* DATA */}
        {users.map((user) => (
          <View key={user.id} style={styles.row}>
            <Text style={styles.cell}>{user.full_name}</Text>
            <Text style={styles.cell}>{user.email}</Text>
            <Text style={styles.cell}>{user.phone || "-"}</Text>
            <Text style={styles.cell}>{user.role || "user"}</Text>
            <Text style={styles.cell}>
              {new Date(user.created_at).toLocaleDateString()}
            </Text>
            <Text style={styles.cell}>{user.id.slice(0, 8)}</Text>
          </View>
        ))}

        {users.length === 0 && (
          <View style={styles.center}>
            <Text>No verified users found.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  header: {
    backgroundColor: "#111",
  },

  cellHeader: {
    width: 160,
    padding: 12,
    color: "white",
    fontWeight: "700",
  },

  cell: {
    width: 160,
    padding: 12,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
