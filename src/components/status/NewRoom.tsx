import { Dialog, Switch } from '@headlessui/react'
import { useState, useRef } from "preact/hooks"
import { buttonClass } from "../Status"

const NewRoomDialog = ({ newRoomCallbackRef, sendJsonMessage }: {
    newRoomCallbackRef: { current: (bool) => void },
    sendJsonMessage: any
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [visibleEnabled, setVisibleEnabled] = useState(true);
    const inputRef = useRef<HTMLInputElement>();

    newRoomCallbackRef.current = (e) => {
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
                    <Dialog.Title className="text-2xl">Create a new room</Dialog.Title>

                    <input ref={inputRef} placeholder="room name" className="bg-neutral-800 text-white rounded-md mb-2"></input>
                    <br></br>
                    <Switch
                        checked={visibleEnabled}
                        onChange={setVisibleEnabled}
                        className={`${visibleEnabled ? 'bg-green-600' : 'bg-red-500'
                            } relative inline-flex h-6 w-11 text-white items-center rounded-full`}
                    >
                        <span
                            className={`${visibleEnabled ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-neutral-800 transition`}
                        />
                    </Switch>
                    <span>Visible (open to everyone)</span>
                    <button onClick={
                        () => {
                            setIsOpen(false)
                            sendJsonMessage([{
                                m: "ch",
                                _id: inputRef?.current?.value || "lobby",
                                set: {
                                    visible: visibleEnabled
                                }
                            }])
                        }
                    } className={buttonClass + " mb-1"}>Create room</button>
                    <button onClick={() => setIsOpen(false)} className={buttonClass}>Cancel</button>

                </Dialog.Panel>
            </div>
        </div>
    </Dialog>;
}

const NewRoomButton = ({ newRoomCallbackRef }: {
    newRoomCallbackRef: { current: (bool) => void }
}) => {
    return <button className={buttonClass} onClick={
        (e) => {
            newRoomCallbackRef.current(true);
        }
    }>
        New Room...
    </button>
}

export { NewRoomDialog, NewRoomButton }