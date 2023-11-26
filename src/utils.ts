import { createWriteStream } from "fs"
import { readFile, writeFile } from "fs/promises"
import { usersData } from "./app.js"
import { callback_values_reversed } from "./callbackQueryHandling.js"
import { Time } from "./classes/Time.js"
import { CONSTANTS } from "./constants.js"
import { ListEntry } from "./types.js"

function calculateTime(startTime: Time, endTime: Time, divider: number) {
	const startTimeSeconds = startTime.toSeconds()
	const endTimeSeconds = endTime.toSeconds()
	let guardSeconds = (endTimeSeconds - startTimeSeconds) / divider

	if (guardSeconds < 0) {
		guardSeconds =
			(endTimeSeconds + 24 * 60 * 60 - startTimeSeconds) / divider
	}
	return {
		startTimeSeconds,
		guardSeconds,
	}
}

export function createList(
	startTime: Time,
	endTime: Time | number,
	nameList: string[]
) {
	let guardSeconds,
		startTimeSeconds = startTime.toSeconds()
	if (typeof endTime !== "number") {
		;({ guardSeconds, startTimeSeconds } = calculateTime(
			startTime,
			endTime,
			nameList.length
		))
	} else guardSeconds = endTime
	let timedListString = ""
	let nameIndex = 0
	let guardTime = startTimeSeconds

	const list: ListEntry[] = []
	while (nameList[nameIndex]) {
		const entry: ListEntry = {
			time: Time.fromSeconds(
				guardTime >= 24 * 60 * 60 ? guardTime - 24 * 60 * 60 : guardTime
			),
			name: nameList[nameIndex],
		}
		list.push(entry)
		timedListString += `${entry.time} ${entry.name}\n`
		nameIndex++
		guardTime += guardSeconds
	}
	return { timedListString, list }
}

export async function log_update(update: Update) {
	const user = update.message?.from
	if (user && !usersData.has(user.id)) {
		let users: Record<number, User> = {}
		try {
			users = JSON.parse(
				(await readFile(CONSTANTS.USERS_FILE, { encoding: "utf-8" })) ||
					"{}"
			)
		} catch (error) {
			// If the file does not exist this is fine, else we should rethrow
			if (
				!(
					error instanceof Error &&
					"code" in error &&
					error.code === "ENOENT"
				)
			) {
				throw error
			}
		}
		users[user.id] = user
		writeFile(CONSTANTS.USERS_FILE, JSON.stringify(users), { flag: "w" })
	}
	const { message, callback_query } = update
	if (message && message.from) {
		fileLog(
			"short",
			"message",
			message.from.username || message.from.first_name,
			message.text ?? "NO TEXT IN MESSAGE"
		)
	} else if (callback_query) {
		fileLog(
			"short",
			"callback",
			callback_query.from.username || callback_query.from.first_name,
			callback_query.data
				? callback_values_reversed[callback_query.data]
				: "NO DATA IN CALLBACK"
		)
	}
}

const LogFile = createWriteStream(CONSTANTS.LOG_FILE, {
	flags: "a",
	encoding: "utf-8",
})

const verboseLogFile = createWriteStream(CONSTANTS.VERBOSE_LOG_FILE, {
	flags: "a",
	encoding: "utf-8",
})

export function fileLog(type: "verbose" | "short", ...data: string[]) {
	const stream = type === "verbose" ? verboseLogFile : LogFile
	stream.write("\n")
	stream.write(
		new Date().toLocaleDateString("en-IL", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})
	)
	stream.write(" - ")
	stream.write(data.map((item) => item.replace(/\n/g, "\\n")).join(" - "))
}

// https://stackoverflow.com/a/2450976
export function shuffle<T>(array: T[]) {
	let currentIndex = array.length,
		randomIndex

	// While there remain elements to shuffle.
	while (currentIndex > 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex--

		// And swap it with the current element.
		;[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		]
	}

	return array
}

let last_id = 0
export function UID() {
	return last_id++
}

export async function wait(milliseconds: number) {
	let res: (value: void | PromiseLike<void>) => void
	const promise = new Promise<void>((resolve) => (res = resolve))
	setTimeout(() => res(), milliseconds)
	return promise
}
