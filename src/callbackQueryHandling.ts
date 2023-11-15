import { callAPI } from "./telegramApi.js"
import { shuffle } from "./utils.js"

export const callback_values = { edit_sent_list: 0, shuffle_list: 1 } as const
const callback_values_reversed = Object.fromEntries(
	Object.entries(callback_values).map((v) => v.reverse())
)

export function handleCallbackQuery(callbackQuery: CallbackQuery) {
	callAPI("answerCallbackQuery", { callback_query_id: callbackQuery.id })
	if (!callbackQuery.data || !callbackQuery.message) return
	const action: keyof typeof callback_values =
		callback_values_reversed[callbackQuery.data]
	if (action === "edit_sent_list") {
		callAPI("editMessageText", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			text: callbackQuery.message.text,
			reply_markup: {
				inline_keyboard: [
					[{ text: "ערבב", callback_data: callback_values.shuffle_list }],
				],
			},
		})
	} else if (action === "shuffle_list") {
		const original_names: string[] = []
		const original_times: string[] = []
		callbackQuery.message.text?.split("\n").forEach((line) => {
			original_times.push(line.slice(0, 6))
			original_names.push(line.slice(6))
		})
		shuffle(original_names)
		const shuffled = original_times.map((time, i) => time + original_names[i])

		callAPI("editMessageText", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			text: shuffled.join("\n"),
			reply_markup: {
				inline_keyboard: [
					[{ text: "ערבב", callback_data: callback_values.shuffle_list }],
				],
			},
		})
	}
}
