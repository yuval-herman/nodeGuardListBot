import { readFileSync } from "fs"
import {
	callback_values,
	handleCallbackQuery,
} from "./callbackQueryHandling.js"
import { UserData } from "./classes/User.js"
import { CONSTANTS } from "./constants.js"
import { callAPI, getUpdates } from "./telegramApi"
import { Configs } from "./types"
import { createList, fileLog, log_update } from "./utils"
import { GenericState } from "./user-states/Generic.js"

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
;(async () => {
	console.log(await callAPI("getMe"))
	if (process.env.NODE_ENV === "production") {
		if (!configs.webhookUrl) {
			throw new Error("no webhook url in config file")
		}
		callAPI("setWebhook", {
			url: configs.webhookUrl,
			secret_token: configs.token.replace(":", ""),
			drop_pending_updates: true,
		}).then(console.log)
	} else {
		callAPI("deleteWebhook").then(console.log)
	}
	const defaultCommands = [
		{
			command: "help",
			description: "מציג עזרה לשימוש בבוט",
		},
		{
			command: "clear",
			description: "ניקוי המידע השמור כעת, התחלת שיחה מחדש",
		},
	]
	await callAPI("setMyCommands", {
		commands: defaultCommands,
	})
	await callAPI("setMyCommands", {
		commands: defaultCommands.concat([
			{
				command: "broadcast",
				description: "משדר הודעה לכל המשתמשים",
			},
		]),
		scope: { type: "chat", chat_id: configs.adminId },
	})
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
				user = new UserData(message.from.id)
				usersData.set(user.id, user)
			}
			await user.answerMessage(message)
			fileLog("verbose", "USER_STATE", JSON.stringify(user))
			if (
				user.state instanceof GenericState &&
				user.state.isNameListDataComplete()
			) {
				const { timedListString, list } = createList(
					user.state.startTime!,
					user.state.endTime! || user.state.guardDuration!,
					user.state.nameList!
				)
				callAPI("sendMessage", {
					chat_id: user.id,
					text: timedListString,
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: "ערוך",
									callback_data: callback_values.edit_sent_list,
								},
							],
						],
					},
				})
				user.saveGuards(list)
				user.state.saveListData()
				user.state.cleanNameListData()
			}
		}
	}
})()
