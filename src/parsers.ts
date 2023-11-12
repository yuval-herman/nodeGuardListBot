import { timeFormat } from "./utils"
import { callAPI } from "./telegramApi.js"
import { OptionsParser, Time, UserCurrentStates } from "./types"

export const timeRegex = /(\d{1,2}):(\d{1,2})/

export function getOptionParsers(state: UserCurrentStates): OptionsParser[] {
	if (state === "start") {
		return [startParser, startTimeParser, endTimeParser, nameListParser]
	}
	return []
}
export const startParser: OptionsParser = (msg, user) => {
	if (msg.text === "/start") {
		callAPI("sendMessage", {
			chat_id: user.id,
			text: "שלום!\nאני בוט פשוט שיודע לעזור ברשימות שמירה.\nשלח לי רשימת שמות ושעת התחלה וסוף ואני יעשה את השאר.",
		})
		return true
	}
	return false
}
export const startTimeParser: OptionsParser = (msg, user) => {
	if (!msg.text || user.startTime) return false
	const regResults = timeRegex.exec(msg.text)
	if (!regResults) return false
	const time: Time = [+regResults[1], +regResults[2]]
	callAPI("sendMessage", {
		chat_id: user.id,
		text: `השמירה תתחיל ב-${timeFormat(time)}`,
	})
	user.startTime = time
	return true
}
export const endTimeParser: OptionsParser = (msg, user) => {
	if (!msg.text || user.endTime) return false
	const regResults = timeRegex.exec(msg.text)
	if (!regResults) return false
	const time: Time = [+regResults[1], +regResults[2]]
	callAPI("sendMessage", {
		chat_id: user.id,
		text: `השמירה תסתיים ב-${timeFormat(time)}`,
	})
	user.endTime = time
	return true
}

export const nameListParser: OptionsParser = (msg, user) => {
	if (!msg.text || !msg.text.includes("\n")) return false
	const nameList = msg.text.split("\n")
	callAPI("sendMessage", {
		chat_id: user.id,
		text: `קיבלתי את רשימת השמות! ישנם ${nameList.length} שומרים.`,
	})
	user.nameList = nameList
	if (!user.startTime) {
		callAPI("sendMessage", {
			chat_id: user.id,
			text: `עוד לא שלחת לי את שעת ההתחלה של השמירה...`,
		})
	} else if (!user.endTime) {
		callAPI("sendMessage", {
			chat_id: user.id,
			text: `עוד לא שלחת לי את שעת הסוף של השמירה...`,
		})
	}
	return true
}
