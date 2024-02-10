import { buttonClass } from "../Status"
import { Player } from "../../index"

const VanishButton = ({ sendJsonMessage, meRef }: {
    sendJsonMessage: any,
    meRef: { current: Player }
}) => {
    return <button className={buttonClass} onClick={
        (e) => {
            sendJsonMessage([{
                m: "v",
                vanish: !meRef.current.vanished
            }])
        }
    }>
        Vanish
    </button>
}

export { VanishButton }