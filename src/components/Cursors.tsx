import { h, Fragment } from "preact";
import {Player} from "../index"
import {renderPerson} from "./People"
import {Collection} from "@discordjs/collection"
import { useEffect } from "preact/hooks"
import {getSetting} from "./status/ClientSettings"

const Cursors = ({peopleRef, meRef, sendJsonMessage}: {
    peopleRef: {current: Collection<string, Player>},
    meRef: {current: Player},
    sendJsonMessage: any
}) => {
    let x = 0;
    let y = 0;
    function moveMouse(e) {
        x = e.clientX/window.innerWidth*100;
        y = e.clientY/window.innerHeight*100;
    }
    useEffect(() => {
        window.addEventListener("mouseover", moveMouse);
        
        return () => window.removeEventListener("mouseover", moveMouse);
    }, []);
    useEffect(() => {
        let intrvl = setInterval(() => {
            sendJsonMessage([{
                m: "m",
                x,y
            }])
        }, 40)
        return () => clearInterval(intrvl);
    }, []);
    return <>
    
        {getSetting("hideAllCursors", false) ? "" : peopleRef.current.map(z => <span className="absolute transition-all text-xs" 
            style={getSetting("useSmoothCursors", false) ? {
                transform: `translate3d(${z.x}vw, ${z.y}vh, 0px)`
            } : {top: z.y+"%", left: z.x+"%"}}
            >
            <img className="absolute bottom-7" src="https://multiplayerpiano.net/cursor.png"></img>
            <span>
                {
                    meRef.current._id == z._id ? undefined : 
                    getSetting("hideAllBots", false)&&z?.tag?.text=="BOT" ? undefined : renderPerson(z, meRef)
                }
            </span>
        </span>)}
    </>
}

export default Cursors;