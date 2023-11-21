import { Time } from "./classes/Time.js"
import { callAPI } from "./telegramApi.js"
import { UID, createListWithDuration, shuffle } from "./utils.js"

export const callback_values = {
	edit_sent_list: UID(),
	shuffle_list: UID(),
	split_list: UID(),
} as const
export const callback_values_reversed = Object.fromEntries(
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
		[
			{
				text: "חלק לסבבים",
				callback_data: callback_values.split_list,
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
		let names: string[], times: Time[]
		try {
			;({ names, times } = extractDataFromMessage(
				callbackQuery.message.text!
			))
		} catch (error) {
			console.error(error)
			return
		}
		shuffle(names)
		const shuffled = times.map((time, i) => `${time} ${names[i]}`)

		callAPI("editMessageText", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			text: shuffled.join("\n"),
			reply_markup: nameListReplyMarkup,
		})
	} else if (action === "split_list") {
		let names: string[], times: Time[]
		try {
			;({ names, times } = extractDataFromMessage(
				callbackQuery.message.text!
			))
		} catch (error) {
			console.error(error)
			return
		}
		const guardTime = times[1].toSeconds() - times[0].toSeconds()

		callAPI("editMessageText", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			text: createListWithDuration(
				times[0],
				Math.floor(guardTime / 2),
				names.concat(names)
			),
			reply_markup: nameListReplyMarkup,
		})
	}
}

function extractDataFromMessage(msgText: string) {
	const names: string[] = []
	const times: Time[] = []
	msgText.split("\n").forEach((line) => {
		const time = Time.parseTime(line.slice(0, 5))
		if (!time) throw new Error("Time could not be extracted from message")
		times.push(time)
		names.push(line.slice(6))
	})
	return { names, times }
}
