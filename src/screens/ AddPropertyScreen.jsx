import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { supabase } from "../api/supabase";

export default function AddPropertyScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("0");
  const [baths, setBaths] = useState("0");
  const [areaSqft, setAreaSqft] = useState("0");
  const [purpose, setPurpose] = useState("sale"); // sale/rent
  const [type, setType] = useState("apartment");

  async function checkListingLimit(userId) {
    // active subscription
    const { data: sub } = await supabase
      .from("user_subscriptions")
      .select("status, end_date, subscription_plans (max_listings)")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .maybeSingle();

    const maxListings = sub?.subscription_plans?.max_listings ?? 3; // Free default

    const { count } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("is_active", true);

    return { ok: (count || 0) < maxListings, maxListings, current: count || 0 };
  }

  async function submit() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return Alert.alert("Not logged in");
    if (!title || !location || !price)
      return Alert.alert("Missing", "Title, Location, Price required");

    const limit = await checkListingLimit(userId);
    if (!limit.ok) {
      return Alert.alert(
        "Limit reached",
        `You already have ${limit.current} active listings. Your plan allows ${limit.maxListings}. Upgrade to add more.`
      );
    }

    const payload = {
      owner_id: userId,
      title,
      location,
      price: Number(price),
      beds: Number(beds || 0),
      baths: Number(baths || 0),
      area_sqft: Number(areaSqft || 0),
      purpose,
      type,
      is_active: true,
    };

    const { error } = await supabase.from("properties").insert(payload);
    if (error) return Alert.alert("Failed", error.message);

    Alert.alert("Done", "Property added!");
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h1}>Add Listing</Text>

      <TextInput
        style={s.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={s.input}
        placeholder="Location (Area, City)"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={s.input}
        placeholder="Price (BDT)"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <View style={s.row}>
        <TextInput
          style={[s.input, s.half]}
          placeholder="Beds"
          keyboardType="numeric"
          value={beds}
          onChangeText={setBeds}
        />
        <TextInput
          style={[s.input, s.half]}
          placeholder="Baths"
          keyboardType="numeric"
          value={baths}
          onChangeText={setBaths}
        />
      </View>

      <TextInput
        style={s.input}
        placeholder="Area (sqft)"
        keyboardType="numeric"
        value={areaSqft}
        onChangeText={setAreaSqft}
      />
      <TextInput
        style={s.input}
        placeholder="Purpose: sale or rent"
        value={purpose}
        onChangeText={setPurpose}
      />
      <TextInput
        style={s.input}
        placeholder="Type: apartment/land/house/commercial"
        value={type}
        onChangeText={setType}
      />

      <Pressable style={s.btn} onPress={submit}>
        <Text style={s.btnText}>Publish</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 10 },
  h1: { fontSize: 22, fontWeight: "900", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  btn: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  btnText: { color: "#fff", fontWeight: "900" },
});
