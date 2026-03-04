import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";

export default function PropertyCard({ item, onPress, variant = "grid" }) {
  const img = item.cover_url || item.image_url || item.thumbnail_url;

  if (variant === "grid") {
    return (
      <Pressable onPress={onPress} style={s.gridCard}>
        <View style={s.imgWrap}>
          {img ? (
            <Image source={{ uri: img }} style={s.img} resizeMode="cover" />
          ) : (
            <View style={s.imgPlaceholder}>
              <Text style={{ color: "#777", fontWeight: "800" }}>No Photo</Text>
            </View>
          )}
        </View>

        <View style={s.gridBody}>
          <Text style={s.gridTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={s.gridPrice} numberOfLines={1}>
            ৳ {Number(item.price || 0).toLocaleString()}
          </Text>
          <Text style={s.gridMeta} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      </Pressable>
    );
  }

  // (optional) list variant if you use later
  return (
    <Pressable onPress={onPress} style={s.listCard}>
      <Text style={s.listTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={s.listMeta}>
        {item.location} • {item.purpose?.toUpperCase()} • {item.type}
      </Text>
      <Text style={s.listPrice}>
        ৳ {Number(item.price || 0).toLocaleString()}
      </Text>
      <Text style={s.listSmall}>
        {item.beds || 0} beds • {item.baths || 0} baths • {item.area_sqft || 0} sqft
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  // GRID
  gridCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  imgWrap: { width: "100%", aspectRatio: 1.2, backgroundColor: "#f2f2f2" },
  img: { width: "100%", height: "100%" },
  imgPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  gridBody: { padding: 10 },
  gridTitle: { fontSize: 13, fontWeight: "900" },
  gridPrice: { marginTop: 6, fontSize: 13, fontWeight: "900" },
  gridMeta: { marginTop: 4, fontSize: 11, color: "#666" },

  // LIST (optional)
  listCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  listTitle: { fontSize: 16, fontWeight: "800" },
  listMeta: { marginTop: 4, color: "#555" },
  listPrice: { marginTop: 8, fontSize: 18, fontWeight: "900" },
  listSmall: { marginTop: 6, color: "#666" },
});