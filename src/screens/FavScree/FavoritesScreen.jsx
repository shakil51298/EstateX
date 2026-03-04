import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { supabase } from "../../api/supabase";
import PropertyCard from "../../components/PropertyCard";

export default function FavoritesScreen({ navigation }) {
  const [items, setItems] = useState([]);

  async function load() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data, error } = await supabase
      .from("favorites")
      .select("property_id, properties(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      const list = (data || []).map((x) => x.properties).filter(Boolean);
      setItems(list);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <View style={s.wrap}>
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        renderItem={({ item }) => (
          <PropertyCard
            item={item}
            onPress={() => navigation.navigate("Details", { propertyId: item.id })}
          />
        )}
        ListEmptyComponent={<Text style={{ color: "#666", marginTop: 30 }}>No favorites yet.</Text>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: "#fafafa" },
});
