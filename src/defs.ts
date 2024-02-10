import { Player, Message, Channel, ChannelSettings } from "./index";
import { Collection } from "@discordjs/collection";
import EventEmitter from "eventemitter3"

declare global {
  interface Window {
    MPP2?: {
      people: Collection<string, Player>;
      sendJsonMessage: (any: any, keep: boolean) => void;
      messages: Message[];
      channels: Channel[];
      chSettings: ChannelSettings;
      currentChannel: Channel;
      emitter: EventEmitter
      me: Player;
      ws: WebSocket | EventSource;
    };
    MPP?: any;
  }
}

export {};
