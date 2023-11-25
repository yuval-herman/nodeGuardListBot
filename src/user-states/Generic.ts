import { readFile, writeFile } from "fs/promises"
import { UserData } from "../classes/User.js"
import { callAPI } from "../telegramApi.js"
import { HelpState } from "./Help.js"
import { UserState } from "./UserState.js"
import { CONSTANTS } from "../constants.js"
import { Time } from "../classes/Time.js"

export class GenericState implements UserState {
	name = "GenericState"
	async parse(msg: Message, user: UserData): Promise<void> {
		if (msg.text === "/start" || msg.text === "/help") {
			user.state = new HelpState(user)
			return
		} else if (msg.text === "/clear") {
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
			return
		} else if (msg.text?.startsWith("/broadcast")) {
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
				return
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
			return
		}
		if (!msg.text) return
		const time = Time.parseTime(msg.text)

		if (time) {
			if (user.startTime) {
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
			} else {
				await callAPI("sendMessage", {
					chat_id: user.id,
					text: `השמירה תתחיל ב-${time}`,
				})
				user.startTime = time
			}
			return
		} else if (msg.text.match(/^\d+$/)) {
			const minutes = parseInt(msg.text)
			await callAPI("sendMessage", {
				chat_id: user.id,
				text: `זמן השמירה נקבע ל-${minutes} דקות`,
			})
			user.guardDuration = minutes * 60
			return
		} else if (msg.text.includes("\n")) {
			const nameList = msg.text.split("\n")
			await callAPI("sendMessage", {
				chat_id: user.id,
				text: `קיבלתי את רשימת השמות! ישנם ${nameList.length} שומרים.`,
			})
			user.nameList = nameList
			return
		}

		await callAPI("sendMessage", {
			chat_id: user.id,
			text: "לא הבנתי מה אתה מתכוון\nלהוראות יותר מדוייקות שלח /help",
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
	}
}
