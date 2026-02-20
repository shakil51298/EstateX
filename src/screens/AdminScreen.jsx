import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { Edit, Trash2, ShieldCheck, Ban } from "lucide-react-native";

import { supabase } from "../api/supabase";

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});

  async function loadData() {
    const { data: usersData } = await supabase.from("profiles").select("*");
    const { data: propData } = await supabase.from("properties").select("*");
    const { data: txData } = await supabase.from("transactions").select("*");
    const { data: subData } = await supabase
      .from("user_subscriptions")
      .select(`*, subscription_plans(name, price)`);

    const usersWithPayments = await Promise.all(
      (usersData || []).map(async (user) => {
        const { data: payments } = await supabase
          .from("transactions")
          .select("amount")
          .eq("seller_id", user.id)
          .eq("status", "approved");

        const totalPaid =
          payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

        return { ...user, totalPaid };
      })
    );

    setUsers(usersWithPayments || []);
    setProperties(propData || []);
    setTransactions(txData || []);
    setSubscriptions(subData || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  // ================= USERS =================

  async function updateUserRole(userId) {
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setEditingUser(null);
    loadData();
  }

  async function deleteUser(userId) {
    await supabase.from("profiles").delete().eq("id", userId);
    loadData();
  }

  async function suspendUser(userId) {
    const suspendUntil = new Date();
    suspendUntil.setDate(suspendUntil.getDate() + 7);

    await supabase
      .from("profiles")
      .update({ suspended_until: suspendUntil.toISOString() })
      .eq("id", userId);

    loadData();
  }

  async function verifyUser(userId) {
    await supabase.from("profiles").update({ verified: true }).eq("id", userId);
    loadData();
  }

  // ================= PROPERTIES =================

  async function approveProperty(id) {
    await supabase
      .from("properties")
      .update({ approval_status: "approved" })
      .eq("id", id);
    loadData();
  }

  async function rejectProperty(id) {
    await supabase
      .from("properties")
      .update({ approval_status: "rejected" })
      .eq("id", id);
    loadData();
  }

  async function deleteProperty(id) {
    await supabase.from("properties").delete().eq("id", id);
    loadData();
  }

  // ================= BOOST =================

  async function approveBoost(order) {
    await supabase
      .from("transactions")
      .update({ status: "approved" })
      .eq("id", order.id);

    await supabase.from("property_boosts").insert({
      property_id: order.property_id,
      seller_id: order.seller_id,
      approval_status: "approved",
      is_active: true,
    });

    loadData();
  }

  // ================= SUBSCRIPTION =================

  async function approveSubscription(sub) {
    await supabase
      .from("user_subscriptions")
      .update({ approval_status: "approved", status: "active" })
      .eq("id", sub.id);

    loadData();
  }

  // ================= DASHBOARD STATS =================

  const totalUsers = users.length;
  const totalProperties = properties.length;
  const totalRevenue = transactions
    .filter((t) => t.status === "approved")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // ================= RENDER =================

  const tabs = ["dashboard", "users", "properties", "boosts", "subscriptions"];

  return (
    <View style={{ flex: 1 }}>
      {/* TAB HEADER */}
      <View style={{ flexDirection: "row", backgroundColor: "#111" }}>
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: activeTab === tab ? "#333" : "#111",
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              {tab.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
      {/* DASHBOARD */}
      {activeTab === "dashboard" && (
        <View>
          <Text>Total Users: {totalUsers}</Text>
          <Text>Total Properties: {totalProperties}</Text>
          <Text>Total Revenue: ৳ {totalRevenue}</Text>
        </View>
      )}

      {/* USERS */}
      {activeTab === "users" && (
        <View style={{ flex: 1 }}>
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              paddingVertical: 12,
              backgroundColor: "#f2f2f2",
              borderBottomWidth: 1,
            }}
          >
            <Text style={{ flex: 2, fontWeight: "bold" }}>Email</Text>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Role</Text>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Verified</Text>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Total Paid</Text>
            <Text style={{ flex: 1, fontWeight: "bold" }}>Actions</Text>
          </View>

          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: "#eee1e1",
                  alignItems: "center",
                }}
              >
                <Text style={{ flex: 2 }}>{item.email || item.id}</Text>
                <Text style={{ flex: 1 }}>{item.role}</Text>
                <Text style={{ flex: 1 }}>{item.verified ? "Yes" : "No"}</Text>
                <Text style={{ flex: 1 }}>৳ {item.totalPaid}</Text>

                <View style={{ flex: 1, flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={() => {
                      setSelectedUser(item);
                      setFormData(item);
                      setEditModalVisible(true);
                    }}
                  >
                    <Edit size={18} color="blue" />
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      Alert.alert("Confirm Delete", "Are you sure?", [
                        { text: "Cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: async () => {
                            await supabase
                              .from("profiles")
                              .delete()
                              .eq("id", item.id);
                            loadData();
                          },
                        },
                      ])
                    }
                  >
                    <Trash2 size={18} color="red" />
                  </Pressable>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* PROPERTIES */}
      {activeTab === "properties" &&
        properties.map((p) => (
          <View
            key={p.id}
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          >
            <Text>{p.title}</Text>
            <Text>Status: {p.approval_status}</Text>

            <Pressable onPress={() => approveProperty(p.id)}>
              <Text style={{ color: "green" }}>Approve</Text>
            </Pressable>

            <Pressable onPress={() => rejectProperty(p.id)}>
              <Text style={{ color: "orange" }}>Reject</Text>
            </Pressable>

            <Pressable onPress={() => deleteProperty(p.id)}>
              <Text style={{ color: "red" }}>Delete</Text>
            </Pressable>
          </View>
        ))}

      {/* BOOSTS */}
      {activeTab === "boosts" &&
        transactions.map((t) => (
          <View
            key={t.id}
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          >
            <Text>Amount: ৳ {t.amount}</Text>
            <Text>Status: {t.status}</Text>

            {t.status === "pending" && (
              <Pressable onPress={() => approveBoost(t)}>
                <Text style={{ color: "green" }}>Approve Boost</Text>
              </Pressable>
            )}
          </View>
        ))}

      {/* SUBSCRIPTIONS */}
      {activeTab === "subscriptions" &&
        subscriptions.map((s) => (
          <View
            key={s.id}
            style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
          >
            <Text>Plan: {s.subscription_plans?.name}</Text>
            <Text>Status: {s.status}</Text>

            {s.approval_status === "pending" && (
              <Pressable onPress={() => approveSubscription(s)}>
                <Text style={{ color: "green" }}>Approve</Text>
              </Pressable>
            )}
          </View>
        ))}

      <Modal visible={editModalVisible} animationType="slide">
        <ScrollView style={{ padding: 20, marginTop: 40 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>Edit User</Text>

          {[
            "email",
            "name",
            "phone",
            "address",
            "photo_url",
            "document_url",
            "role",
          ].map((field) => (
            <TextInput
              key={field}
              placeholder={field}
              value={formData[field] || ""}
              onChangeText={(text) =>
                setFormData({ ...formData, [field]: text })
              }
              style={{
                borderWidth: 1,
                padding: 10,
                marginVertical: 6,
              }}
            />
          ))}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ flex: 1 }}>Verified</Text>
            <Switch
              value={formData.verified || false}
              onValueChange={(value) =>
                setFormData({ ...formData, verified: value })
              }
            />
          </View>

          <Pressable
            onPress={async () => {
              if (!selectedUser) return;

              const { error } = await supabase
                .from("profiles")
                .update({
                  email: formData.email,
                  name: formData.name,
                  phone: formData.phone,
                  address: formData.address,
                  photo_url: formData.photo_url,
                  document_url: formData.document_url,
                  role: formData.role,
                  verified: formData.verified,
                })
                .eq("id", selectedUser.id);

              if (error) {
                Alert.alert("Update Failed", error.message);
                return;
              }

              Alert.alert("Updated Successfully");
              setEditModalVisible(false);
              loadData();
            }}
            style={{
              backgroundColor: "green",
              padding: 12,
              marginTop: 10,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              Save Changes
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setEditModalVisible(false)}
            style={{
              backgroundColor: "gray",
              padding: 12,
              marginTop: 10,
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </Modal>
    </View>
  );
}
