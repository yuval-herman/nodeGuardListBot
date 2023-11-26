import { readFile, writeFile } from "fs/promises"
import { UserData } from "../classes/User.js"
import { callAPI } from "../telegramApi.js"
import { HelpState } from "./Help.js"
import { UserState } from "./UserState.js"
import { CONSTANTS } from "../constants.js"
import { Time } from "../classes/Time.js"

export class GenericState implements UserState {
	private _startTime?: Time
	private _endTime?: Time
	private _guardDuration?: number
	private _nameList?: string[]

	private _savedListData?:
		| {
				startTime: Time
				originalNameList: string[]
				modifiedNameList?: string[]
		  } & ({ endTime: Time } | { guardDuration: number })

	async parse(msg: Message, user: UserData): Promise<void> {
		if (msg.text === "/start" || msg.text === "/help") {
			user.state = new HelpState(user)
			return
		} else if (msg.text === "/clear") {
			const result = await callAPI("sendMessage", {
				chat_id: user.id,
				text: "נתונים נמחקים...",
			})
			this.cleanNameListData()
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
			if (this.startTime) {
				if (this.startTime?.equals(time)) {
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
				this.endTime = time
			} else {
				await callAPI("sendMessage", {
					chat_id: user.id,
					text: `השמירה תתחיל ב-${time}`,
				})
				this.startTime = time
			}
			return
		} else if (msg.text.match(/^\d+$/)) {
			const minutes = parseInt(msg.text)
			await callAPI("sendMessage", {
				chat_id: user.id,
				text: `זמן השמירה נקבע ל-${minutes} דקות`,
			})
			this.guardDuration = minutes * 60
			return
		} else if (msg.text.includes("\n")) {
			const nameList = msg.text.split("\n")
			await callAPI("sendMessage", {
				chat_id: user.id,
				text: `קיבלתי את רשימת השמות! ישנם ${nameList.length} שומרים.`,
			})
			this.nameList = nameList
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

	cleanNameListData() {
		this.endTime = undefined
		this.startTime = undefined
		this.guardDuration = undefined
		this.nameList = undefined
	}

	isNameListDataComplete() {
		return Boolean(
			this.startTime && (this.endTime || this.guardDuration) && this.nameList
		)
	}

	saveListData() {
		if (this.isNameListDataComplete()) {
			if (this.endTime)
				this._savedListData = {
					startTime: this.startTime!,
					originalNameList: this.nameList!,
					endTime: this.endTime!,
				}
			else
				this._savedListData = {
					startTime: this.startTime!,
					originalNameList: this.nameList!,
					guardDuration: this.guardDuration!,
				}
		}
	}

	public get startTime(): Time | undefined {
		return this._startTime
	}
	public set startTime(value: Time | undefined) {
		if (this.endTime && value?.equals(this.endTime)) this.endTime.hour += 24
		this._startTime = value
	}
	public get endTime(): Time | undefined {
		return this._endTime
	}
	public set endTime(value: Time | undefined) {
		if (this.startTime && value?.equals(this.startTime)) value.hour += 24
		this._endTime = value
	}
	public get guardDuration(): number | undefined {
		return this._guardDuration
	}
	public set guardDuration(value: number | undefined) {
		this._guardDuration = value
	}
	public get nameList(): string[] | undefined {
		return this._nameList
	}
	public set nameList(value: string[] | undefined) {
		this._nameList = value
	}
	public get savedListData() {
		return this._savedListData
	}
}
