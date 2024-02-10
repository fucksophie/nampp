import { buttonClass } from "../Status"

const PlayAloneButton = ({ sendJsonMessage }: {
    sendJsonMessage: any
}) => {
    return <button className={buttonClass} onClick={
        (e) => {
            sendJsonMessage([{
                m: "ch",
                _id: "Room" + Math.floor(Math.random() * 1000000000000),
                set: {
                    visible: false
                }
            }])
        }
    }>
        Play Alone
    </button>
}

export { PlayAloneButton }