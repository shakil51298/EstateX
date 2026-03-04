// import React, { useEffect, useState } from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { getSession, onAuthStateChange } from "../store/session";

// import AuthScreen from "../screens/AuthScreen";
// import HomeScreen from "../screens/HomeScreen";
// import AddPropertyScreen from "../screens/ AddPropertyScreen";
// import MyListingsScreen from "../screens/MyListingsScreen";
// import FavoritesScreen from "../screens/FavoritesScreen";
// import PropertyDetailsScreen from "../screens/PropertyDetailsScreen";
// import MyLeadsScreen from "../screens/MyLeadsScreen";
// import BoostPropertyScreen from "../screens/BoostPropertyScreen";
// import MyTransactionsScreen from "../screens/MyTransactionsScreen";
// import AdminScreen from "../screens/AdminScreen";
// 
// import InboxScreen from "../screens/InboxScreen";
// import UpgradePlanScreen from "../screens/UpgradePlanScreen";
// import Placeholder from "../screens/Placeholder";
// import AdminDashboard from "../screens/AdminDashboard";
// import AdminVerifiedUsers from "../screens/AdminVerifiedUsers";
// import AdminAllUsers from "../screens/AdminAllUsers";

// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   const [session, setSession] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       setSession(await getSession());
//       setLoading(false);
//     })();

//     const { data } = onAuthStateChange(setSession);
//     return () => data?.subscription?.unsubscribe?.();
//   }, []);

//   if (loading) return null;

//   return (
//     <Stack.Navigator>
//       {!session ? (
//         <Stack.Screen
//           name="Auth"
//           component={AuthScreen}
//           options={{ title: "EstateX" }}
//         />
//       ) : (
//         <>
//           <Stack.Screen
//             name="Home"
//             component={HomeScreen}
//             options={{ title: "EstateX" }}
//           />
//           <Stack.Screen
//             name="Details"
//             component={PropertyDetailsScreen}
//             options={{ title: "Property" }}
//           />
//           <Stack.Screen
//             name="AddProperty"
//             component={AddPropertyScreen}
//             options={{ title: "Add Property" }}
//           />
//           <Stack.Screen
//             name="MyListings"
//             component={MyListingsScreen}
//             options={{ title: "My Listings" }}
//           />
//           <Stack.Screen
//             name="Favorites"
//             component={FavoritesScreen}
//             options={{ title: "Favorites" }}
//           />
//           <Stack.Screen name="MyLeads" component={MyLeadsScreen} />
//           <Stack.Screen name="BoostProperty" component={BoostPropertyScreen} />
//           <Stack.Screen
//             name="MyTransactions"
//             component={MyTransactionsScreen}
//           />
//           <Stack.Screen name="Admin" component={AdminScreen} />
//           <Stack.Screen name="Chat" component={ChatScreen} />
//           <Stack.Screen name="Inbox" component={InboxScreen} />
//           <Stack.Screen name="UpgradePlan" component={UpgradePlanScreen} />

//           <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
//           <Stack.Screen name="AdminUsers" component={Placeholder} />
//           <Stack.Screen name="AdminProperties" component={Placeholder} />
//           <Stack.Screen name="AdminBoosts" component={Placeholder} />
//           <Stack.Screen name="AdminSubscriptions" component={Placeholder} />
//           <Stack.Screen name="AdminSettings" component={Placeholder} />

//           <Stack.Screen
//             name="AdminVerifiedUsers"
//             component={AdminVerifiedUsers}
//           />
//           <Stack.Screen
//             name="AdminAllUsers"
//             component={AdminAllUsers}
//           />
//         </>
//       )}
//     </Stack.Navigator>
//   );
// }


import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getSession, onAuthStateChange } from "../store/session";

import AuthScreen from "../screens/AuthScreen";
import PropertyDetailsScreen from "../screens/PropertyDetailsScreen";
import AddPropertyScreen from "../screens/ AddPropertyScreen";
import ChatScreen from "../screens/MessagesScreen/ChatScreen/ChatScreen";
import TabNavigator from "./TabNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setSession(await getSession());
      setLoading(false);
    })();

    const { data } = onAuthStateChange(setSession);
    return () => data?.subscription?.unsubscribe?.();
  }, []);

  if (loading) return null;

  return (
    <Stack.Navigator>
      {!session ? (
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      ) : (
        <>
          {/* Bottom Tabs */}
          <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />

          {/* Stack screens opened from tabs */}
          <Stack.Screen name="Details" component={PropertyDetailsScreen} options={{ title: "Property" }} />
          <Stack.Screen name="AddProperty" component={AddPropertyScreen} options={{ title: "Add Property" }} />

          {/*Chat screen is hree.. */}
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}