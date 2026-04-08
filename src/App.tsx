import { useState } from "react";
import { NameEntry } from "./screens/NameEntry";
import { Lobby } from "./screens/Lobby";

type Screen = "join" | "lobby" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("join");
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");

  if (screen === "join") {
    return (
      <NameEntry
        onJoin={(n, r) => {
          setName(n);
          setRoomId(r);
          setScreen("lobby");
        }}
      />
    );
  }

  if (screen === "lobby") {
    return (
      <Lobby
        name={name}
        roomId={roomId}
        onStartGame={() => setScreen("game")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <p className="text-gray-400">Game coming soon...</p>
    </div>
  );
}
