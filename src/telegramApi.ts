import { readFile, writeFile } from "fs/promises"
import { TOKEN } from "./app"

export async function callAPI(
	method: string,
	options?: {}
): Promise<APIResult> {
	return (
		await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(options),
		})
	).json()
}
export async function getUpdates(): Promise<Update[]> {
	const configs = JSON.parse(await readFile("botConfigs.json", "utf8"))
	const options: { offset?: number; timeout: number } = { timeout: 99999999 }
	if (configs.last_update_id) options.offset = configs.last_update_id + 1

	const resultObject = await callAPI("getUpdates", options)
	if (resultObject.ok && Array.isArray(resultObject.result)) {
		const updates: Update[] = resultObject.result
		configs.last_update_id = updates.at(-1)?.update_id
		writeFile("botConfigs.json", JSON.stringify(configs))
		return updates
	}
	throw new Error("getUpdates error")
}
