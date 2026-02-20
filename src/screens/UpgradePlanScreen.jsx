import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Alert, FlatList } from "react-native";
import { supabase } from "../api/supabase";

export default function UpgradePlanScreen({ navigation }) {
  const [plans, setPlans] = useState([]);

  async function loadPlans() {
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("price", { ascending: true });

    setPlans(data || []);
  }

  useEffect(() => {
    loadPlans();
  }, []);

  async function requestPlan(plan) {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) return;

    // request subscription (pending)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    const { error } = await supabase.from("user_subscriptions").insert({
      user_id: userId,
      plan_id: plan.id,
      end_date: endDate.toISOString(),
      status: plan.price === 0 ? "active" : "pending",
    });

    if (error) return Alert.alert("Error", error.message);

    if (plan.price === 0) {
      Alert.alert("Activated", "Free plan is active.");
      return navigation.goBack();
    }

    Alert.alert(
      "Payment Required",
      `Plan: ${plan.name}\nAmount: ৳${plan.price}\n\nSend money to:\n✅ bKash: 017XXXXXXXX\n✅ Nagad: 018XXXXXXXX\n\nThen wait for admin approval.`
    );

    navigation.goBack();
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "900", marginBottom: 10 }}>
        Upgrade Plan
      </Text>

      <FlatList
        data={plans}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => requestPlan(item)}
            style={{
              padding: 14,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 14,
              marginBottom: 10,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800" }}>{item.name}</Text>
            <Text style={{ marginTop: 4 }}>৳ {item.price} / {item.duration_days} days</Text>
            <Text style={{ marginTop: 4 }}>Max listings: {item.max_listings}</Text>
            <Text style={{ marginTop: 4 }}>Boosts included: {item.boosts_included}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
