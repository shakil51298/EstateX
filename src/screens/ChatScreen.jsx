import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  AppState,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../api/supabase";

export default function ChatScreen({ route }) {
  const { property, conversationId: passedId } = route.params || {};

  const [conversationId, setConversationId] = useState(passedId || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const [otherUserId, setOtherUserId] = useState(null);
  const [otherName, setOtherName] = useState("Chat");
  const [otherLastSeen, setOtherLastSeen] = useState(null);

  const [otherOnline, setOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const channelRef = useRef(null);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ---------- helpers ----------
  function scrollToBottom() {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd?.({ animated: true });
    }, 100);
  }

  async function updateLastSeen() {
    if (!currentUserId) return;
    await supabase.from("profiles").update({ last_seen: new Date().toISOString() }).eq("id", currentUserId);
  }

  // ---------- init user ----------
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id || null;
      setCurrentUserId(uid);
    })();
  }, []);

  // update last_seen on app foreground/background
  useEffect(() => {
    if (!currentUserId) return;

    updateLastSeen();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") updateLastSeen();
      else updateLastSeen();
    });

    return () => sub?.remove?.();
  }, [currentUserId]);

  // ---------- create/load conversation ----------
  useEffect(() => {
    if (!currentUserId) return;
    if (conversationId) return;

    (async () => {
      if (!property) return;

      // Buyer creates/loads conversation with seller
      let { data: conv } = await supabase
        .from("conversations")
        .select("*")
        .eq("property_id", property.id)
        .eq("buyer_id", currentUserId)
        .maybeSingle();

      if (!conv) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({
            property_id: property.id,
            buyer_id: currentUserId,
            seller_id: property.owner_id,
          })
          .select()
          .single();

        conv = newConv;
      }

      setConversationId(conv.id);
      const other = conv.buyer_id === currentUserId ? conv.seller_id : conv.buyer_id;
      setOtherUserId(other);
    })();
  }, [currentUserId, property]);

  // if opened from Inbox with passedId, we must load conversation to know other user
  useEffect(() => {
    if (!currentUserId) return;
    if (!passedId) return;
    if (otherUserId) return;

    (async () => {
      const { data: conv } = await supabase.from("conversations").select("*").eq("id", passedId).single();
      if (!conv) return;

      const other = conv.buyer_id === currentUserId ? conv.seller_id : conv.buyer_id;
      setOtherUserId(other);
    })();
  }, [currentUserId, passedId]);

  // ---------- load other user public profile (name + last seen) ----------
  useEffect(() => {
    if (!otherUserId) return;

    (async () => {
      const { data } = await supabase.from("profile_public").select("*").eq("id", otherUserId).single();
      if (data?.full_name) setOtherName(data.full_name);
      if (data?.last_seen) setOtherLastSeen(data.last_seen);
    })();
  }, [otherUserId]);

  // ---------- load messages + mark read ----------
  async function loadMessages() {
    if (!conversationId) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(data || []);

    // mark read for incoming messages
    if (currentUserId) {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("conversation_id", conversationId)
        .eq("read", false)
        .neq("sender_id", currentUserId);
    }

    scrollToBottom();
  }

  useEffect(() => {
    loadMessages();
  }, [conversationId, currentUserId]);

  // ---------- realtime: messages + presence (online/typing) ----------
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    // cleanup old channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase.channel(`conv:${conversationId}`, {
      config: { presence: { key: String(currentUserId) } },
    });

    // Realtime message insert
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async () => {
        await loadMessages();
      }
    );

    // Presence sync (online users list)
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState(); // { userId: [ { typing: bool } ] }
      const other = state?.[String(otherUserId)];
      setOtherOnline(!!other && other.length > 0);

      // typing can be stored in presence payload
      const typing = other?.[0]?.typing === true;
      setOtherTyping(typing);
    });

    // join + set initial presence
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ typing: false });
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId, currentUserId, otherUserId]);

  // ---------- typing: update presence typing flag ----------
  function setTyping(isTyping) {
    const ch = channelRef.current;
    if (!ch) return;
    ch.track({ typing: isTyping });
  }

  function onChangeText(val) {
    setText(val);

    // start typing
    setTyping(true);

    // stop typing after 1.2s idle
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setTyping(false), 1200);
  }

  // ---------- send text ----------
  async function sendText() {
    const content = text.trim();
    if (!content || !conversationId || !currentUserId) return;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
      type: "text",
      read: false,
    });

    setText("");
    setTyping(false);
    updateLastSeen();
  }

  // ---------- send image ----------
  async function pickAndSendImage() {
    if (!conversationId || !currentUserId) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (res.canceled) return;

    const uri = res.assets?.[0]?.uri;
    if (!uri) return;

    // upload to storage (public bucket)
    const fileExt = uri.split(".").pop() || "jpg";
    const fileName = `chat/${conversationId}/${Date.now()}.${fileExt}`;

    const fileResp = await fetch(uri);
    const blob = await fileResp.blob();

    const { error: upErr } = await supabase.storage.from("chat").upload(fileName, blob, {
      contentType: blob.type || "image/jpeg",
      upsert: true,
    });

    if (upErr) {
      console.log("Upload error:", upErr.message);
      return;
    }

    const { data: pub } = supabase.storage.from("chat").getPublicUrl(fileName);
    const url = pub?.publicUrl;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: "",
      type: "image",
      media_url: url,
      read: false,
    });

    updateLastSeen();
  }

  // ---------- header (name + online/typing/last seen) ----------
  function formatLastSeen(ts) {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return `last seen ${d.toLocaleString()}`;
    } catch {
      return "";
    }
  }

  const headerStatus = otherTyping
    ? "typing…"
    : otherOnline
    ? "online"
    : formatLastSeen(otherLastSeen);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* WhatsApp-like top bar */}
      <View style={{ padding: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: "#e6e6e6" }}>
        <Text style={{ fontSize: 16, fontWeight: "800" }}>{otherName}</Text>
        <Text style={{ marginTop: 2, color: "#666" }}>{headerStatus}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 10 }}
        onContentSizeChange={scrollToBottom}
        renderItem={({ item }) => {
          const isMe = item.sender_id === currentUserId;

          return (
            <View
              style={{
                alignSelf: isMe ? "flex-end" : "flex-start",
                backgroundColor: isMe ? "#111" : "#fff",
                padding: 10,
                borderRadius: 14,
                marginVertical: 4,
                maxWidth: "78%",
                borderWidth: isMe ? 0 : 1,
                borderColor: "#eee",
              }}
            >
              {item.type === "image" && item.media_url ? (
                <Image
                  source={{ uri: item.media_url }}
                  style={{ width: 220, height: 220, borderRadius: 12 }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ color: isMe ? "#fff" : "#000", fontSize: 15 }}>{item.content}</Text>
              )}
            </View>
          );
        }}
      />

      {/* Input bar */}
      <View
        style={{
          flexDirection: "row",
          padding: 8,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderColor: "#e6e6e6",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Pressable
          onPress={pickAndSendImage}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#eee",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 18 }}>＋</Text>
        </Pressable>

        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder="Message…"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 22,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: "#fff",
          }}
        />

        <Pressable
          onPress={sendText}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 22,
            backgroundColor: "#111",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
