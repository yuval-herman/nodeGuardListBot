import { readFile, writeFile } from "fs/promises"
import { callAPI } from "./telegramApi.js"
import { OptionsParser, Time, UserData } from "./types"
import { cleanUser, timeFormat, verifyAllData } from "./utils"
import { CONSTANTS } from "./constants.js"
import { configs } from "./app.js"

export const timeRegex = /^(\d{1,2}):(\d{1,2})$/

export function getOptionParsers(user?: UserData): OptionsParser[] {
	const parsers: OptionsParser[] = [startParser]
	if (!user?.startTime) parsers.push(startTimeParser)
	if (!user?.endTime && !user?.guardDuration)
		parsers.push(endTimeParser, durationParser)
	if (!user?.nameList) parsers.push(nameListParser)
	if (user?.id === configs.adminId) parsers.push(broadcastParser)
	return parsers.concat(helpParser, clearParser, unknownMessageParser) // add default parsers
}

async function sendCurrentState(user: UserData) {
	if (verifyAllData(user)) return
	const builder = ['רשמ"צ להכנת רשימת שמירה:']
	builder.push((user.startTime ? "✅" : "❌") + " שעת התחלה")
	builder.push(
		(user.endTime || user.guardDuration ? "✅" : "❌") +
			" שעת סוף או זמן בדקות"
	)
	builder.push((user.nameList ? "✅" : "❌") + " רשימת שמות")
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: builder.join("\n"),
	})
}

const startParser: OptionsParser = async (msg, user, dryRun) => {
	if (msg.text !== "/start") return false
	if (!dryRun) {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "שלום!\nאני בוט פשוט שיודע לעזור ברשימות שמירה.\nשלח לי רשימת שמות ושעת התחלה וסוף ואני יעשה את השאר.",
		})
	}
	return true
}

const helpParser: OptionsParser = async (msg, user, dryRun) => {
	if (msg.text !== "/help") return false
	if (!dryRun) {
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
	}
	return true
}

const clearParser: OptionsParser = async (msg, user, dryRun) => {
	if (msg.text !== "/clear") return false
	if (!dryRun) {
		const result = await callAPI("sendMessage", {
			chat_id: user.id,
			text: "נתונים נמחקים...",
		})
		cleanUser(user)
		setTimeout(() => {
			callAPI("editMessageText", {
				chat_id: user.id,
				message_id: result.result.message_id,
				text: "נתונים נמחקו!",
			})
		}, 500)
	}
	return true
}
const broadcastParser: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text?.startsWith("/broadcast")) return false
	if (!dryRun) {
		const message = msg.text.slice(11)

		let users: User[]
		const file = await readFile(CONSTANTS.USERS_FILE, "utf-8")

		try {
			users = Object.values(JSON.parse(file))
		} catch (error) {
			await callAPI("sendMessage", {
				chat_id: user.id,
				text: "תקלה בשליחת ההודעה\n" + error,
			})
			return true
		}

		const successfulUsers = (
			await Promise.allSettled(
				users.map(async (user) =>
					callAPI("sendMessage", { chat_id: user.id, text: message })
				)
			)
		)
			.map((res) => res.status === "fulfilled" && res.value.result.chat.id)
			.filter(Boolean)

		await callAPI("sendMessage", {
			chat_id: user.id,
			text:
				"הודעה נשלחה לכל המשתמשים הבאים:\n" +
				successfulUsers
					.map((id) => users.find((user) => user.id === id))
					.map((user) => user!.username || user!.first_name),
		})
	}
	return true
}

const unknownMessageParser: OptionsParser = async (msg, user, dryRun) => {
	if (await endTimeParser(msg, user, true)) {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `נראה שניסית לשלוח שוב שעת שמירה למרות שאצלי כבר שמור שהשמירה תתחיל ב-${timeFormat(
				user.startTime!
			)} ו${
				user.endTime
					? `תגמר ב-${timeFormat(user.endTime)}`
					: `תמשך ${user.guardDuration! / 60} דקות`
			}.\nאם אלו לא הזמנים שרצית אתה יכול לשלוח /clear כדי למחוק אותם ולהתחיל מחדש.`,
		})
		return true
	} else if (await durationParser(msg, user, true)) {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `כבר שלחת לי כמה זמן תמשך השמירה (${
				user.guardDuration! / 60
			}).\nאם אלו לא הזמנים שרצית אתה יכול לשלוח /clear כדי למחוק אותם ולהתחיל מחדש.`,
		})
		return true
	} else if (await nameListParser(msg, user, true)) {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `כבר שלחת לי את רשימת השמות.\nאם זו לא הרשימה שרצית אתה יכול לשלוח /clear כדי למחוק אותה ולהתחיל מחדש.`,
		})
		return true
	}
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
	await writeFile(
		"unknownMessages.log",
		`\n${new Date().toLocaleDateString("en-IL", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})} - ${msg.text} - ${JSON.stringify(user)}`,
		{ flag: "a" }
	)
	return true
}

const startTimeParser: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text) return false
	const regResults = timeRegex.exec(msg.text)
	if (!regResults) return false
	if (!dryRun) {
		const time: Time = [+regResults[1], +regResults[2]]
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `השמירה תתחיל ב-${timeFormat(time)}`,
		})
		user.startTime = time
		sendCurrentState(user)
	}
	return true
}

const durationParser: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text || !msg.text.match(/^\d+$/)) return false
	if (!dryRun) {
		const minutes = parseInt(msg.text)
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `זמן השמירה נקבע ל-${minutes} דקות`,
		})
		user.guardDuration = minutes * 60
		sendCurrentState(user)
	}
	return true
}

const endTimeParser: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text) return false
	const regResults = timeRegex.exec(msg.text)
	if (!regResults) return false
	if (!dryRun) {
		const time: Time = [+regResults[1], +regResults[2]]
		if (user.startTime?.every((v, i) => v === time[i])) {
			await callAPI("sendMessage", {
				chat_id: user.id,
				text: `השמירה תסתיים ב-${timeFormat(time)} ביום למחרת`,
			})
			time[0] += 24
		} else {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `השמירה תסתיים ב-${timeFormat(time)}`,
		})
		}
		user.endTime = time
		sendCurrentState(user)
	}
	return true
}

const nameListParser: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text || !msg.text.includes("\n")) return false
	if (!dryRun) {
		const nameList = msg.text.split("\n")
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `קיבלתי את רשימת השמות! ישנם ${nameList.length} שומרים.`,
		})
		user.nameList = nameList
		sendCurrentState(user)
	}
	return true
}
