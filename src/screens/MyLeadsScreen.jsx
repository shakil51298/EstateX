import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { supabase } from "../api/supabase";

export default function MyLeadsScreen() {
  const [leads, setLeads] = useState([]);

  async function load() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    setLeads(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1 }}>
            <Text>Phone: {item.phone}</Text>
            <Text>Message: {item.message}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}
    