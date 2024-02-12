import { Player, Channel } from "../index"

const Crown = ({ currentChannel, sendJsonMessage, meRef }: {
    currentChannel: Channel,
    sendJsonMessage: any,
    meRef: { current: Player }
}) => {
    if (currentChannel?.crown) {
        if (!currentChannel?.crown.participantId) {
            let time = Math.floor((currentChannel?.crown.time - Date.now()) / 1000 + 15);

            return <span className="z-50 absolute flex align-center items-center text-white" style={{
                left: currentChannel?.crown.endPos.x + "%",
                top: currentChannel?.crown.endPos.y + "%",
            }}
                onClick={(e) => {
                    if (time < 0 || meRef.current.permissions.chownAnywhere) {
                        sendJsonMessage([{
                            m: "chown",
                            id: meRef.current._id
                        }])
                    }
                }}>
                <img src="https://multiplayerpiano.net/crown.png"></img>
                <span>{time < 0 ? "" : time + "s"}</span>
            </span>
        }
    }
    return;
}

export default Crown;