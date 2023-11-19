import { writeFile } from "fs/promises"
import { TOKEN, configs } from "./app"
import { CONSTANTS } from "./constants.js"
import { fileLog } from "./utils.js"

export async function callAPI(
	method: string,
	options?: Record<string, any>
): Promise<APIResult> {
	fileLog(
		"verbose",
		"API_CALL",
		method,
		options ? JSON.stringify(options) : ""
	)
	if (method === "sendMessage" && options?.text) {
		fileLog("short", "message", "BOT", options.text)
	}
	const result = await (
		await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(options),
		})
	).json()

	fileLog("verbose", "API_RESULT", JSON.stringify(result))
	return result
}
export async function getUpdates(): Promise<Update[]> {
	const options: { offset?: number; timeout: number } = { timeout: 99999999 }
	if (configs.last_update_id) options.offset = configs.last_update_id + 1

	const resultObject = await callAPI("getUpdates", options)
	if (resultObject.ok && Array.isArray(resultObject.result)) {
		const updates: Update[] = resultObject.result
		configs.last_update_id = updates.at(-1)?.update_id
		await writeFile(CONSTANTS.BOT_CONFIGS_FILE, JSON.stringify(configs))
		return updates
	}
	throw new Error("getUpdates error")
}
