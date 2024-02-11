import { Player } from "../index"
import { useEffect, useReducer } from "preact/hooks"

export function getUserRestrictions(id: string) {
    const data = JSON.parse(localStorage.restrictedUsers ?? "{}");
    return data[id] ?? [];
}

export function setUserRestrictions(id: string, dd: string[]) {
    const data = JSON.parse(localStorage.restrictedUsers ?? "{}");
    data[id] = dd;
    localStorage.restrictedUsers = JSON.stringify(data);
}
const PeoplePopup = ({ element, inputRef, player, dmingUser }: {
    element: { current: HTMLElement },
    inputRef: { current: HTMLInputElement },
    player: Player,
    dmingUser: any
}) => {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const location = element.current.getBoundingClientRect();
    console.log(element.current)
    function actOn(type) {
        return function () {
            let restrictions = getUserRestrictions(player._id);
            if (restrictions.includes(type)) {
                restrictions = restrictions.filter(z => z !== type)
            } else {
                restrictions.push(type);
            }
            setUserRestrictions(player._id, restrictions)
            forceUpdate();
        }
    }
    return <div style={{
        top: location.top + 10,
        left: location.left - 7,
        backgroundColor: element.current.firstElementChild.style.backgroundColor
    }} className="absolute text-white rounded-sm w-max">
        <button onClick={() => {
            inputRef.current.value += "@" + player._id + " ";
        }}>Mention</button>
        <br></br>
        <button onClick={() => {
            dmingUser[1](dmingUser[0] == player._id ? "" : player._id);
        }}>{dmingUser[0] == player._id ? "End direct message" : "Direct message"}</button>
        <br></br>
        <button onClick={actOn("notes")}>
            {getUserRestrictions(player._id).includes("notes") ? "Unmute notes" : "Mute notes"}
        </button>
        <br></br>
        <button onClick={actOn("chat")}>
            {getUserRestrictions(player._id).includes("chat") ? "Unmute chat" : "Mute chat"}
        </button>
        <br></br>
        <button onClick={() => {
            let restrictions = getUserRestrictions(player._id);
            if (restrictions.includes("chat") && restrictions.includes("notes")) {
                restrictions = restrictions.filter(z => z !== "notes" && z !== "chat");
            } else {
                restrictions = restrictions.filter(z => z !== "notes" && z !== "chat");
                restrictions.push("notes");
                restrictions.push("chat");
            }
            setUserRestrictions(player._id, restrictions);
            forceUpdate();
        }}>
            {getUserRestrictions(player._id).includes("chat") && getUserRestrictions(player._id).includes("notes") ? "Unmute completely" : "Mute completely"}
        </button>
        <br></br>
        <button onClick={actOn("cursor")}>
            {getUserRestrictions(player._id).includes("cursor") ? "Unhide cursor" : "Hide cursor"}
        </button>
        <br></br>
        <hr></hr>
        {
            [
                "Kickban",
                "Site Ban",
                "Set Color",
                "Set Name"
            ].map(z => {
                return <div className="mt-1">
                    {z}
                </div>
            })
        }
    </div>
}

export default PeoplePopup;