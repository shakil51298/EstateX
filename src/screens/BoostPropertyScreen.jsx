import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { supabase } from "../api/supabase";

export default function BoostPropertyScreen({ route, navigation }) {
  const { propertyId } = route.params;
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    async function loadPlans() {
      const { data } = await supabase.from("boost_plans").select("*");
      setPlans(data || []);
    }
    loadPlans();
  }, []);

  async function activate(plan) {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
  
    if (!userId) return;
  
    const { error } = await supabase.from("transactions").insert({
      seller_id: userId,
      property_id: propertyId,
      amount: plan.price,
      method: "bKash",
      status: "pending",
    });
  
    if (!error) {
      alert(
        `Payment Required\n\nSend ৳${plan.price} to:\n\nbKash: 017XXXXXXXX\nNagad: 018XXXXXXXX\n\nAfter payment, wait for admin approval.`
      );
      navigation.goBack();
    }
  }
  

  return (
    <View style={{ padding: 16 }}>
      {plans.map((plan) => (
        <Pressable
          key={plan.id}
          onPress={() => activate(plan)}
          style={{ padding: 12, borderWidth: 1, marginBottom: 10 }}
        >
          <Text>{plan.name}</Text>
          <Text>৳ {plan.price}</Text>
        </Pressable>
      ))}
    </View>
  );
}
