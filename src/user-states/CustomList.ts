import {
	callback_values,
	callback_values_reversed,
} from "../callbackQueryHandling.js"
import { Time } from "../classes/Time.js"
import { UserData } from "../classes/User.js"
import { callAPI } from "../telegramApi.js"
import { TextMessage } from "../types.js"
import { UID, createList, validateTextMessage } from "../utils.js"
import { UserState } from "./UserState.js"

const days = new Map([
	["ראשון", 0],
	["שני", 1],
	["שלישי", 2],
	["רביעי", 3],
	["חמישי", 4],
	["שישי", 5],
	["שבת", 6],
])

const waitingTypes = {
	nothing: UID(),
	names: UID(),
	duration: UID(),
	startTime: UID(),
	startDay: UID(),
	endDay: UID(),
	stations: UID(),
} as const

export class CustomListState implements UserState {
	private data: {
		stations?: number
		startDay?: number
		endDay?: number
		guardDuration?: number
		startTime?: Time
		nameList?: string[]
	} = {}

	deleteMessagesQueue: Message[] = []
	waitFor: number = waitingTypes.nothing
	mainMessage!: TextMessage

	inline_keyboard = [
		[
			{
				text: "שנה יום תחילה ויום סוף",
				callback_data: callback_values.change_start_end_day,
			},
		],
		[
			{
				text: "שנה שעת תחילת הרשימה",
				callback_data: callback_values.change_list_start_time,
			},
		],
		[
			{
				text: "שנה זמן שמירה",
				callback_data: callback_values.change_guard_duration,
			},
		],
		[
			{
				text: "שנה מספר עמדות",
				callback_data: callback_values.change_stations_number,
			},
		],
		[
			{
				text: "שלח רשימת שמות",
				callback_data: callback_values.send_name_list,
			},
		],
	]

	constructor(user: UserData) {
		;(async () => {
			this.mainMessage = (
				await callAPI("sendMessage", {
					chat_id: user.id,
					text: "לחץ על הכפתורים מתחת להודעה זאת כדי להכין רשימת שמירה על פי הקריטריונים שלך",
					reply_markup: {
						inline_keyboard: this.inline_keyboard,
					},
				})
			).result
		})()
	}

	async parse(message: Message, user: UserData): Promise<void> {
		this.deleteMessagesQueue.push(message)
		const { text } = message
		if (!text) return
		if (this.waitFor === waitingTypes.nothing) {
			this.deleteMessagesQueue.push(
				await (
					await callAPI("sendMessage", {
						chat_id: user.id,
						text: "לחץ על אחד הכפתורים כדי להכין רשימת שמירה",
					})
				).result
			)
		} else if (this.waitFor === waitingTypes.names) {
			const names = text.split("\n")
			if (names.length > 1) {
				this.data.nameList = names
				this.waitFor = waitingTypes.nothing
				this.deleteMessagesQueue.map((m) =>
					callAPI("deleteMessage", {
						chat_id: user.id,
						message_id: m.message_id,
					})
				)
			} else {
				this.deleteMessagesQueue.push(
					(
						await callAPI("sendMessage", {
							chat_id: user.id,
							text: "שלח לי רשימת שמות מופרדת בשורות חדשות, דוגמא:\nשלומי\nאדם\nצורי\nנדיר",
						})
					).result
				)
			}
		} else if (this.waitFor === waitingTypes.duration) {
			if (text.match(/^\d+$/)) {
				this.data.guardDuration = parseInt(text) * 60
				this.waitFor = waitingTypes.nothing
				this.deleteMessagesQueue.map((m) =>
					callAPI("deleteMessage", {
						chat_id: user.id,
						message_id: m.message_id,
					})
				)
			} else {
				this.deleteMessagesQueue.push(
					(
						await callAPI("sendMessage", {
							chat_id: user.id,
							text: "שלח לי את זמן השמירה הרצוי בדקות, דוגמא: 30, 60, 120",
						})
					).result
				)
			}
		} else if (this.waitFor === waitingTypes.startTime) {
			const time = Time.parseTime(text)
			if (time) {
				this.data.startTime = time
				this.waitFor = waitingTypes.nothing
				this.deleteMessagesQueue.map((m) =>
					callAPI("deleteMessage", {
						chat_id: user.id,
						message_id: m.message_id,
					})
				)
			} else {
				this.deleteMessagesQueue.push(
					(
						await callAPI("sendMessage", {
							chat_id: user.id,
							text: "שלח לי שעה בפורמט הבא: שעות:דקות\nדוגמא: 12:0, 20:30, 6:34",
						})
					).result
				)
			}
		} else if (this.waitFor === waitingTypes.startDay) {
			const day = days.get(text)
			if (day !== undefined) {
				this.data.startDay = day
				this.waitFor = waitingTypes.endDay
				this.deleteMessagesQueue.push(
					(
						await callAPI("sendMessage", {
							chat_id: user.id,
							text: "עכשיו שלח לי את יום סיום השמירות",
						})
					).result
				)
			} else {
				this.deleteMessagesQueue.push(
					(
						await callAPI("sendMessage", {
							chat_id: user.id,
							text: "שלח לי יום בשבוע, דוגמא: ראשון, שני, שלישי...",
						})
					).result
				)
			}
		} else if (this.waitFor === waitingTypes.endDay) {
			const day = days.get(text)
			if (day !== undefined) {
				this.data.endDay = day
				this.waitFor = waitingTypes.nothing
				this.deleteMessagesQueue.map((m) =>
					callAPI("deleteMessage", {
						chat_id: user.id,
						message_id: m.message_id,
					})
				)
			} else {
				this.deleteMessagesQueue.push(
					(
						await callAPI("sendMessage", {
							chat_id: user.id,
							text: "שלח לי יום בשבוע, דוגמא: ראשון, שני, שלישי...",
						})
					).result
				)
			}
		} else if (this.waitFor === waitingTypes.stations) {
			if (text.match(/^\d+$/)) {
				this.data.stations = parseInt(text)
				this.waitFor = waitingTypes.nothing
				this.deleteMessagesQueue.map((m) =>
					callAPI("deleteMessage", {
						chat_id: user.id,
						message_id: m.message_id,
					})
				)
			} else {
				this.deleteMessagesQueue.push(
					(
						await callAPI("sendMessage", {
							chat_id: user.id,
							text: "שלח לי מספר לבד, דוגמא: 1, 2, 3, 4...",
						})
					).result
				)
			}
		}
		const builder: string[] = []
		let { guardDuration, nameList, startTime, stations, endDay, startDay } =
			this.data
		if (startDay !== undefined)
			builder.push(
				`יום התחלה: ${
					[...days.entries()].find((d) => d[1] === startDay)?.[0]
				}`
			)
		if (endDay !== undefined)
			builder.push(
				`יום סוף: ${[...days.entries()].find((d) => d[1] === endDay)?.[0]}`
			)
		if (guardDuration) builder.push(`זמן שמירה: ${guardDuration / 60}`)
		if (startTime) builder.push(`זמן תחילת רשימה: ${startTime}`)
		if (stations) builder.push(`מספר עמדות: ${stations}`)
		builder.push("\n")
		if (nameList) {
			stations ??= 1
			startTime ??= new Time(12, 0)
			const extras = nameList.length % stations
			const chunks = Math.floor(nameList.length / stations)
			const dayCount =
				startDay !== undefined && endDay !== undefined
					? startDay < endDay
						? endDay - startDay
						: endDay + 7 - startDay
					: 0
			const stationsData: { nameIndex: number; time: number }[] = [
				...Array(stations),
			].map(() => ({ nameIndex: 0, time: startTime!.toSeconds() }))
			for (let i = 0; i <= dayCount; i++) {
				if (startDay !== undefined)
					builder.push(
						`יום ${
							[...days.entries()].find(
								(d) => d[1] === (startDay! + i) % 7
							)?.[0]
						}`
					)
				for (let k = 0; k < stations; k++) {
					if (stations > 1) builder.push(`עמדה ${k + 1}`)
					const names = nameList.slice(chunks * k, chunks * (k + 1))
					if (guardDuration) {
						for (
							;
							stationsData[k].time <
							startTime.toSeconds() + 24 * 60 * 60;
							stationsData[k].time += guardDuration
						) {
							builder.push(
								`${Time.fromSeconds(
									stationsData[k].time % (24 * 60 * 60)
								)} ${names[stationsData[k].nameIndex]}`
							)
							stationsData[k].nameIndex =
								(stationsData[k].nameIndex + 1) % names.length
						}
						stationsData[k].time %= 24 * 60 * 60
					} else {
						builder.push(
							createList(
								startTime,
								new Time(startTime.hour + 24, startTime.minute),
								names
							).timedListString
						)
					}
				}
			}
			if (nameList.length > chunks * stations)
				builder.push(
					`חיילים נותרים (${extras}):\n${nameList
						.slice(chunks * stations)
						.join("\n")}`
				)
		}

		if (builder.length) {
			await callAPI("editMessageText", {
				chat_id: this.mainMessage.chat.id,
				message_id: this.mainMessage.message_id,
				text: builder.join("\n"),
				reply_markup: { inline_keyboard: this.inline_keyboard },
			}),
				{
					chat_id: this.mainMessage.chat.id,
					message_id: this.mainMessage.message_id,
					text: builder.join("\n"),
				},
				this.mainMessage
		}
	}

	async handleCallback(callbackQuery: CallbackQuery, user: UserData) {
		if (
			!callbackQuery.data ||
			!(callbackQuery.message && validateTextMessage(callbackQuery.message))
		) {
			callAPI("answerCallbackQuery", {
				callback_query_id: callbackQuery.id,
				text: "קרתה תקלה!\nאם ההודעה ששלחת ישנה אני כבר לא יכול לערוך אותה...",
			})
			return
		}
		callAPI("answerCallbackQuery", {
			callback_query_id: callbackQuery.id,
		})
		const action: keyof typeof callback_values =
			callback_values_reversed[callbackQuery.data]

		if (action === "change_guard_duration") {
			this.deleteMessagesQueue.push(
				(
					await callAPI("sendMessage", {
						chat_id: user.id,
						text: "שלח לי את זמן השמירה הרצוי בדקות",
					})
				).result
			)
			this.waitFor = waitingTypes.duration
		} else if (action === "change_list_start_time") {
			this.deleteMessagesQueue.push(
				(
					await callAPI("sendMessage", {
						chat_id: user.id,
						text: "שלח לי את השעה שבה תתחיל הרשימה",
					})
				).result
			)
			this.waitFor = waitingTypes.startTime
		} else if (action === "change_start_end_day") {
			this.deleteMessagesQueue.push(
				(
					await callAPI("sendMessage", {
						chat_id: user.id,
						text: "שלח לי את היום שבה תתחיל הרשימה",
					})
				).result
			)
			this.waitFor = waitingTypes.startDay
		} else if (action === "change_stations_number") {
			this.deleteMessagesQueue.push(
				(
					await callAPI("sendMessage", {
						chat_id: user.id,
						text: "שלח לי את מספר העמדות",
					})
				).result
			)
			this.waitFor = waitingTypes.stations
		} else if (action === "send_name_list") {
			this.deleteMessagesQueue.push(
				(
					await callAPI("sendMessage", {
						chat_id: user.id,
						text: "שלח עכשיו את רשימת השמות",
					})
				).result
			)
			this.waitFor = waitingTypes.names
		}
	}
}
