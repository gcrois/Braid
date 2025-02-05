import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { LoroDoc, LoroText } from "loro-crdt";

interface CollabTextProps {
	wsUrl: string; // WebSocket endpoint (e.g. "ws://localhost:3030/doc-sync")
	containerKey?: string; // Key for the text container in the doc
	peerId?: number; // Optional. Unique ID for this user/peer. If not provided, randomly generated once.
}

/**
 * CollabText is a minimal collaborative text editor that:
 *  - Creates a single LoroDoc and WebSocket connection for the component’s lifetime.
 *  - Subscribes to a LoroText container and merges inbound edits.
 *  - On local edits, updates Loro, commits, and sends an incremental update over WebSocket.
 */
export function CollabText({
	wsUrl,
	containerKey = "demoText",
	peerId,
}: CollabTextProps): h.JSX.Element {
	const [textValue, setTextValue] = useState("");

	// -- Refs to hold doc, text, ws so they remain stable
	const docRef = useRef<LoroDoc | null>(null);
	const textRef = useRef<LoroText | null>(null);
	const wsRef = useRef<WebSocket | null>(null);

	// A stable peer ID that doesn't regenerate on each render
	const stablePeerIdRef = useRef<number>(
		peerId ?? Math.floor(Math.random() * 1e6),
	);

	// Main setup: run exactly once (empty dependency array)
	useEffect(() => {
		// 1) Create a LoroDoc and set a stable peerId
		const doc = new LoroDoc();
		doc.setPeerId(stablePeerIdRef.current);
		docRef.current = doc;

		// 2) Retrieve or create the text container
		//    If doc.getText(...) returns null, createText(...) will do so.
		let text = doc.getText(containerKey);
		textRef.current = text;

		// 3) Subscribe to text changes
		const unsubId = text.subscribe(() => {
			// On each change, read the entire text
			setTextValue(text.toString());
		});

		// 4) Create a single WebSocket connection
		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log(
				`Connected to ${wsUrl} as peer ${stablePeerIdRef.current}`,
			);
			// Optionally request an initial snapshot from the server here
		};

		ws.onmessage = async (evt) => {
			if (!docRef.current) return;

			// If your server sends raw binary data:
			if (evt.data instanceof Blob) {
				const arrayBuf = await evt.data.arrayBuffer();
				docRef.current.import(new Uint8Array(arrayBuf));
				// local subscription is triggered -> textValue is updated automatically
			}
			// If your server sends text/JSON, handle accordingly
		};

		ws.onerror = (err) => {
			console.error("WebSocket error", err);
		};

		// Cleanup on unmount
		return () => {
			// // Unsubscribe from text events
			// text.unsubscribe(unsubId);

			// Close WebSocket if open
			ws.close();
		};
		// No dependencies -> only run once
	}, []);

	// 5) Handle local edits -> text.update() + doc.commit() + doc.export()
	function handleChange(e: Event) {
		const newValue = (e.currentTarget as HTMLTextAreaElement).value;
		setTextValue(newValue);

		const doc = docRef.current;
		const text = textRef.current;
		const ws = wsRef.current;

		if (!doc || !text || !ws) return;

		// For simplicity, replace entire text with .update()
		text.update(newValue);

		// Loro events are only emitted after commit
		doc.commit({ message: "local edit" });

		// Export changes (incremental) and send to server
		if (ws.readyState === WebSocket.OPEN) {
			const update = doc.export({ mode: "update" });
			ws.send(update);
		}
	}

	return (
		<div style={{ padding: "1rem", border: "1px solid #666" }}>
			<h3>Collaborative Text Editor</h3>
			<textarea
				style={{ width: "100%", height: "5rem" }}
				value={textValue}
				onInput={handleChange}
			/>
		</div>
	);
}
