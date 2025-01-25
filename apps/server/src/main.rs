use warp::Filter;
use warp::ws::{Message, WebSocket};
use futures_util::{StreamExt, SinkExt};
use futures_util::stream::SplitSink;
use std::sync::Arc;
use tokio::sync::Mutex;

// Type alias for the sending half of the WebSocket
type ClientSink = SplitSink<WebSocket, Message>;

#[tokio::main]
async fn main() {
    // Shared list of client sinks, protected by an async mutex
    let peers = Arc::new(Mutex::new(Vec::new()));

    // Define the /doc-sync route that upgrades to WebSocket
    let doc_sync = warp::path("doc-sync")
        .and(warp::ws())
        .map(move |ws: warp::ws::Ws| {
            let peers = peers.clone();
            // The closure must be async and `Send`
            ws.on_upgrade(move |socket| async move {
                handle_client(socket, peers).await;
            })
        });

    warp::serve(doc_sync)
        .run(([127, 0, 0, 1], 3030))
        .await;
}

/// Handle a newly-upgraded WebSocket client:
///  - split into (sender, receiver)
///  - add `sender` to our peers list
///  - read inbound messages, broadcast them if they're binary
///  - remove `sender` on disconnect
async fn handle_client(ws: WebSocket, peers: Arc<Mutex<Vec<ClientSink>>>) {
    let (sender, mut receiver) = ws.split();
    println!("New client connected: {:?}", sender);

    // Add this client's sender to the global list
    {
        let mut sinks = peers.lock().await;
        sinks.push(sender);
    }

    // Main receive loop
    while let Some(Ok(msg)) = receiver.next().await {
        // For example, broadcast only if it's binary
        if msg.is_binary() {
            broadcast(&peers, msg).await;
        }
    }

    // On disconnect, we can't remove the exact sink easily unless we track an ID
    // or store references. Common approach: store (id, sink) in a HashMap.
    // For minimal example, we ignore removing here.
}

/// Broadcast a message to all current sinks,
/// removing any that fail to send.
async fn broadcast(peers: &Arc<Mutex<Vec<ClientSink>>>, msg: Message) {
    let mut remove_indices = Vec::new();

    // Lock once, do everything while locked
    {
        let mut sinks = peers.lock().await;

        for (i, sink) in sinks.iter_mut().enumerate() {
            if let Err(e) = sink.send(msg.clone()).await {
                eprintln!("send error: {e}");
                remove_indices.push(i);
            }
        }

        // Remove dead sinks in reverse index order
        for &i in remove_indices.iter().rev() {
            println!("Removing sink at index {}", i);
            sinks.remove(i);
        }
    }
}
