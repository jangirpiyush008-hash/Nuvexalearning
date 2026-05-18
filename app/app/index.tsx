import { Redirect } from "expo-router";

export default function Index() {
  // Root gate in _layout will redirect to /(auth) or /(tabs) based on session.
  return <Redirect href="/(tabs)/home" />;
}
