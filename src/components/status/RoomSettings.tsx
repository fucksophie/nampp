import { Dialog, Tab, Switch } from '@headlessui/react'
import { useState, useRef, useEffect } from "preact/hooks"
import { buttonClass } from "../Status"
import { Player, Channel } from "../../index"

const RoomSettingsDialog = ({ roomSettingsCallbackRef, meRef, sendJsonMessage, currentChannel }: {
    roomSettingsCallbackRef: { current: (bool) => void },
    meRef: { current: Player },
    sendJsonMessage: any,
    currentChannel: Channel;
}) => {
    if (!currentChannel || !meRef.current) return;
    const [isOpen, setIsOpen] = useState(false);

    roomSettingsCallbackRef.current = (e) => {
        setIsOpen(e);
    }

    const defs = [
        {
            type: "visible",
            text: 'Visible (open to everyone)'
        },
        {
            type: "chat",
            text: "Enable Chat"
        },
        {
            type: "crownsolo",
            text: 'Only Owner can Play'
        },
        {
            type: "no cussing",
            text: "No Cussing"
        },
        {
            type: "noindex",
            text: "Ask bots not to index this room"
        }
    ]
    function settingCallback(setting) {
        return function (value) {
            currentChannel.settings[setting] = value;
            sendJsonMessage([{
                m: "chset",
                set: currentChannel.settings
            }])
        }
    }
    return <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
    >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 w-screen overflow-y-auto ">
            <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm rounded bg-neutral-900 text-white p-2 border">
                    <Dialog.Title className="text-2xl">Change room settings</Dialog.Title>
                    {
                        currentChannel.crown ?
                            currentChannel.crown.participantId == meRef.current.id || meRef.current.permissions.chownAnywhere ?
                                <button className={buttonClass} onClick={() => {
                                    sendJsonMessage([{
                                        m: "chown"
                                    }])
                                }}>Drop crown</button>
                                : undefined
                            : undefined
                    }
                    {
                        defs.map(z => {
                            return <div className="mt-2">
                                <Switch
                                    checked={currentChannel.settings[z.type]}
                                    onChange={settingCallback(z.type)}
                                    className={`${currentChannel.settings[z.type] ? 'bg-green-600' : 'bg-red-500'
                                        } relative inline-flex h-6 w-11 text-white mr-1 items-center rounded-full`}
                                >
                                    <span
                                        className={`${currentChannel.settings[z.type] ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-neutral-800 transition`}
                                    />
                                </Switch>
                                {z.text}
                            </div>

                        })
                    }
                    <button onClick={() => setIsOpen(false)} className={buttonClass + " mt-2"}>Cancel</button>
                </Dialog.Panel>
            </div>
        </div>
    </Dialog>;
}

const RoomSettingsButton = ({ roomSettingsCallbackRef }: {
    roomSettingsCallbackRef: { current: (bool) => void }
}) => {
    return <button className={buttonClass} onClick={
        (e) => {
            roomSettingsCallbackRef.current(true);
        }
    }>
        Room Settings
    </button>
}

export { RoomSettingsDialog, RoomSettingsButton }