import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  TextInput,
} from "react-native";
import { supabase } from "../api/supabase";
import PropertyCard from "../components/PropertyCard";

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState(null);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [type, setType] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    let query = supabase.from("properties").select("*").eq("is_active", true);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (minPrice) {
      query = query.gte("price", Number(minPrice));
    }

    if (maxPrice) {
      query = query.lte("price", Number(maxPrice));
    }

    if (type) {
      query = query.eq("type", type);
    }

    const { data } = await query.order("created_at", { ascending: false });

    setItems(data || []);
  }

  async function checkRole() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    setRole(data?.role);
  }

  async function loadUnread() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("read", false)
      .neq("sender_id", userId);

    setUnreadCount(data?.length || 0);
  }

  useEffect(() => {
    load();
    checkRole();
    loadUnread();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <View style={s.wrap}>
      <View style={s.topRow}>
        <Text style={s.h1}>Explore</Text>

        <View style={s.actions}>
          <Pressable
            style={s.pill}
            onPress={() => navigation.navigate("Favorites")}
          >
            <Text style={s.pillText}>Favorites</Text>
          </Pressable>
          <Pressable
            style={s.pill}
            onPress={() => navigation.navigate("MyListings")}
          >
            <Text style={s.pillText}>My Listings</Text>
          </Pressable>
          <Pressable
            style={[s.pill, s.pillDark]}
            onPress={() => navigation.navigate("AddProperty")}
          >
            <Text style={[s.pillText, { color: "#fff" }]}>+ Add</Text>
          </Pressable>
          <Pressable
            style={s.pill}
            onPress={() => navigation.navigate("MyTransactions")}
          >
            <Text style={s.pillText}>My Payments</Text>
          </Pressable>

          <Pressable
            style={s.pill}
            onPress={() => navigation.navigate("MyLeads")}
          >
            <Text style={s.pillText}>My Leads</Text>
          </Pressable>

          <Pressable
            style={s.pill}
            onPress={() => navigation.navigate("Inbox")}
          >
            <Text style={s.pillText}>
              Inbox {unreadCount > 0 ? `(${unreadCount})` : ""}
            </Text>
          </Pressable>

          <Pressable
            style={s.pill}
            onPress={() => navigation.navigate("UpgradePlan")}
          >
            <Text style={s.pillText}>Upgrade</Text>
          </Pressable>

          {role === "admin" && (
            <Pressable style={s.pill} onPress={() => navigation.navigate("Admin")}>
              <Text style={s.pillText}>
                Admin Panel
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <TextInput
        placeholder="Search by title"
        value={search}
        onChangeText={setSearch}
        style={{ borderWidth: 1, padding: 8, marginBottom: 6 }}
      />

      <TextInput
        placeholder="Min Price"
        value={minPrice}
        onChangeText={setMinPrice}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginBottom: 6 }}
      />

      <TextInput
        placeholder="Max Price"
        value={maxPrice}
        onChangeText={setMaxPrice}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginBottom: 6 }}
      />

      <TextInput
        placeholder="Type (apartment, land...)"
        value={type}
        onChangeText={setType}
        style={{ borderWidth: 1, padding: 8, marginBottom: 6 }}
      />

      <Pressable
        onPress={load}
        style={{ backgroundColor: "black", padding: 10, marginBottom: 10 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Apply Filters
        </Text>
      </Pressable>

      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        renderItem={({ item }) => (
          <PropertyCard
            item={item}
            onPress={() =>
              navigation.navigate("Details", { propertyId: item.id })
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={
          <Text style={{ color: "#666", marginTop: 30 }}>
            No properties yet.
          </Text>
        }
      />

      <Pressable style={s.logout} onPress={logout}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>Logout</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: "#fafafa" },
  topRow: { marginBottom: 10 },
  h1: { fontSize: 26, fontWeight: "900" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  pillDark: { backgroundColor: "#111", borderColor: "#111" },
  pillText: { fontWeight: "800" },
  logout: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 12,
  },
});
