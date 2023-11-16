import { readFileSync } from "fs"
import {
	callback_values,
	handleCallbackQuery,
} from "./callbackQueryHandling.js"
import { getOptionParsers } from "./parsers"
import { callAPI, getUpdates } from "./telegramApi"
import { CompleteUserData, Configs, UserData } from "./types"
import {
	cleanUser,
	createList,
	createListWithDuration,
	log_update,
} from "./utils"
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

function sendGuardList(user: CompleteUserData) {
	callAPI("sendMessage", {
		chat_id: user.id,
		text: user.endTime
				? createList(user.startTime, user.endTime, user.nameList)
				: createListWithDuration(
						user.startTime,
					user.guardDuration!,
						user.nameList
				  ),
		reply_markup: {
			inline_keyboard: [
				[{ text: "ערוך", callback_data: callback_values.edit_sent_list }],
			],
		},
	})
}

function verifyAllData(user: UserData): user is CompleteUserData {
	return Boolean(
		user.startTime && (user.endTime || user.guardDuration) && user.nameList
	)
}

;(async () => {
	console.log(await callAPI("getMe"))
	while (true) {
		for (const update of await getUpdates()) {
			log_update(update)
			if (update.callback_query) {
				handleCallbackQuery(update.callback_query)
				continue
			}
			const message = update.message
			if (!message || !message.from || !message.text) continue
			let user = usersData.get(message.from.id)
			if (!user) {
				const newUserState = "start"
				user = {
					id: message.from.id,
					state: {
						optionsParsers: getOptionParsers(),
					},
				}
				usersData.set(user.id, user)
			}
			for (const parser of user.state.optionsParsers) {
				if (await parser(message, user)) break
			}

			if (verifyAllData(user)) {
				sendGuardList(user)
				cleanUser(user)
			}
			user.state.optionsParsers = getOptionParsers(user)
		}
	}
})()
