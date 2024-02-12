import { useState, useRef } from "preact/hooks"
import { Channel, Player } from "../index"

import { RoomSettingsDialog, RoomSettingsButton } from "./status/RoomSettings"
import { ClientSettingsDialog, ClientSettingsButton } from "./status/ClientSettings"
import { NewRoomDialog, NewRoomButton } from "./status/NewRoom"
import { PlayAloneButton } from "./status/PlayAlone"
import { VanishButton } from "./status/Vanish"
import { ClearChatButton } from "./status/ClearChat"
import { Collection } from "@discordjs/collection"

export const buttonClass = "p-1 w-full text-ellipsis overflow-hidden bg-neutral-900 border rounded-md";

const Dropdown = (
    {
        options,
        cellClassName,
        className,
        buttonClassName,
        children,
        selectedElementClassName,
        dropdownClick,
        clickElement
    }: {
        options: {
            name: string;
            id: string;
            color?: string;
        }[],
        cellClassName: string,
        className: string,
        buttonClassName: string,
        selectedElementClassName: string,
        dropdownClick: any,
        clickElement: any
        children: string
    }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [selectedElement, setSelectedElement] = useState<string>("");

    return <div className={"transition " + className + (open ? " bottom-2" : "")}>
        <div className={(open ? "block" : "hidden") + " overflow-scroll h-64 transition-all"}>
            {
                options.map(z => {
                    return <div
                        className={cellClassName + " " + (selectedElement == z.name ? selectedElementClassName : "") + " " + (z.color ? "text-" + z.color + "-300" : "")}
                        onClick={() => { setSelectedElement(_ => z.id); clickElement(z.id) }}
                    >
                        {z.name}
                    </div>
                })
            }
        </div>
        <div className={"w-full transition"}>
            {children}
            <button onClick={() => { setOpen(z => !z); dropdownClick(!open) }} className={"float-right px-2 " + buttonClassName}>
                {open ? "v" : "^"}
            </button>
        </div>
    </div>
}

const Status = (
    {
        startQueryingChannelList,
        endQueryingChannelList,
        channels,
        currentChannel,
        setChannel,
        peopleRef,
        sendJsonMessage,
        meRef
    }: {
        startQueryingChannelList: () => void;
        endQueryingChannelList: () => void;
        channels: Channel[];
        currentChannel: Channel;
        peopleRef: { current: Collection<string, Player> },
        setChannel: (channel: string) => void;
        sendJsonMessage: any;
        meRef: { current: Player };
    }) => {
    let newRoomCallbackRef = useRef();
    let clientSettingsCallbackRef = useRef();
    let roomSettingsCallbackRef = useRef();

    return (
        <>
            <NewRoomDialog newRoomCallbackRef={newRoomCallbackRef} sendJsonMessage={sendJsonMessage}></NewRoomDialog>
            <ClientSettingsDialog clientSettingsCallbackRef={clientSettingsCallbackRef}></ClientSettingsDialog>
            <RoomSettingsDialog roomSettingsCallbackRef={roomSettingsCallbackRef} meRef={meRef} sendJsonMessage={sendJsonMessage} currentChannel={currentChannel}></RoomSettingsDialog>
            <div class="h-15 w-full whitespace-nowrap">
                <div className="absolute bottom-1 z-50 opacity-10 pointer-events-none  text-8xl">
                    <span class="text-10xl">
                        {peopleRef.current.size}
                    </span>{" "}
                    online
                </div>

                <div class="grid grid-rows-2 grid-cols-6 grid-flow-col gap-1">
                    <div class="col-span-2 relative">
                        <Dropdown
                            options={(channels || [])
                                .sort((a, b) => b.count - a.count)
                                .map(z => {
                                    return {
                                        name: z.id + " (" + z.count + "/" + z.settings.limit + ")",
                                        id: z.id,
                                        color: z.settings.lobby ? "yellow" : z.settings.visible ? "" : "blue"
                                    }
                                })}
                            cellClassName="bg-neutral-900 hover:bg-neutral-800 transition"
                            className="absolute w-full border pl-1 bg-neutral-900 rounded-md" // TODO: figure out how to position this piece of shit correctly
                            buttonClassName="bg-neutral-700 rounded-md"
                            selectedElementClassName="text-green-200"
                            dropdownClick={state => {
                                if (state) {
                                    startQueryingChannelList();
                                } else {
                                    endQueryingChannelList();
                                }
                            }}
                            clickElement={data => {
                                setChannel(data);
                            }}
                        >
                            {currentChannel?.id || "offline"}
                        </Dropdown>
                    </div>
                    <div>
                        <NewRoomButton newRoomCallbackRef={newRoomCallbackRef}></NewRoomButton>
                    </div>
                    <div>
                        <PlayAloneButton sendJsonMessage={sendJsonMessage}></PlayAloneButton>
                    </div>
                    <div>
                        <ClientSettingsButton clientSettingsCallbackRef={clientSettingsCallbackRef}></ClientSettingsButton>
                    </div>
                    <div>
                        <RoomSettingsButton roomSettingsCallbackRef={roomSettingsCallbackRef}></RoomSettingsButton>
                    </div>
                    {
                        meRef.current?.permissions?.vanish ?
                            <VanishButton sendJsonMessage={sendJsonMessage} meRef={meRef}></VanishButton>
                            : undefined
                    }
                    {
                        meRef.current?.permissions?.clearChat ?
                            <ClearChatButton sendJsonMessage={sendJsonMessage}></ClearChatButton>
                            : undefined
                    }
                </div>
            </div>
        </>
    )
}

export default Status;