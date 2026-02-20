import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet , Pressable, TextInput} from "react-native";
import { supabase } from "../api/supabase";
import PropertyCard from "../components/PropertyCard";

export default function MyListingsScreen({ navigation }) {
  const [items, setItems] = useState([]);

  async function load() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setItems(data || []);
  }

  useEffect(() => { load(); }, []);

  return (
<View style={s.wrap}>
  <FlatList
    data={items}
    keyExtractor={(x) => x.id}
    renderItem={({ item }) => (
      <View style={{ marginBottom: 12 }}>
        <PropertyCard
          item={item}
          onPress={() =>
            navigation.navigate("Details", { propertyId: item.id })
          }
        />

        <Pressable
          onPress={() =>
            navigation.navigate("BoostProperty", { propertyId: item.id })
          }
          style={{
            marginTop: 6,
            padding: 8,
            backgroundColor: "#f5f5f5",
            borderRadius: 6,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#007bff", fontWeight: "600" }}>
            🚀 Boost This Listing
          </Text>
        </Pressable>
        <Text style={{ marginTop: 4, color: "orange" }}>
  Boost Status: Check Transactions
</Text>

      </View>
    )}
    ListEmptyComponent={
      <Text style={{ color: "#666", marginTop: 30 }}>
        No listings yet.
      </Text>
    }
  />
</View>

  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: "#fafafa" },
});
