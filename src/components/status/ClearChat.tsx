import { buttonClass } from "../Status"

const ClearChatButton = ({ sendJsonMessage }: {
    sendJsonMessage: any
}) => {
    return <button className={buttonClass} onClick={
        (e) => {
            sendJsonMessage([{
                m: "clearchat",
            }])
        }
    }>
        Clear chat
    </button>
}

export { ClearChatButton }