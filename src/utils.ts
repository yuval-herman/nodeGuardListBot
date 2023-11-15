import { readFile, writeFile } from "fs/promises"
import { Time, UserData } from "./types"

export function timeFormat(time: Time) {
	function digitFormat(digit: number) {
		return digit.toString().padStart(2, "0")
	}
	return `${digitFormat(time[0])}:${digitFormat(time[1])}`
}
function calculateTime(startTime: Time, endTime: Time, divider: number) {
	const startTimeSeconds = timeToSeconds(startTime)
	const endTimeSeconds = timeToSeconds(endTime)
	let guardSeconds = (endTimeSeconds - startTimeSeconds) / divider
	let multiDay = false

	if (guardSeconds < 0) {
		multiDay = true
		guardSeconds =
			(endTimeSeconds + 24 * 60 * 60 - startTimeSeconds) / divider
	}
	return {
		startTimeSeconds,
		endTimeSeconds,
		guardSeconds,
		multiDay,
	}
}
function secondsToTime(timeInSeconds: number): Time {
	return [
		Math.floor(timeInSeconds / (60 * 60)),
		Math.floor((timeInSeconds / 60) % 60),
	]
}
function timeToSeconds(time: Time): number {
	return time[0] * (60 * 60) + time[1] * 60
}
export function createList(startTime: Time, endTime: Time, nameList: string[]) {
	const { guardSeconds, startTimeSeconds, endTimeSeconds, multiDay } =
		calculateTime(startTime, endTime, nameList.length)
	let timedListString = ""
	let nameIndex = 0

	for (
		let guardTime = startTimeSeconds;
		guardTime < endTimeSeconds + (multiDay ? 24 * 60 * 60 : 0);
		guardTime += guardSeconds
	) {
		timedListString += `${timeFormat(
			secondsToTime(
				guardTime > 24 * 60 * 60 ? guardTime - 24 * 60 * 60 : guardTime
			)
		)} ${nameList[nameIndex]}\n`
		nameIndex++
	}
	return timedListString
}
export function cleanUser(user: UserData) {
	user.endTime = undefined
	user.startTime = undefined
	user.nameList = undefined
	user.state.currentState = "start"
}
export async function log_update(update: Update) {
	if (update.message?.from) {
		const user = update.message.from
		let users: Record<number, User> = {}
		try {
			users = JSON.parse(await readFile("users.json", { encoding: "utf-8" }))
			users[user.id] = user
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
		writeFile("users.json", JSON.stringify(users), { flag: "w" })
	}
	writeFile("log.log", JSON.stringify(update, null, 1) + "-".repeat(100), {
		flag: "a",
	})
}
