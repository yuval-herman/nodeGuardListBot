import { usersData } from "./app.js"
import { callAPI } from "./telegramApi.js"
import { UID, createList, shuffle } from "./utils.js"

export const callback_values = {
	edit_sent_list: UID(),
	shuffle_list: UID(),
	add_list_round: UID(),
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
				text: "הוסף סבב",
				callback_data: callback_values.add_list_round,
			},
		],
	],
}

export function handleCallbackQuery(callbackQuery: CallbackQuery) {
	const user = usersData.get(callbackQuery.from.id)
	if (
		!callbackQuery.data ||
		!callbackQuery.message ||
		!user ||
		!user.savedListData
	) {
		callAPI("answerCallbackQuery", {
			callback_query_id: callbackQuery.id,
			text: "קרתה תקלה!\nאם ההודעה ששלחת ישנה אני כבר לא יכול לערוך אותה...",
		})
		return
	}

	const action: keyof typeof callback_values =
		callback_values_reversed[callbackQuery.data]
	if (action === "edit_sent_list") {
		callAPI("editMessageReplyMarkup", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			reply_markup: nameListReplyMarkup,
		})
	} else if (action === "shuffle_list") {
		let list: string
		const { originalNameList, startTime, modifiedNameList } =
			user.savedListData
		const nameList = modifiedNameList ?? originalNameList
		shuffle(nameList)
		if ("endTime" in user.savedListData)
			list = createList(startTime, user.savedListData.endTime, nameList)
		else
			list = createList(
				startTime,
				user.savedListData.guardDuration,
				nameList
			)

		callAPI("editMessageText", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			text: list,
			reply_markup: nameListReplyMarkup,
		})
	} else if (action === "add_list_round") {
		const { originalNameList, startTime } = user.savedListData
		let list: string
		user.savedListData.modifiedNameList = (
			user.savedListData.modifiedNameList ?? originalNameList
		).concat(originalNameList)
		if ("endTime" in user.savedListData) {
			list = createList(
				startTime,
				user.savedListData.endTime,
				user.savedListData.modifiedNameList
			)
		} else {
			list = createList(
				startTime,
				user.savedListData.guardDuration,
				user.savedListData.modifiedNameList
			)
		}
		callAPI("editMessageText", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			text: list,
			reply_markup: nameListReplyMarkup,
		})
	}
}
