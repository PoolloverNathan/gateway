import { wss } from "..";
import { sendError, sendMessage } from "../modules/messageSending";
import { generateID } from "../utils/ids";
import { ChatClient, Payload, Role } from "../utils/types";

export function accountInitialisation(client: ChatClient, d: any) {
    if (d.anon) {
        if (!d.username || (d.username as String).length > 30) throw "Invalid username";
        try {
            wss.clients.forEach((cc) => {
                const c = cc as ChatClient;
                if (c.username === d.username) {
                    sendError(client, 1, "Username already taken");
                    throw "Username already taken";
                }
            });
        } catch {
            return;
        }
        client.username = d.username;
        client.roles = Role.Guest;
        client.id = Math.floor(Math.random() * 1000000).toString();
        client.initialised = true;
        client.send(
            JSON.stringify({
                op: 1,
                d: {
                    id: client.id,
                    username: client.username,
                    roles: client.roles
                }
            })
        );
        sendMessage({
            userInfo: {
                username: "System",
                roles: Role.System,
                id: "1"
            },
            content: `${client.username} *(guest)* has joined the chat. Say hi!\nCurrently ${
                wss.clients.size
            } user${wss.clients.size === 1 ? " is" : "s are"} online.`,
            id: generateID()
        });
    }
}
