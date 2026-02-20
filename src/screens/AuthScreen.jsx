import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { supabase } from "../api/supabase";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
      },
    });
  
    if (error) {
      alert(error.message);
    } else {
      alert("Check your email to confirm your account.");
    }
  }
  

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert("Login failed", error.message);
  }

  return (
    <View style={s.wrap}>
      <Text style={s.title}>EstateX</Text>

      <TextInput style={s.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <Pressable style={s.btn} onPress={signIn}>
        <Text style={s.btnText}>Login</Text>
      </Pressable>

      <Pressable style={[s.btn, s.btnAlt]} onPress={signUp}>
        <Text style={s.btnText}>Create Account</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 34, fontWeight: "700", marginBottom: 18 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, marginBottom: 10 },
  btn: { backgroundColor: "#111", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 6 },
  btnAlt: { backgroundColor: "#333" },
  btnText: { color: "#fff", fontWeight: "700" },
});
