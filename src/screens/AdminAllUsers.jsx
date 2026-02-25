import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { supabase } from "../api/supabase";

export default function AdminAllUsers() {
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  async function loadUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setUsers(data || []);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function deleteUser(id) {
    Alert.alert("Confirm", "Delete this user?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await supabase.from("profiles").delete().eq("id", id);
          loadUsers();
        },
      },
    ]);
  }

  async function toggleVerify(user) {
    await supabase
      .from("profiles")
      .update({ is_verified: !user.is_verified })
      .eq("id", user.id);

    loadUsers();
  }

  async function updateUser(user) {
    await supabase
      .from("profiles")
      .update({
        full_name: user.full_name,
        phone: user.phone,
      })
      .eq("id", user.id);

    Alert.alert("Updated");
  }

  async function createUser() {
    if (!newUser.full_name || !newUser.email) {
      return Alert.alert("Name and email required");
    }

    await supabase.from("profiles").insert({
      ...newUser,
      role: "user",
    });

    setNewUser({ full_name: "", email: "", phone: "" });
    setCreating(false);
    loadUsers();
  }

  return (
    <ScrollView horizontal>
      <View style={{ padding: 10 }}>
        <Pressable
          style={styles.createBtn}
          onPress={() => setCreating(!creating)}
        >
          <Text style={{ color: "white" }}>
            {creating ? "Cancel" : "Create New User"}
          </Text>
        </Pressable>

        {creating && (
          <View style={styles.createBox}>
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={newUser.full_name}
              onChangeText={(v) =>
                setNewUser({ ...newUser, full_name: v })
              }
            />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={newUser.email}
              onChangeText={(v) =>
                setNewUser({ ...newUser, email: v })
              }
            />
            <TextInput
              placeholder="Phone"
              style={styles.input}
              value={newUser.phone}
              onChangeText={(v) =>
                setNewUser({ ...newUser, phone: v })
              }
            />

            <Pressable style={styles.saveBtn} onPress={createUser}>
              <Text style={{ color: "white" }}>Save</Text>
            </Pressable>
          </View>
        )}

        {/* HEADER */}
        <View style={[styles.row, styles.header]}>
          <Text style={styles.cellHeader}>Name</Text>
          <Text style={styles.cellHeader}>Email</Text>
          <Text style={styles.cellHeader}>Phone</Text>
          <Text style={styles.cellHeader}>Role</Text>
          <Text style={styles.cellHeader}>Verified</Text>
          <Text style={styles.cellHeader}>Actions</Text>
        </View>

        {users.map((user) => (
          <View key={user.id} style={styles.row}>
            <TextInput
              style={styles.cell}
              value={user.full_name || ""}
              onChangeText={(v) =>
                setUsers((prev) =>
                  prev.map((u) =>
                    u.id === user.id ? { ...u, full_name: v } : u
                  )
                )
              }
            />

            <Text style={styles.cell}>{user.email}</Text>

            <TextInput
              style={styles.cell}
              value={user.phone || ""}
              onChangeText={(v) =>
                setUsers((prev) =>
                  prev.map((u) =>
                    u.id === user.id ? { ...u, phone: v } : u
                  )
                )
              }
            />

            <Text style={styles.cell}>{user.role}</Text>

            <Pressable
              style={[
                styles.verifyBtn,
                { backgroundColor: user.is_verified ? "green" : "gray" },
              ]}
              onPress={() => toggleVerify(user)}
            >
              <Text style={{ color: "white" }}>
                {user.is_verified ? "Verified" : "Verify"}
              </Text>
            </Pressable>

            <View style={{ flexDirection: "row", gap: 6 }}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => updateUser(user)}
              >
                <Text style={{ color: "white" }}>Update</Text>
              </Pressable>

              <Pressable
                style={[styles.actionBtn, { backgroundColor: "red" }]}
                onPress={() => deleteUser(user.id)}
              >
                <Text style={{ color: "white" }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}
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
    width: 150,
    padding: 12,
    color: "white",
    fontWeight: "700",
  },

  cell: {
    width: 150,
    padding: 8,
  },

  createBtn: {
    backgroundColor: "#111",
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  createBox: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginBottom: 8,
  },

  saveBtn: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },

  verifyBtn: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    borderRadius: 6,
    padding: 8,
  },

  actionBtn: {
    backgroundColor: "#111",
    padding: 8,
    borderRadius: 6,
  },
});
