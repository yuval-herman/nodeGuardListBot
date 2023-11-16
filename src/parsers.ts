import { callAPI } from "./telegramApi.js"
import { OptionsParser, Time, UserData } from "./types"
import { timeFormat } from "./utils"

export const timeRegex = /(\d{1,2}):(\d{1,2})/

export function getOptionParsers(user?: UserData): OptionsParser[] {
	const parsers: OptionsParser[] = [helpParser, unknownMessageParser]
	if (!user) parsers.unshift(startParser)
	if (!user?.startTime) parsers.unshift(startTimeParser)
	if (!user?.endTime && !user?.guardDuration)
		parsers.unshift(endTimeParser, durationParser)
	if (!user?.nameList) parsers.unshift(nameListParser)
	return parsers
}
const startParser: OptionsParser = async (msg, user) => {
	if (msg.text === "/start") {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "שלום!\nאני בוט פשוט שיודע לעזור ברשימות שמירה.\nשלח לי רשימת שמות ושעת התחלה וסוף ואני יעשה את השאר.",
		})
		return true
	}
	return false
}
const helpParser: OptionsParser = async (msg, user) => {
	if (msg.text === "/help") {
		await callAPI("sendMessage", {
			parse_mode: "HTML",
			chat_id: user.id,
			text: `הבוט יודע להבין הודעות משלושה סוגים:
1. <b>רשימת שמות</b> - מזוהה על ידי הודעה עם יותר משורה אחת
2. <b>שעה</b> - מזוהה על ידי שני מספרים המופרדים בנקודותים (12:00, 1:00, 0:0 וכו')
3. <b>זמן בדקות</b> - מזוהה על ידי מספר

כדי להכין רשימה הבוט חייב לפחות שלוש פיסות מידע:
1. שעת התחלת השמירה
2. רשימת השמות
3. או זמן שמירה בדקות או שעת סוף השמירה
אין משמעות לסדר בו נשלחות ההודעות, ניתן לשלוח קודם את השעות ואח"כ את רשימת השמות או להפך.`,
		})
		return true
	}
	return false
}
const startTimeParser: OptionsParser = async (msg, user) => {
	if (!msg.text) return false
	const regResults = timeRegex.exec(msg.text)
	if (!regResults) return false
	const time: Time = [+regResults[1], +regResults[2]]
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: `השמירה תתחיל ב-${timeFormat(time)}`,
	})
	user.startTime = time
	return true
}
const durationParser: OptionsParser = async (msg, user) => {
	if (!msg.text || !msg.text.match(/^\d+$/)) return false
	const minutes = parseInt(msg.text)
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: `זמן השמירה נקבע ל-${minutes} דקות`,
	})
	user.guardDuration = minutes * 60
	return true
}
const endTimeParser: OptionsParser = async (msg, user) => {
	if (!msg.text) return false
	const regResults = timeRegex.exec(msg.text)
	if (!regResults) return false
	const time: Time = [+regResults[1], +regResults[2]]
	if (user.startTime?.every((v, i) => v === time[i])) {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `כבר שלחת לי את שעת ההתחלה, עכשיו שלח לי את שעת הסיום`,
		})
		return true
	}
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: `השמירה תסתיים ב-${timeFormat(time)}`,
	})
	user.endTime = time
	return true
}

const nameListParser: OptionsParser = async (msg, user) => {
	if (!msg.text || !msg.text.includes("\n")) return false
	const nameList = msg.text.split("\n")
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: `קיבלתי את רשימת השמות! ישנם ${nameList.length} שומרים.`,
	})
	user.nameList = nameList
	return true
}

const unknownMessageParser: OptionsParser = async (msg, user) => {
	await callAPI("sendMessage", {
		parse_mode: "HTML",
		chat_id: user.id,
		text: `שיחה איתי בדרך כלל תראה כך:
<u>אתה:</u> 11:00
<b>אני:</b> השמירה תתחיל ב-11:00
<u>אתה:</u> 19:00
<b>אני:</b> השמירה תסתיים ב-19:00
<u>אתה:</u> פלוני
אלמוני
שמואל
דוד
<b>אני:</b> קיבלתי את רשימת השמות! ישנם 4 שומרים.
<b>אני:</b> 11:00 פלוני
13:00 אלמוני
15:00 שמואל
17:00 דוד

בנוסף ניתן לשלוח גם זמן שמירה בדקות על מנת לשמור על שמירות עגולות, לדוגמא:
<u>אתה:</u> 11:00
<b>אני:</b> השמירה תתחיל ב-11:00
<u>אתה:</u> 30
<b>אני:</b> זמן השמירה נקבע ל-30 דקות
<u>אתה:</u> פלוני
אלמוני
שמואל
דוד
<b>אני:</b> קיבלתי את רשימת השמות! ישנם 4 שומרים.
<b>אני:</b> 11:00 פלוני
13:00 אלמוני
15:00 שמואל
17:00 דוד

להוראות יותר מדוייקות שלח /help
`,
	})

	return true
}
