declare module "*.py" {
	const file: string;
	export default file;
}

declare module "*?raw" {
	const file: string;
	export default file;
}

declare module "*?raw&inline" {
	const file: string;
	export default file;
}

declare module "*?url" {
	const url: URL;
	export default url;
}

declare module "*?worker&url" {
	const url: URL;
	export default url;
}

declare module "*?worker&inline" {
	const code: string;
	export default code;
}

declare module "*?inline";
