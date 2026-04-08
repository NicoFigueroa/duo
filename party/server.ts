import type * as Party from "partykit/server";
import type {
  JoinMessage,
  WelcomeMessage,
  RosterMessage,
  RosterEntry,
} from "../src/game/messages";

export default class UnoParty implements Party.Server {
  hostId: string | null = null;
  roster: Map<string, string> = new Map(); // id → name

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    if (!this.hostId) {
      this.hostId = conn.id;
    }

    // New joiner gets a snapshot of the current lobby
    const welcome: WelcomeMessage = {
      type: "welcome",
      yourId: conn.id,
      hostId: this.hostId,
      roster: this.rosterList(),
    };
    conn.send(JSON.stringify(welcome));
  }

  onClose(conn: Party.Connection) {
    this.roster.delete(conn.id);

    if (conn.id === this.hostId) {
      const next = [...this.room.getConnections()].find((c) => c.id !== conn.id);
      this.hostId = next?.id ?? null;
    }

    this.broadcastRoster();
  }

  onMessage(message: string, sender: Party.Connection) {
    const msg = JSON.parse(message) as { type: string };

    if (msg.type === "join") {
      // Client is announcing their name — update roster and tell everyone
      const { name } = msg as JoinMessage;
      this.roster.set(sender.id, name);
      this.broadcastRoster();
      return;
    }

    // Everything else is relayed as-is
    this.room.broadcast(message, [sender.id]);
  }

  private rosterList(): RosterEntry[] {
    return [...this.roster.entries()].map(([id, name]) => ({ id, name }));
  }

  private broadcastRoster() {
    const msg: RosterMessage = {
      type: "roster",
      hostId: this.hostId ?? "",
      roster: this.rosterList(),
    };
    this.room.broadcast(JSON.stringify(msg));
  }
}
