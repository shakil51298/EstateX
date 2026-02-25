import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { supabase } from "../api/supabase";

export default function AdminAllUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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

  // ---------------- DELETE ----------------
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

  // ---------------- VERIFY ----------------
  async function toggleVerify(user) {
    await supabase
      .from("profiles")
      .update({ is_verified: !user.is_verified })
      .eq("id", user.id);

    loadUsers();
  }

  // ---------------- UPDATE ----------------
  function openEdit(user) {
    setEditingUser({ ...user });
    setModalVisible(true);
  }

  async function updateUser() {
    await supabase
      .from("profiles")
      .update({
        full_name: editingUser.full_name,
        phone: editingUser.phone,
        role: editingUser.role,
      })
      .eq("id", editingUser.id);

    setModalVisible(false);
    loadUsers();
  }

  // ---------------- EXPORT CSV ----------------
  async function exportCSV() {
    const header =
      "Name,Email,Phone,Role,Verified,CreatedAt\n";

    const rows = users
      .map(
        (u) =>
          `${u.full_name},${u.email},${u.phone || ""},${u.role},${
            u.is_verified
          },${u.created_at}`
      )
      .join("\n");

    const fileUri = FileSystem.documentDirectory + "users.csv";

    await FileSystem.writeAsStringAsync(fileUri, header + rows);

    await Sharing.shareAsync(fileUri);
  }

  // ---------------- FILTERED USERS ----------------
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" ? true : u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <View style={{ flex: 1 }}>
      {/* TOP CONTROLS */}
      <View style={styles.topControls}>
        <TextInput
          placeholder="Search by name or email"
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView horizontal>
          {["all", "user", "agent", "seller", "admin"].map(
            (role) => (
              <Pressable
                key={role}
                style={[
                  styles.filterBtn,
                  roleFilter === role && styles.activeFilter,
                ]}
                onPress={() => setRoleFilter(role)}
              >
                <Text
                  style={{
                    color:
                      roleFilter === role ? "white" : "black",
                  }}
                >
                  {role}
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>

        <Pressable style={styles.exportBtn} onPress={exportCSV}>
          <Text style={{ color: "white" }}>Export CSV</Text>
        </Pressable>
      </View>

      {/* TABLE */}
      <ScrollView horizontal>
        <View>
          <View style={[styles.row, styles.header]}>
            <Text style={styles.cellHeader}>Name</Text>
            <Text style={styles.cellHeader}>Email</Text>
            <Text style={styles.cellHeader}>Phone</Text>
            <Text style={styles.cellHeader}>Role</Text>
            <Text style={styles.cellHeader}>Verified</Text>
            <Text style={styles.cellHeader}>Actions</Text>
          </View>

          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.row}>
              <Text style={styles.cell}>{user.full_name}</Text>
              <Text style={styles.cell}>{user.email}</Text>
              <Text style={styles.cell}>{user.phone}</Text>
              <Text style={styles.cell}>{user.role}</Text>

              <Pressable
                style={[
                  styles.verifyBtn,
                  {
                    backgroundColor: user.is_verified
                      ? "green"
                      : "gray",
                  },
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
                  onPress={() => openEdit(user)}
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

      {/* UPDATE MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Update User</Text>

          <TextInput
            style={styles.input}
            value={editingUser?.full_name}
            onChangeText={(v) =>
              setEditingUser({ ...editingUser, full_name: v })
            }
            placeholder="Full Name"
          />

          <TextInput
            style={styles.input}
            value={editingUser?.phone}
            onChangeText={(v) =>
              setEditingUser({ ...editingUser, phone: v })
            }
            placeholder="Phone"
          />

          <TextInput
            style={styles.input}
            value={editingUser?.role}
            onChangeText={(v) =>
              setEditingUser({ ...editingUser, role: v })
            }
            placeholder="Role"
          />

          <Pressable style={styles.saveBtn} onPress={updateUser}>
            <Text style={{ color: "white" }}>Save Changes</Text>
          </Pressable>

          <Pressable
            style={styles.cancelBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topControls: {
    padding: 10,
    backgroundColor: "#f5f5f5",
  },

  search: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginBottom: 10,
    borderRadius: 6,
  },

  filterBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 6,
    borderRadius: 6,
  },

  activeFilter: {
    backgroundColor: "#111",
  },

  exportBtn: {
    backgroundColor: "#111",
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
    alignItems: "center",
  },

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
    padding: 12,
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

  modal: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },

  saveBtn: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },

  cancelBtn: {
    marginTop: 10,
    alignItems: "center",
  },
});
