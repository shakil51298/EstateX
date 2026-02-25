import { View, Text } from "react-native";

export default function Placeholder({ route }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{route.name}</Text>
    </View>
  );
}
