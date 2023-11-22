import { callAPI } from "../telegramApi.js"
import { OptionsParser } from "../types.js"
import { createList, wait } from "../utils.js"
import { Time } from "./Time.js"
import { UserData } from "./User.js"

export const skipParser: OptionsParser = async (msg, user, dryRun) => {
	if (msg.text !== "/skip") return false
	if (!dryRun) {
		user.state = UserData.states.generic
		user.helpData = {}
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "שמחתי לעזור!",
		})
	}
	return true
}

export const helpParser: OptionsParser = async (msg, user, dryRun) => {
	if (msg.text !== "/help") return false
	if (!dryRun) {
		user.state = UserData.states.help
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "שלום לך!\nאני אשתדל להדריך אותך איך להשתמש בי ולמצות את כל יכולותיי!\nכדי להפסיק את השיחה, בכל מהלך השיחה תוכל לשלוח לי את הפקודה /skip",
		})
		await callAPI("sendChatAction", {
			chat_id: user.id,
			action: "typing",
		})
		await wait(800)
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "בוא נלמד בעזרת עשייה ונכין רשימת שמירה דמיונית.\nאני אלווה אותך שלב שלב.",
		})
	}
	return true
}

export const okayParser: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text) return false
	if (!dryRun) {
		user.helpData.okay = true
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "בוא ונתחיל עם הבסיס, כדי ליצור רשימת שמירה דרושים שלושה מרכיבים בסיסיים:\n1. שעת תחילת הרשימה\n2. רשימת שמות\n3. ולבסוף שעת סיום השמירה או זמן כל שמירה בנפרד",
		})
		await callAPI("sendChatAction", {
			chat_id: user.id,
			action: "typing",
		})
		await wait(1500)
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "בוא נתחיל עם שעת ההתחלה.\nשלח לי את שעת ההתחלה של הרשימה.\nאני יכול לקרוא שעות שרשומות בצורה הזו: שעות:דקות, ממש כמו שעון דיגיטלי.",
		})
	}
	return true
}

export const startHelp: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text) return false
	const time = Time.parseTime(msg.text)
	if (dryRun) return !!time
	if (time) {
		user.helpData.start = time
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `מצויין!\nעכשיו אני יודע שהשמירה תתחיל בשעה ${time}.`,
		})
		await callAPI("sendChatAction", {
			chat_id: user.id,
			action: "typing",
		})
		await wait(700)
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "עכשיו שלח לי רשימת שמות.\nאת השמות תרשום בשורות נפרדות כדי שאני אדע להבדיל בין שם לשם גם אם תרשום שמות משפחה.",
		})
		return true
	}
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: "לא הבנתי את ההודעה ששלחת לי...\nאני יכול להבין אך ורק שעות שרשומות כמו בשעון דיגיטלי, לדוגמא:\n10:00\n12:0\n1:30",
	})
	return false
}
export const namesHelp: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text) return false
	const names = msg.text.split("\n")
	if (dryRun) return names.length > 1
	if (names.length > 1) {
		user.helpData.names = names
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `מצויין!\nעכשיו יש לנו רשימה עם ${names.length} שומרים.`,
		})
		await callAPI("sendChatAction", {
			chat_id: user.id,
			action: "typing",
		})
		await wait(700)
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "עכשיו כל שנותר כדי להכין רשימת שמירה הוא המרכיב החשוב ביותר.\nעכשיו תשלח לי שוב שעה, את שעת סיום השמירה והיא תשמש אותי לחישוב זמן השמירה לכל שומר.",
		})
		return true
	}
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: "אני לא יכול להבדיל בין שם לשם אם הם נמצאים באותה שורה.\nשלח לי את הרשימה כל שם בשורה אחרת, דוגמא:\nפלוני\nאלמוני\nפלונית\nאלמונית",
	})
	return false
}

export const endHelp: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text) return false
	const time = Time.parseTime(msg.text)
	if (dryRun) return !!time
	if (time) {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: `וזהו! עכשיו שאני יודע שהשמירה תסתיים בשעה ${time}${
				time.equals(user.helpData.start!) ? " ביום למחרת" : ""
			} אני יכול לחשב כמה זמן יצטרך לשמור כל שומר ולשלוח רשימה מסודרת.`,
		})
		time.equals(user.helpData.start!) && (time.hour += 24)
		user.helpData.end = time
		await callAPI("sendChatAction", {
			chat_id: user.id,
			action: "typing",
		})
		await wait(300)
		const { start, end, names } = user.helpData
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: createList(start!, end, names!),
		})
		await callAPI("sendChatAction", {
			chat_id: user.id,
			action: "typing",
		})
		await wait(300)
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "הנה רשימת השמירה שיצרנו!",
		})
		await callAPI("sendChatAction", {
			chat_id: user.id,
			action: "typing",
		})
		await wait(600)
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "אבל זה עדיין לא מספיק...\nמה אם תרצה להגדיר זמן שמירה לכל שומר בעצמך?\nובכן יש פתרון פשוט! במקום לשלוח לי את שעת סיום השמירה, אתה יכול לשלוח לי את זמן השמירה בדקות.",
		})
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "נסה עכשיו לשלוח לי זמן שמירה אחר מהזמן שחישבתי לשמירה שיצרנו.",
		})
		return true
	}
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: "לא הבנתי את ההודעה ששלחת לי...\nאני יכול להבין אך ורק שעות שרשומות כמו בשעון דיגיטלי, לדוגמא:\n10:00\n12:0\n1:30",
	})
	return false
}

export const guardHelp: OptionsParser = async (msg, user, dryRun) => {
	if (!msg.text) return false
	const match = msg.text.match(/^\d+$/)
	if (dryRun) return !!match
	if (!match) {
		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "לא הבנתי את ההודעה ששלחת לי...\nפשוט שלח לי מספר, לדוגמא, עבור שמירה של חצי שעה: 30",
		})
		return false
	}
	const guardDuration = parseInt(msg.text)
	user.helpData.guard = guardDuration * 60
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: `עכשיו אני יצור רשימה שבה כל שמירה תימשך ${guardDuration} דקות`,
	})
	const { start, names, guard } = user.helpData
	await callAPI("sendChatAction", {
		chat_id: user.id,
		action: "typing",
	})
	await wait(300)
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: createList(start!, guard, names!),
	})
	await callAPI("sendChatAction", {
		chat_id: user.id,
		action: "typing",
	})
	await wait(600)
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: "סיימנו! אלו כל הפיצ'רים הבסיסיים שלי.\nמעבר לזה, ברגע שתיצור רשימת שמירה אחת, מייד תראה שיש עוד אופציות מתחת להודעה שאשלח לך.\nאני ממליץ שתשחק איתם קצת כדי להבין איך הם יכולות להועיל לך!",
	})
	await callAPI("sendChatAction", {
		chat_id: user.id,
		action: "typing",
	})
	await wait(600)
	await callAPI("sendMessage", {
		chat_id: user.id,
		text: "וזהו, אני שמחתי לעזור לך, בכל רגע שתרצה לעשות שמירה פשוט תתחיל לשלוח לי נתונים (שעה, רשימת שמות, זמן) סדר השליחה איננו משנה.\n\nשמירה נעימה!",
	})
	user.helpData = {}
	user.state = UserData.states.generic
	return true
}
