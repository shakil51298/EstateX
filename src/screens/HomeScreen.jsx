import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../api/supabase";
import PropertyCard from "../components/PropertyCard";

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // quick purpose filter
  const [purpose, setPurpose] = useState(""); // "sale" | "rent" | ""

  // modal filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [type, setType] = useState(""); // apartment/land/house/commercial
  const [location, setLocation] = useState("");

  async function load() {
    let query = supabase.from("properties").select("*").eq("is_active", true);

    if (purpose) query = query.eq("purpose", purpose);

    if (search) query = query.ilike("title", `%${search}%`);
    if (location) query = query.ilike("location", `%${location}%`);

    if (minPrice) query = query.gte("price", Number(minPrice));
    if (maxPrice) query = query.lte("price", Number(maxPrice));

    if (minArea) query = query.gte("area_sqft", Number(minArea));
    if (maxArea) query = query.lte("area_sqft", Number(maxArea));

    if (beds) query = query.gte("beds", Number(beds));
    if (baths) query = query.gte("baths", Number(baths));

    if (type) query = query.eq("type", type);

    const { data } = await query.order("created_at", { ascending: false });
    setItems(data || []);
  }

  useEffect(() => {
    load();
  }, [purpose]);

  const gridData = useMemo(() => items, [items]);

  function clearFilters() {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setBeds("");
    setBaths("");
    setType("");
    setLocation("");
  }

  return (
    <View style={[s.wrap, { paddingTop: insets.top + 8 }]}>
      {/* Header */}
      <View style={s.headerRow}>
        <Text style={s.h1}>Explore</Text>

        <Pressable style={s.iconBtn} onPress={() => setFiltersOpen(true)}>
          <Ionicons name="options-outline" size={22} color="#111" />
        </Pressable>
      </View>

      {/* Quick Filters Row */}
      <View style={s.quickRow}>
        <Pressable
          style={[s.quickBtn, purpose === "sale" && s.quickBtnActive]}
          onPress={() => setPurpose((p) => (p === "sale" ? "" : "sale"))}
        >
          <Ionicons name="cash-outline" size={20} color={purpose === "sale" ? "#fff" : "#111"} />
        </Pressable>

        <Pressable
          style={[s.quickBtn, purpose === "rent" && s.quickBtnActive]}
          onPress={() => setPurpose((p) => (p === "rent" ? "" : "rent"))}
        >
          <Ionicons name="key-outline" size={20} color={purpose === "rent" ? "#fff" : "#111"} />
        </Pressable>

        {/* SELL = go to add listing */}
        <Pressable
          style={[s.quickBtn, s.quickBtnDark]}
          onPress={() => navigation.navigate("AddProperty")}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Grid */}
      <FlatList
        data={gridData}
        keyExtractor={(x) => x.id}
        numColumns={3}
        columnWrapperStyle={s.colWrap}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={s.cell}>
            <PropertyCard
              item={item}
              variant="grid"
              onPress={() => navigation.navigate("Details", { propertyId: item.id })}
            />
          </View>
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
        ListEmptyComponent={<Text style={s.empty}>No properties yet.</Text>}
      />

      {/* Filters Modal */}
      <Modal visible={filtersOpen} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={s.modalSheet}
          >
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Filters</Text>
              <Pressable onPress={() => setFiltersOpen(false)}>
                <Ionicons name="close" size={26} color="#111" />
              </Pressable>
            </View>

            <TextInput
              style={s.input}
              placeholder="Search title (optional)"
              value={search}
              onChangeText={setSearch}
            />

            <TextInput
              style={s.input}
              placeholder="Location (optional)"
              value={location}
              onChangeText={setLocation}
            />

            <View style={s.row}>
              <TextInput
                style={[s.input, s.half]}
                placeholder="Min Price"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
              <TextInput
                style={[s.input, s.half]}
                placeholder="Max Price"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>

            <View style={s.row}>
              <TextInput
                style={[s.input, s.half]}
                placeholder="Min Area (sqft)"
                value={minArea}
                onChangeText={setMinArea}
                keyboardType="numeric"
              />
              <TextInput
                style={[s.input, s.half]}
                placeholder="Max Area (sqft)"
                value={maxArea}
                onChangeText={setMaxArea}
                keyboardType="numeric"
              />
            </View>

            <View style={s.row}>
              <TextInput
                style={[s.input, s.half]}
                placeholder="Beds (min)"
                value={beds}
                onChangeText={setBeds}
                keyboardType="numeric"
              />
              <TextInput
                style={[s.input, s.half]}
                placeholder="Baths (min)"
                value={baths}
                onChangeText={setBaths}
                keyboardType="numeric"
              />
            </View>

            <TextInput
              style={s.input}
              placeholder="Type: apartment/land/house/commercial"
              value={type}
              onChangeText={setType}
            />

            <View style={s.modalActions}>
              <Pressable
                style={[s.modalBtn, s.modalBtnGhost]}
                onPress={() => {
                  clearFilters();
                  setPurpose("");
                }}
              >
                <Text style={[s.modalBtnText, { color: "#111" }]}>Clear</Text>
              </Pressable>

              <Pressable
                style={[s.modalBtn, s.modalBtnDark]}
                onPress={async () => {
                  await load();
                  setFiltersOpen(false);
                }}
              >
                <Text style={s.modalBtnText}>Apply</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, backgroundColor: "#fafafa" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  h1: { fontSize: 26, fontWeight: "900" },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  quickRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  quickBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  quickBtnActive: { backgroundColor: "#111", borderColor: "#111" },
  quickBtnDark: { backgroundColor: "#111", borderColor: "#111" },

  colWrap: { gap: 10 },
  cell: { flex: 1, marginBottom: 10 },

  empty: { color: "#666", marginTop: 30 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "900" },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },

  modalActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 14, alignItems: "center" },
  modalBtnDark: { backgroundColor: "#111" },
  modalBtnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee" },
  modalBtnText: { color: "#fff", fontWeight: "900" },
});