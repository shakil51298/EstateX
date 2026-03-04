import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { supabase } from "../../api/supabase";

export default function InboxScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);

  async function load() {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Inbox error:", error.message);
      return;
    }

    const filtered =
      data?.filter(
        (c) => c.buyer_id === userId || c.seller_id === userId
      ) || [];

    setConversations(filtered);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("Chat", {
                conversationId: item.id,
              })
            }
            style={{ padding: 12, borderBottomWidth: 1 }}
          >
            <Text>Conversation</Text>
            <Text style={{ color: "#666" }}>
              Property ID: {item.property_id}
            </Text>
          </Pressable>
        )}
      />

      {conversations.length === 0 && (
        <Text style={{ marginTop: 20 }}>
          No conversations yet.
        </Text>
      )}
    </View>
  );
}
