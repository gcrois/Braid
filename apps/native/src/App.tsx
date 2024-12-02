import { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import initCoreMjs from "@braid/c_example/build/js/core.mjs";
import { initCore } from "@braid/c_example";


export default function App() {
	useEffect(() => {
        console.log(initCoreMjs);
		initCoreMjs().then((core) => {
			console.log(core);
			core._main(0, 0);
		});
		console.log("Hello from the mobile app");
	});
	return (
		<View style={styles.container}>
			<Text>Hey I am the expo monorepo</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
