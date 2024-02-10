/*
	Four months after his first visit to the clinic, 
	Oliver has stopped taking Mcat and has cut down his ketamine use
*/

import { h, Fragment } from "preact";
import { install } from '@twind/core'
import config from '../twind.config'
import { useState, useRef, useEffect } from "preact/hooks"

import { Collection } from "@discordjs/collection"
import { Toaster, toast, useToasterStore } from "react-hot-toast"
import EventEmitter from "eventemitter3"
import useWebSocket from 'react-use-websocket';

import Piano, { Key } from "./components/Piano"
import People from "./components/People"
import Chat from "./components/Chat"
import Status from "./components/Status"
import Cursors from "./components/Cursors"
import Crown from "./components/Crown"

install(config)

export interface Player {
	name: string;
	_id: string;
	color: string;
	tag?: {
		text: string;
		color: string;
	};
	permissions?: Record<string, true>;
	id?: string;
	x?: number;
	y?: number;
	vanished?: boolean;
}

export interface Crown {
	endPos: { x: number, y: number };
	startPos: { x: number, y: number };
	userId?: string;
	time: number;
	participantId?: string;
}

export interface ChannelSettings {
	chat: boolean;
	color: string;
	color2: string;
	visible: boolean;
	noindex: boolean;
	limit: number;
	lobby: boolean;
	crownsolo: boolean;
	"no cussing": boolean;
}

export interface Channel {
	_id: string;
	id: string
	settings: ChannelSettings;
	count: number;
	crown: Crown;

}

export interface Message {
	id: string;
	a: string;
	m: string;
	r?: string;

	t: number;

	p?: Player;
	sender?: Player;
	recipient?: Player;
}

export default function App() {
	const keysRef = useRef<Key[]>([]);

	const meRef = useRef<Player>();
	const emitterRef = useRef<EventEmitter>(new EventEmitter());

	const peopleRef = useRef<Collection<string, Player>>(new Collection());

	const [messages, setMessages] = useState<Message[]>([]);
	const [channels, setChannels] = useState<Channel[]>()

	const [chSettings, setChSettings] = useState<ChannelSettings>({} as ChannelSettings);

	const [currentChannel, setCurrentChannel] = useState<Channel>();

	const {
		sendMessage,
		sendJsonMessage,
		lastMessage,
		lastJsonMessage,
		readyState,
		getWebSocket,
	} = useWebSocket("wss://mpp.yourfriend.lol/ws", {
		onOpen: () => {
			sendJsonMessage([{
				m: "devices",
				list: []
			}])

			setInterval(() => {
				sendJsonMessage([{
					m: "t",
					e: Date.now()
				}])
			}, 10000)
		},
		shouldReconnect: (closeEvent) => true,
	});

	useEffect(() => {
		if (lastJsonMessage) {
			(lastJsonMessage as any[]).forEach(z => {
				emitterRef.current.emit(z.m, z);
				if (z.m == "b") {
					if (z.code.startsWith("~")) z.code = z.code.substring(1);
					sendJsonMessage([{
						m: "hi",
						token: localStorage.token,
						code: new Function(z.code)()
					}])
				} else if (z.m == "hi") {
					meRef.current = z.u;
					meRef.current.permissions = z.permissions;
					if (z.motd) {
						//@ts-expect-error
						toast(<h1 innerHTML={z.motd}></h1>, { duration: 10000 })
					}
					sendJsonMessage([{ m: "ch", _id: decodeURIComponent(location.hash.substring(1)) || "lobby" }])
					if (z.token) {
						localStorage.setItem("token", z.token);
					}
				} else if (z.m == "ch") {
					if (!z.ch.settings.lobby && z.ch.id) {
						location.hash = "#" + z.ch.id;
					}
					setCurrentChannel(z.ch);
					setChSettings(z.ch.settings)
					peopleRef.current = new Collection();
					z.ppl.forEach(z => {
						peopleRef.current.set(z.id, z);
					})
				} else if (z.m == "notification") {
					toast(<div>
						<h1 class="text-xl">{z.title || "<no title specified>"}</h1>
						<h4 class="text-sm">{z.target || "<no target specified>"}</h4>
						<span innerHTML={z.html || z.text}></span>
					</div>, { duration: 5000 })
				} else if (z.m == "m") {
					const person = peopleRef.current.get(z.id);
					person.x = +z.x;
					person.y = +z.y;
				} else if (z.m == "bye") {
					peopleRef.current.delete(z.p);
				} else if (z.m == "p") {
					peopleRef.current.set(z.id, z);
					if (z._id == meRef.current._id) {
						meRef.current = {
							permissions: meRef.current.permissions,
							...z
						};
					}
				} else if (z.m == "n") {
					const user = peopleRef.current.get(z.p);

					z.n.forEach(g => {
						let k = keysRef.current.find(one => one.type == g.n);
						if (!k) return;
						if (!g.s) k.click(user.color);
					})
				} else if (z.m == "c") {
					setMessages(z.c);
				} else if (z.m == "dm" || z.m == "a") {
					setMessages(g => g.concat([z]));
				} else if (z.m == "ls") {
					if (z.c) {
						setChannels(z.u);
					} else {
						setChannels([...z.u, ...channels.filter(m => !z.u.some(g => g._id == m._id))])
					}
				}
			})
		}
	}, [lastJsonMessage])

	function setChannel(channel: string) {
		sendJsonMessage([{ m: "ch", _id: channel }])
	}
	function startQueryingChannelList() {
		sendJsonMessage([{
			m: "+ls"
		}])
	}

	function endQueryingChannelList() {
		sendJsonMessage([{
			m: "-ls"
		}])
		setChannels([]);
	}

	window.MPP2 = {
		people: peopleRef.current,
		messages,
		channels,
		chSettings,
		currentChannel,
		sendJsonMessage,
		emitter: emitterRef.current,
		me: meRef.current,
		ws: getWebSocket()
	}

	window.MPP = {
		chat: {
			send: (message) => {
				sendJsonMessage([{
					m: "a",
					message
				}])
			}
		},
		client: {
			channel: currentChannel,
			ppl: [...peopleRef.current.values()],
			user: meRef.current,
			ws: getWebSocket(),
			sendArray: sendJsonMessage,
			send: sendMessage,
			// all of these literally only exist to bypass Universe's antibot
			isConnected: function () { return true },
			connectionTime: undefined,
			isConnecting: function () { return false },
			preventsPlaying: function () { return false },
			participantId: undefined,
			canConnect: true
		}
	};

	return (
		<>
			<div
				style={{
					background: `radial-gradient(${chSettings.color} 0%, ${chSettings.color2} 100%)`,
					textShadow: "#999 1px 1px"
				}}
				className="w-full h-screen flex flex-col justify-center text-shadow"
			>
				<Crown sendJsonMessage={sendJsonMessage} currentChannel={currentChannel} meRef={meRef}></Crown>

				<div className="m-2 z-10 absolute top-0 z-40">
					<People peopleRef={peopleRef} meRef={meRef} currentChannel={currentChannel}></People>
				</div>

				<div className="h-48 w-full z-10 relative bg-[#00000025] rounded-xl p-1 z-40">
					<Piano keysRef={keysRef} meRef={meRef} sendJsonMessage={sendJsonMessage}></Piano>
				</div>

				<Chat className="absolute bottom-0 z-0 rounded-md w-full text-white p-1 z-30" peopleRef={peopleRef} messages={messages} sendJsonMessage={sendJsonMessage} meRef={meRef}>
					<Status {...{ currentChannel, startQueryingChannelList, endQueryingChannelList, channels, setChannel, peopleRef, sendJsonMessage, meRef }}></Status>
				</Chat>
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none z-40">
					<Cursors meRef={meRef} peopleRef={peopleRef} sendJsonMessage={sendJsonMessage}></Cursors>
				</div>
			</div>
			<Toaster />
		</>
	);
}

