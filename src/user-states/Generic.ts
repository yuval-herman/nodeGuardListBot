import { readFile, writeFile } from "fs/promises"
import { UserData } from "../classes/User.js"
import { callAPI } from "../telegramApi.js"
import { HelpState } from "./Help.js"
import { UserState } from "./UserState.js"
import { CONSTANTS } from "../constants.js"
import { Time } from "../classes/Time.js"
import { CustomListState } from "./CustomList.js"

const helpCommand = async (msg: Message, user: UserData): Promise<true> => {
	user.state = new HelpState(user)
	return true
}
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
	private commands: Record<
		string,
		(msg: Message, user: UserData) => Promise<true>
	> = {
		"/start": helpCommand,
		"/help": helpCommand,
		"/clear": async (msg: Message, user: UserData) => {
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
			return true
		},
		"/broadcast": async (msg: Message, user: UserData) => {
			const message = msg.text!.slice(11)
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
						callAPI("sendMessage", {
							chat_id: user.id,
							text: message,
						})
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
			return true
		},
		"/custom": async (msg: Message, user: UserData) => {
			user.state = new CustomListState(user)
			return true
		},
		"/auto": async (msg: Message, user: UserData) => {
			await callAPI("sendMessage", {
				chat_id: user.id,
				text: "פיצ'ר זה עוד לא מוכן",
			})
			return true
		},
	}

	async parse(msg: Message, user: UserData): Promise<void> {
		if (!msg.text) return
		if (await this.commands[msg.text.split(" ")[0]]?.(msg, user)) return

		const time = Time.parseTime(msg.text)

		if (time) {
			if (this.startTime && (this.endTime || this.guardDuration)) {
				await callAPI("sendMessage", {
					chat_id: user.id,
					text: `כבר שלחת לי את זמני השמירות\nשעת התחלה: ${
						this.startTime
					}\n${
						this.endTime
							? `שעת סוף: ${
									this.endTime.hour > 24
										? new Time(
												this.endTime.hour - 24,
												this.endTime.minute
										  ) + "ביום למחרת"
										: this.endTime
							  }`
							: `זמן השמירה: ${Math.floor(
									this.guardDuration! / 60
							  )} דקות`
					}\nעכשיו שלח לי רשימת שמות\nכדי למחוק את הנתונים ולהתחיל מחדש שלח לי /clear`,
				})
			} else if (!this.startTime) {
				await callAPI("sendMessage", {
					chat_id: user.id,
					text: `השמירה תתחיל ב-${time}`,
				})
				this.startTime = time
			} else {
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
			}
			return
		} else if (msg.text.match(/^\d+$/)) {
			if (this.endTime) {
				await callAPI("sendMessage", {
					chat_id: user.id,
					text: `כבר שלחת לי את זמן סוף השמירה (${
						this.endTime.hour > 24
							? new Time(this.endTime.hour - 24, this.endTime.minute) +
							  "ביום למחרת"
							: this.endTime
					}).\nכדי למחוק את הנתונים ולהתחיל מחדש שלח לי /clear`,
				})
				return
			} else if (this.guardDuration) {
				await callAPI("sendMessage", {
					chat_id: user.id,
					text: `כבר שלחת לי את זמן השמירה (${Math.floor(
						this.guardDuration / 60
					)} דקות).\nכדי למחוק את הנתונים ולהתחיל מחדש שלח לי /clear`,
				})
				return
			}
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
