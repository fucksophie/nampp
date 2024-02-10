import { Dialog, Tab, Switch } from '@headlessui/react'
import { useState, useRef, useEffect } from "preact/hooks"
import { buttonClass } from "../Status"
import {Fragment} from "preact"

const settingCache: Record<string, boolean> = {}

export function getSetting(name: string, defaultValue: boolean) {
    if (!settingCache[name]) {
        if (!localStorage[name]) {
            localStorage[name] = defaultValue;
            settingCache[name] = defaultValue;
        } else {
            settingCache[name] = localStorage[name] === "true";
        }

        return settingCache[name];
    }

    return settingCache[name];
}

const ClientSettingsDialog = ({ clientSettingsCallbackRef }: {
    clientSettingsCallbackRef: { current: (bool) => void }
}) => {
    const [isOpen, setIsOpen] = useState(false);

    let settings = {
        chat: [
            {
                name: "Show timestamps in chat",
                id: "showTimestampsInChat",
                state: useState(getSetting("showTimestampsInChat", true))
            },
            {
                name: "Show ids in chat",
                id: "showUserIdInChat",
                state: useState(getSetting("showUserIdInChat", true))
            },
            {
                name: "Hide chat",
                id: "hideChat",
                state: useState(getSetting("hideChat", false))
            }
        ],
        piano: [],
        misc: [
            {
                name: "Force dark background",
                id: "forceDarkBackground",
                state: useState(getSetting("forceDarkBackground", false))
            },
            {
                name: "Use smooth cursors",
                id: "useSmoothCursors",
                state: useState(getSetting("useSmoothCursors", false))
            },
            {
                name: "Hide all bots",
                id: "hideAllBots",
                state: useState(getSetting("hideAllBots", false))
            },
            {
                name: "Hide all cursors",
                id: "hideAllCursors",
                state: useState(getSetting("hideAllCursors", false))
            }
        ]
    }
    Object.values(settings).forEach(z => {
        z.forEach(g => {
            useEffect(() => {
                localStorage[g.id] = g.state[0];
                settingCache[g.id] = g.state[0];
            }, [g.state[0]])
        })
    })
    clientSettingsCallbackRef.current = (e) => {
        setIsOpen(e);
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
                    <Tab.Group>
                        <Tab.List className="mb-2 flex justify-center">
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={
                                            (selected ? 'bg-neutral-600 text-white' : 'bg-neutral-900') +
                                            ' p-1 rounded-md border text-center ml-1'
                                        }
                                    >
                                        Chat
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={
                                            (selected ? 'bg-neutral-600 text-white' : 'bg-neutral-900') +
                                            ' p-1 rounded-md border text-center ml-1'
                                        }
                                    >
                                        Piano
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={
                                            (selected ? 'bg-neutral-600 text-white' : 'bg-neutral-900') +
                                            ' p-1 rounded-md border text-center ml-1'
                                        }
                                    >
                                        Misc
                                    </button>
                                )}
                            </Tab>
                        </Tab.List>
                        <Tab.Panels>
                            {
                                Object.values(settings).map(z => {
                                    return <Tab.Panel>
                                        {z.map(g => {
                                            return <div className="mb-1">
                                                <Switch
                                                    checked={g.state[0]}
                                                    onChange={g.state[1]}
                                                    className={`${g.state[0] ? 'bg-green-600' : 'bg-red-500'
                                                        } relative inline-flex h-6 w-11 text-white mr-1 items-center rounded-full`}
                                                >
                                                    <span
                                                        className={`${g.state[0] ? 'translate-x-6' : 'translate-x-1'
                                                            } inline-block h-4 w-4 transform rounded-full bg-neutral-800 transition`}
                                                    />
                                                </Switch>
                                                {g.name}
                                            </div>
                                        })}
                                    </Tab.Panel>
                                })
                            }

                        </Tab.Panels>
                    </Tab.Group>
                    <button onClick={() => setIsOpen(false)} className={buttonClass + " mt-2"}>Cancel</button>
                </Dialog.Panel>
            </div>
        </div>
    </Dialog>;
}

const ClientSettingsButton = ({ clientSettingsCallbackRef }: {
    clientSettingsCallbackRef: { current: (bool) => void }
}) => {
    return <button className={buttonClass} onClick={
        (e) => {
            clientSettingsCallbackRef.current(true);
        }
    }>
        Client Settings
    </button>
}

export { ClientSettingsDialog, ClientSettingsButton }