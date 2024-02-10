import { Player, Message, Channel, ChannelSettings } from "./index";
import { Collection } from "@discordjs/collection";

declare global {
  interface Window {
    MPP2?: {
      people: Collection<string, Player>;
      sendJsonMessage: (any: any, keep: boolean) => void;
      messages: Message[];
      channels: Channel[];
      chSettings: ChannelSettings;
      currentChannel: Channel;
    };
    MPP?: any;
  }
}

export {};
