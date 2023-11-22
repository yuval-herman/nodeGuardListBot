import { readFile, writeFile } from "fs/promises"
import { Time } from "./classes/Time.js"
import { UserData } from "./classes/User.js"
import { CONSTANTS } from "./constants.js"
import { callAPI } from "./telegramApi.js"
import { OptionsParser } from "./types"

async function sendCurrentState(user: UserData) {
	if (user.isNameListDataComplete()) return
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

export const startParser: OptionsParser = async (msg, user, dryRun) => {
	if (msg.text !== "/start") return false
	if (!dryRun) {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "שלום!\nאני בוט פשוט שיודע לעזור ברשימות שמירה.\nשלח לי רשימת שמות ושעת התחלה וסוף ואני יעשה את השאר.",
		})
	}
	return true
}

export const clearParser: OptionsParser = async (msg, user, dryRun) => {
	if (msg.text !== "/clear") return false
	if (!dryRun) {
		const result = await callAPI("sendMessage", {
			chat_id: user.id,
			text: "נתונים נמחקים...",
		})
		user.cleanNameListData()
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
export const broadcastParser: OptionsParser = async (msg, user, dryRun) => {
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
			.map(
				(res) =>
					res.status === "fulfilled" &&
					res.value.ok &&
					res.value.result.chat.id
			)
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

export const smartParser: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text) return false
	const endMessage =
		"\nאתה יכול לשלוח /help כדי לראות את הפורמט הנכון לשליחת הודעות.\nאם זה לא מה שהתכוונת, שלח לי /clear כדי לנקות את הנתונים"
	const timeArray = Time.parseTimeGlobal(msg.text)
	if (timeArray.length === 2) {
		user.startTime = timeArray[0]
		user.endTime = timeArray[1]
		await sendMessage(
			`קבעתי שהשמירה תתחיל בשעה ${user.startTime} ותסתיים בשעה ${user.endTime}.${endMessage} ותרשום לי את שעת תחילת השמירה ושעת הסיום בשתי הודעות נפרדות.`
		)
		return true
	}
	if (timeArray.length === 1) {
		if (msg.text.includes("התחלה")) {
			user.startTime = timeArray[0]
			await sendMessage(
				`קבעתי שהשמירה תתחיל בשעה ${user.startTime}.${endMessage} ותתחיל מחדש.`
			)
			return true
		} else if (["סיום", "סוף"].some((str) => msg.text?.includes(str))) {
			user.endTime = timeArray[0]
			await sendMessage(
				`קבעתי שהשמירה תסתיים בשעה ${user.endTime}.${endMessage} ותתחיל מחדש.`
			)
			return true
		}
	}
	const words = msg.text.split(" ")
	if (words.length >= 4) {
		user.nameList = words
		await sendMessage(
			`הגדרתי את רשימת השמות כך:\n${user.nameList.join(
				"\n"
			)}.${endMessage} ותתחיל מחדש.`
		)
		return true
	}

	return false
	async function sendMessage(text: string) {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "ההודעה ששלחת אינה רשומה בפורמט שאני מבין.",
		})
		await callAPI("sendMessage", { chat_id: user.id, text })
	}
}

export const unknownMessageParser: OptionsParser = async (
	msg,
	user,
	dryRun
) => {
	if (await endTimeParser(msg, user, true)) {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `נראה שניסית לשלוח שוב שעת שמירה למרות שאצלי כבר שמור שהשמירה תתחיל ב-${user.startTime!} ו${
				user.endTime
					? `תגמר ב-${user.endTime}`
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

export const startTimeParser: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text) return false
	const time = Time.parseTime(msg.text)
	if (!time) return false
	if (!dryRun) {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `השמירה תתחיל ב-${time}`,
		})
		user.startTime = time
		sendCurrentState(user)
	}
	return true
}

export const durationParser: OptionsParser = async (msg, user, dryRun) => {
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

export const endTimeParser: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text) return false
	const time = Time.parseTime(msg.text)
	if (!time) return false
	if (!dryRun) {
		if (user.startTime?.equals(time)) {
			await callAPI("sendMessage", {
				chat_id: user.id,
				text: `השמירה תסתיים ב-${time} ביום למחרת`,
			})
		} else {
			await callAPI("sendMessage", {
				chat_id: user.id,
				text: `השמירה תסתיים ב-${time}`,
			})
		}
		user.endTime = time
		sendCurrentState(user)
	}
	return true
}

export const nameListParser: OptionsParser = async (msg, user, dryRun) => {
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
