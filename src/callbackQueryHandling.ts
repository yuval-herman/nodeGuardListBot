import { usersData } from "./app.js"
import { callAPI } from "./telegramApi.js"
import { GenericState } from "./user-states/Generic.js"
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
		!(user.state instanceof GenericState) ||
		!user.state.savedListData
	) {
		callAPI("answerCallbackQuery", {
			callback_query_id: callbackQuery.id,
			text: "קרתה תקלה!\nאם ההודעה ששלחת ישנה אני כבר לא יכול לערוך אותה...",
		})
		return
	}

	const action: keyof typeof callback_values =
		callback_values_reversed[callbackQuery.data]

	const { originalNameList, startTime, modifiedNameList } =
		user.state.savedListData
	const endTimeDuration =
		"endTime" in user.state.savedListData
			? user.state.savedListData.endTime
			: user.state.savedListData.guardDuration
	if (action === "edit_sent_list") {
		callAPI("editMessageReplyMarkup", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			reply_markup: nameListReplyMarkup,
		})
	} else if (action === "shuffle_list") {
		const nameList = modifiedNameList ?? originalNameList
		shuffle(nameList)
		callAPI("editMessageText", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			text: createList(startTime, endTimeDuration, nameList).timedListString,
			reply_markup: nameListReplyMarkup,
		})
	} else if (action === "add_list_round") {
		user.state.savedListData.modifiedNameList = (
			user.state.savedListData.modifiedNameList ?? originalNameList
		).concat(originalNameList)
		callAPI("editMessageText", {
			chat_id: callbackQuery.from.id,
			message_id: callbackQuery.message.message_id,
			text: createList(
				startTime,
				endTimeDuration,
				user.state.savedListData.modifiedNameList
			).timedListString,
			reply_markup: nameListReplyMarkup,
		})
	}
}
