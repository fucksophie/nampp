import { h, Fragment, VNode } from "preact";
import { Message } from "../index"
import { useRef, useEffect, useState } from "preact/hooks"
import { Player } from "../index"
import { renderPerson } from "./People"
import { Collection } from "@discordjs/collection"

import { getSetting } from "./status/ClientSettings"

const Chat = ({ sendJsonMessage, messages, className, children, meRef, peopleRef }: {
    messages: Message[],
    sendJsonMessage: any,
    className: string,
    children: VNode[] | VNode,
    meRef: { current: Player },
    peopleRef: { current: Collection<string, Player> },
}) => {
    let cors = "https://cors.lukewarmcat.workers.dev/"
    let placeholderMeme = "https://github.com/mppnet/mppbackend/commit/6b933ddb976096a542c5de58dcbc39a8ac825350";
    const [replyingTo, setReplyingTo] = useState("");

    const [spotifyURL, setSpotifyURL] = useState("");
    const [spotifyOembed, setSpotifyOembed] = useState({});

    const inputRef = useRef<HTMLInputElement>();
    const [inputFocused, setInputFocused] = useState(false);

    useEffect( () => {
        async function f() {
            if (!spotifyURL) return;
            const req = await fetch(cors + btoa("https://open.spotify.com/oembed?url=" + spotifyURL));
            const body = await req.json();
            spotifyOembed[spotifyURL] = body;
            setSpotifyOembed(spotifyOembed);
        }
        f();
    }, [spotifyURL])
    useEffect(() => {
        window.addEventListener("keydown", e => {
            if (e.key == "Enter") {
                setInputFocused(z => !z)
                inputRef.current.placeholder = placeholderMeme;
                inputRef.current!.focus();
            }
            if (e.key == "Escape") {
                setInputFocused(z => false)
            }
        })

        inputRef.current!.addEventListener("click", () => {
            setInputFocused(z => true)
            inputRef.current.placeholder = placeholderMeme;

        })
    }, [])

    return (
        <div className={className + " transition " + (inputFocused ? "bg-[#00000099] z-50" : "bg-[#00000034]")}>
            <span className={getSetting("hideChat", false) ? "invisible" : "visible"}>
                <span className="overflow-y-scroll">
                    {
                        messages.map((z, i) => {
                            console.log(i);
                            if (z.p) {
                                return <div style={{
                                    opacity: 16 / i
                                }} class="flex align-center items-center transition-all" id={"msg-" + z.id}
                                    onContextMenu={(ev) => {
                                        inputRef.current!.focus();
                                        inputRef.current.placeholder = "Replying to " + z.p.name + " (" + z.a + ")";
                                        setReplyingTo(z.id);
                                        ev.preventDefault();
                                    }

                                    }>
                                    {getSetting("showTimestampsInChat", true) ? <span class="w-28 inline-block font-mono ">{new Date(z.t).toLocaleString().split(", ").at(-1)} </span> : ""}
                                    {getSetting("showUserIdInChat", true) ? <span class="w-14 font-mono mr-1">{z.p._id.slice(0, 6)}</span> : ""}
                                    <span style={{
                                        color: z.p.color
                                    }}>{z.p.name}: </span>
                                    {(() => {
                                        if (z.r) {
                                            let message = messages.find(g => g.id == z.r);
                                            let user = message?.p;

                                            return <span class="ml-1 h-[24px] text-xs" onClick={(() => {
                                                if (!user) return;
                                                const elem = document.getElementById("msg-" + z.r);
                                                if (elem.className.includes("highlighted")) return;
                                                const oldOpacity = elem.style.opacity;
                                                elem.style.opacity = "1";
                                                elem.style.border = "1px solid " + user.color + "80";
                                                elem.style.background = user.color + "20";

                                                elem.className += " highlighted";
                                                setTimeout(() => {
                                                    elem.style.opacity = oldOpacity;
                                                    elem.style.background = "";
                                                    elem.style.border = "";
                                                    elem.className = elem.className.replaceAll(" highlighted", "")
                                                }, 2000)
                                            })}>
                                                {renderPerson(user ? { ...user, name: "➥" + user.name } : {
                                                    name: "➥ Unknown message",
                                                    color: "gray"
                                                }, meRef)}
                                            </span>
                                        }
                                        return;
                                    })()}
                                    <span class="flex">
                                        {
                                            z.a.split(" ").map(g => {
                                                if (g.match(/@([\da-f]{24})/g)) {
                                                    let id = g.substring(1);
                                                    let user = peopleRef.current.get(id);
                                                    user ||= messages.find(z => z.p?._id == id)?.p;
                                                    if (!user) {
                                                        return g + " ";
                                                    }
                                                    user = { ...user, name: "@" + user.name };
                                                    return <span className="text-xs">
                                                        {renderPerson(user, meRef)}
                                                    </span>
                                                }
                                                if (g.match(/http(s)?:\/\/?[-a-zA-Z0-9@:%._\+~#=]{2,256}(\.[a-z]*)?\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/gm)) {
                                                    if (g.match(/https:\/\/open\.spotify\.com\/track\/([0-9a-zA-Z]*)/gm)) {
                                                        setSpotifyURL(g)
                                                        if (spotifyOembed[g]) {
                                                            return <a href={g} class="flex align-center items-center underline">
                                                                <img width="24px" height="24px" className="ml-1" src={spotifyOembed[g].thumbnail_url}></img>
                                                                {spotifyOembed[g].title}
                                                            </a>
                                                        }
                                                        return <span className="italic underline">Loading spotify embed...</span>

                                                    }

                                                    return <a href={g} className="italic bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500" target="_blank">
                                                        {g}
                                                    </a>
                                                }

                                                return g + " ";
                                            })
                                        }
                                    </span>
                                </div>
                            } else {
                                return <div style={{
                                    opacity: i / 16
                                }}>
                                    <span>DM </span>
                                    {getSetting("showUserIdInChat", true) ? <span>{z.sender.id.slice(0, 6)} </span> : ""}
                                    <span style={{
                                        color: z.sender.color
                                    }}>{z.sender.name}</span>
                                    <span> -&gt; </span>
                                    {getSetting("showUserIdInChat", true) ? <span>{z.recipient.id.slice(0, 6)} </span> : ""}
                                    <span style={{
                                        color: z.recipient.color
                                    }}>{z.recipient.name} </span>
                                    <span>{z.a}</span>
                                </div>
                            }
                        })
                    }
                </span>
                <input
                    className="w-full rounded-sm outline-none m-1 bg-[#00000044] p-1"
                    placeholder={placeholderMeme}
                    ref={inputRef}
                    onPaste={async e => {
                        const target = e.target as HTMLInputElement;
                        const items = [...e.clipboardData.items];
                        const uploading = items.some(z => z.kind == "file" && z.type.startsWith("image/"));
                        if (uploading) {
                            let content = target.value;
                            target.value = "Uploading..."
                            target.readOnly = true;
                            const links = await Promise.all(items.map(async z => {
                                if (z.kind == "file" && z.type.startsWith("image/")) {
                                    const formdata = new FormData();
                                    formdata.append("image", z.getAsFile());
                                    formdata.append("description", "Image by " + meRef.current._id);
                                    const res = await fetch(cors + btoa("https://api.imgur.com/3/image"), {
                                        method: "POST",
                                        headers: {
                                            'Authorization': 'Client-ID 79b79f27b7d7052'
                                        },
                                        body: formdata
                                    })

                                    if (res.ok) {
                                        const data = await res.json()
                                        return data.data.link;
                                    } else {
                                        return "[upload failed]"
                                    }

                                }
                            }))

                            target.value = content + links.join(" ") + " ";
                            target.readOnly = false;
                        }
                    }}
                    onKeyPress={e => {
                        if (e.key == "Enter") {
                            let tt = e.target as HTMLInputElement;
                            if (!tt.value) return;
                            if (tt.readOnly) return;
                            sendJsonMessage([{
                                m: 'a',
                                message: tt.value,
                                reply_to: replyingTo
                            }])
                            setReplyingTo(z => "")

                            tt.value = "";
                        }
                    }}
                >
                </input>
            </span>
            {children}
        </div>
    )
}

export default Chat;