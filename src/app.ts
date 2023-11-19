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
	fileLog,
} from "./utils"
import { CONSTANTS } from "./constants.js"
import { verifyAllData } from "./utils.js"

export const configs = {} as Configs
try {
	Object.assign(
		configs,
		JSON.parse(readFileSync(CONSTANTS.BOT_CONFIGS_FILE, "utf-8"))
	)

	if (!("token" in configs)) {
		throw Error("No token in bot configs file")
	}
} catch (error) {
	if (error instanceof Error && "code" in error && error.code === "ENOENT") {
		error.message = "bot configs file does not exist"
	}
	throw error
}
export const TOKEN =
	process.env.NODE_ENV !== "production" ? configs.testingToken! : configs.token

export const usersData = new Map<number, UserData>()

function sendGuardList(user: CompleteUserData): string {
	const timedNameList = user.endTime
		? createList(user.startTime, user.endTime, user.nameList)
		: createListWithDuration(
				user.startTime,
				user.guardDuration!,
				user.nameList
		  )
	callAPI("sendMessage", {
		chat_id: user.id,
		text: timedNameList,
		reply_markup: {
			inline_keyboard: [
				[{ text: "ערוך", callback_data: callback_values.edit_sent_list }],
			],
		},
	})
	return timedNameList
}

;(async () => {
	console.log(await callAPI("getMe"))
	while (true) {
		for (const update of await getUpdates()) {
			await log_update(update)
			if (update.callback_query) {
				handleCallbackQuery(update.callback_query)
				continue
			}
			const message = update.message
			if (!message || !message.from || !message.text) continue
			let user = usersData.get(message.from.id)
			if (!user) {
				user = {
					id: message.from.id,
					state: {
						optionsParsers: getOptionParsers(),
					},
					savedData: {},
				}
				usersData.set(user.id, user)
			}
			for (const parser of user.state.optionsParsers) {
				if (await parser(message, user)) break
			}
			fileLog("verbose", "USER_STATE", JSON.stringify(user))
			if (verifyAllData(user)) {
				user.savedData.lastList = sendGuardList(user)
				cleanUser(user)
			}
			user.state.optionsParsers = getOptionParsers(user)
		}
	}
})()
