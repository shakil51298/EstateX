import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { supabase } from "../api/supabase";

export default function MyTransactionsScreen() {
  const [transactions, setTransactions] = useState([]);

  async function load() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    setTransactions(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderBottomWidth: 1 }}>
            <Text>Amount: ৳ {item.amount}</Text>
            <Text>Method: {item.method}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}
