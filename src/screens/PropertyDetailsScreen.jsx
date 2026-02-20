import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { supabase } from "../api/supabase";
import { Alert, TextInput } from "react-native";

export default function PropertyDetailsScreen({ route, navigation }) {
  const { propertyId } = route.params;
  const [item, setItem] = useState(null);
  const [fav, setFav] = useState(false);

  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single();
    if (!error) setItem(data);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;

    const { data: f } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("property_id", propertyId)
      .maybeSingle();
    setFav(!!f);

    await supabase
      .from("properties")
      .update({ views: (data.views || 0) + 1 })
      .eq("id", id);
  }

  async function sendInquiry() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) {
      return Alert.alert("Login required");
    }

    if (!phone) {
      return Alert.alert("Phone required");
    }

    const { error } = await supabase.from("leads").insert({
      property_id: property.id,
      buyer_id: userId,
      seller_id: property.owner_id,
      message,
      phone,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Sent", "Seller will contact you.");
      setMessage("");
      setPhone("");
    }
  }

  useEffect(() => {
    load();
  }, [propertyId]);

  async function toggleFav() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return Alert.alert("Login required");

    if (!fav) {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, property_id: propertyId });
      if (error) return Alert.alert("Failed", error.message);
      setFav(true);
    } else {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("property_id", propertyId);
      if (error) return Alert.alert("Failed", error.message);
      setFav(false);
    }
  }

  if (!item)
    return (
      <View style={s.wrap}>
        <Text>Loading...</Text>
      </View>
    );

  return (
    <View style={s.wrap}>
      <Text style={s.title}>{item.title}</Text>
      <Text style={s.meta}>
        {item.location} • {item.purpose?.toUpperCase()} • {item.type}
      </Text>
      <Text style={s.price}>৳ {Number(item.price).toLocaleString()}</Text>
      <Text style={s.desc}>
        {item.description || "No description provided."}
      </Text>

      <Pressable style={s.btn} onPress={toggleFav}>
        <Text style={s.btnText}>
          {fav ? "★ Remove Favorite" : "☆ Add to Favorites"}
        </Text>
      </Pressable>

      <Pressable style={[s.btn, s.btnAlt]} onPress={() => navigation.goBack()}>
        <Text style={[s.btnText, { color: "#111" }]}>Back</Text>
      </Pressable>

      <TextInput
        placeholder="Your phone"
        value={phone}
        onChangeText={setPhone}
        style={{ borderWidth: 1, marginTop: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Message"
        value={message}
        onChangeText={setMessage}
        style={{ borderWidth: 1, marginTop: 10, padding: 10 }}
      />

      <Pressable
        onPress={sendInquiry}
        style={{ backgroundColor: "black", padding: 12, marginTop: 10 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Contact Seller
        </Text>
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate("Chat", { property: item })}
        style={{ backgroundColor: "blue", padding: 12, marginTop: 10 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Chat Seller</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "900" },
  meta: { marginTop: 6, color: "#555" },
  price: { marginTop: 12, fontSize: 20, fontWeight: "900" },
  desc: { marginTop: 12, color: "#333", lineHeight: 20 },
  btn: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
  },
  btnAlt: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
  btnText: { color: "#fff", fontWeight: "900" },
});
