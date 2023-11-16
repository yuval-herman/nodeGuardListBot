import { callAPI } from "./telegramApi.js"
import { UID, shuffle } from "./utils.js"

export const callback_values = {
	edit_sent_list: UID(),
	shuffle_list: UID(),
} as const
const callback_values_reversed = Object.fromEntries(
	Object.entries(callback_values).map((v) => v.reverse())
)

const nameListReplyMarkup = {
	inline_keyboard: [
		[
			{
				text: "ערבוב",
				callback_data: callback_values.shuffle_list,
			},
		],
	],
}

export function handleCallbackQuery(callbackQuery: CallbackQuery) {
	callAPI("answerCallbackQuery", { callback_query_id: callbackQuery.id })
	if (!callbackQuery.data || !callbackQuery.message) return
	const action: keyof typeof callback_values =
		callback_values_reversed[callbackQuery.data]
	if (action === "edit_sent_list") {
		callAPI("editMessageReplyMarkup", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			reply_markup: nameListReplyMarkup,
		})
	} else if (action === "shuffle_list") {
		const { names, times } = extractDataFromMessage(
			callbackQuery.message.text!
		)
		shuffle(names)
		const shuffled = times.map((time, i) => time + names[i])

		callAPI("editMessageText", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			text: shuffled.join("\n"),
			reply_markup: nameListReplyMarkup,
		})
	}
}

function extractDataFromMessage(msgText: string) {
	const names: string[] = []
	const times: string[] = []
	msgText.split("\n").forEach((line) => {
		times.push(line.slice(0, 6))
		names.push(line.slice(6))
	})
	return { names, times }
}
