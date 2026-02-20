import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function PropertyCard({ item, onPress }) {
  return (
    <Pressable onPress={onPress} style={s.card}>
      <Text style={s.title} numberOfLines={1}>{item.title}</Text>
      <Text style={s.meta}>{item.location} • {item.purpose?.toUpperCase()} • {item.type}</Text>
      <Text style={s.price}>৳ {Number(item.price).toLocaleString()}</Text>
      <Text style={s.small}>{item.beds || 0} beds • {item.baths || 0} baths • {item.area_sqft || 0} sqft</Text>
      <Text>👁 {item.views || 0} views</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#eee", marginBottom: 10, backgroundColor: "#fff" },
  title: { fontSize: 16, fontWeight: "800" },
  meta: { marginTop: 4, color: "#555" },
  price: { marginTop: 8, fontSize: 18, fontWeight: "900" },
  small: { marginTop: 6, color: "#666" },
});
