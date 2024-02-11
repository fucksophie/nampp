import { h, Fragment } from "preact";
import { Player, Channel } from "../index"
import { Collection } from "@discordjs/collection"
import { toast } from "react-hot-toast"
import { getSetting } from "./status/ClientSettings"
import PeoplePopup from "./PeoplePopup"

import { useState, useRef } from "preact/hooks"
export function renderPerson(z, meRef) {
    return <span
        className="drop-shadow-lg whitespace-nowrap min-w-[2wh] max-w-min
         inline-block overflow-hidden text-white rounded-md drop-shadow-md mr-2 p-[2px]"
        style={{ backgroundColor: z.color }}
    >
        {
            z.vanished ? <span
                className="rounded-md p-1 mr-1"
                style={{ backgroundColor: "cyan" }}
            >
                VANISH
            </span> : undefined
        }
        {
            z.tag ? <span
                className="rounded-md p-[2px] mr-1"
                style={{ backgroundColor: z.tag.color }}
            >
                {z.tag.text}
            </span> : undefined
        }
        {z.name}
        {
            z.afk ? <span
                className="rounded-md p-1 ml-1"
                style={{ backgroundColor: "gray" }}
            >
                AFK
            </span> : undefined
        }

    </span>;
}

const PeopleDisplay = ({ peopleRef, meRef, currentChannel, inputRef, dmingUser }: {
    peopleRef: { current: Collection<string, Player> },
    meRef: { current: Player },
    currentChannel: Channel,
    inputRef: { current: HTMLInputElement },
    dmingUser: any,
}) => {
    return (
        <span className="text-sm">
            {(() => {

                return peopleRef.current.map(z => {
                    const elementRef = useRef<HTMLSpanElement>();
                    const [isMenuOpen, setIsMenuOpen] = useState(false);
                    return getSetting("hideAllBots", false) && z?.tag?.text == "BOT" ? undefined : <>

                        {
                            isMenuOpen ?
                                <PeoplePopup element={elementRef} dmingUser={dmingUser} inputRef={inputRef} player={z}></PeoplePopup> : undefined
                        }

                        {
                            z._id == meRef.current._id ?
                                <span className="absolute bottom-5 z-40 text-white">me</span> : undefined
                        }
                        <span
                            className="relative"
                            onContextMenu={async (e) => {
                                await navigator.clipboard.writeText(z._id)
                                toast("Copied ID!", { duration: 1000 })
                                e.preventDefault();
                            }}
                            onClick={async (e) => {
                                setIsMenuOpen((a) => !a);
                                e.preventDefault();
                            }}
                            ref={elementRef}
                        >

                            {(() => {
                                if (currentChannel?.crown?.userId == z._id) {
                                    return <img className={"absolute bottom-5 left-1 z-40 " + (!currentChannel.crown.participantId ? "opacity-25" : "")} src="https://multiplayerpiano.net/crown.png"></img>
                                };
                            })()}
                            {renderPerson(z, meRef)}
                        </span></>
                })
            })()}
        </span >);
}

export default PeopleDisplay;