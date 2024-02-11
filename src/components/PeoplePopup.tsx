import { Player } from "../index"

const PeoplePopup = ({ element, inputRef, player, dmingUser }: {
    element: { current: HTMLElement },
    inputRef: { current: HTMLInputElement },
    player: Player,
    dmingUser: any
}) => {
    const location = element.current.getBoundingClientRect();
    console.log(element.current)
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
        <hr></hr>
        {
            [
                "Mute Notes",
                "Mute Chat",
                "Mute Completely",
                "Hide Cursor",
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