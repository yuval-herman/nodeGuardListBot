import { readFileSync } from "fs"
import { getOptionParsers } from "./parsers"
import { callAPI, getUpdates } from "./telegramApi"
import { Configs, UserData } from "./types"
import { cleanUser, createList, log_update } from "./utils"
export const configs = {} as Configs
try {
	Object.assign(configs, JSON.parse(readFileSync("botConfigs.json", "utf-8")))
	if (!("token" in configs)) {
		throw Error("No token in bot configs file (botConfigs.json)")
	}
} catch (error) {
	if (error instanceof Error && "code" in error && error.code === "ENOENT") {
		error.message = "bot configs file does not exist (botConfigs.json)"
	}
	throw error
}

const usersData = new Map<number, UserData>()

;(async () => {
	console.log(await callAPI("getMe"))
	while (true) {
		for (const update of await getUpdates()) {
			log_update(update)
			const message = update.message
			if (!message || !message.from || !message.text) continue
			let user = usersData.get(message.from.id)
			if (!user) {
				const newUserState = "start"
				user = {
					id: message.from.id,
					state: {
						currentState: newUserState,
						optionsParsers: getOptionParsers(newUserState),
					},
				}
				usersData.set(user.id, user)
			}
			for (const parser of user.state.optionsParsers) {
				if (parser(message, user)) break
			}
			if (user.startTime && user.endTime && user.nameList) {
				callAPI("sendMessage", {
					chat_id: user.id,
					text: createList(user.startTime, user.endTime, user.nameList),
				})
				cleanUser(user)
			}
		}
	}
})()
