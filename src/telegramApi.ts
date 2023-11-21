import { TOKEN, configs } from "./app"
import { fileLog } from "./utils.js"
import { createServer } from "http"

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
export let getUpdates =
	process.env.NODE_ENV === "production"
		? getUpdatesWebhook
		: getUpdatesLongPoll

class UpdatesEventEmitter {
	listeners: ((update: Update[]) => void)[] = []
	updates: Update[] = []
	newUpdate(update: Update) {
		const listener = this.listeners.pop()
		if (listener) {
			listener([update])
		} else this.updates.push(update)
	}
	onUpdate(callback: (update: Update[]) => void) {
		const update = this.updates.pop()
		if (update) {
			callback([update])
		}
		this.listeners.push(callback)
	}
}

const updatesEventEmitter = new UpdatesEventEmitter()

if (process.env.NODE_ENV === "production") {
	console.log("using webhook server")
	createServer((request, response) => {
		const { method, headers } = request
		if (
			headers["x-telegram-bot-api-secret-token"] !==
			configs.token.replace(":", "")
		)
			return

		if (method === "POST") {
			const body: any[] = []
			request
				.on("data", (chunk) => {
					body.push(chunk)
				})
				.on("error", (err) => {
					console.error(err.stack)
				})
				.on("end", () => {
					updatesEventEmitter.newUpdate(
						JSON.parse(Buffer.concat(body).toString())
					)
				})
			response.end()
		}
	}).listen(8443)
}

async function getUpdatesWebhook(): Promise<Update[]> {
	return new Promise<Update[]>((resolve, reject) => {
		updatesEventEmitter.onUpdate((update) => {
			fileLog("verbose", "WEBHOOK", JSON.stringify(update))
			return resolve(update)
		})
	})
}

async function getUpdatesLongPoll(): Promise<Update[]> {
	const options: { offset?: number; timeout: number } = { timeout: 99999999 }
	if (configs.last_update_id) options.offset = configs.last_update_id + 1

	const resultObject = await callAPI("getUpdates", options)
	if (resultObject.ok && Array.isArray(resultObject.result)) {
		const updates: Update[] = resultObject.result
		configs.last_update_id = updates.at(-1)?.update_id
		return updates
	}
	throw new Error("getUpdates error")
}
