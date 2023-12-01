import { Time } from "./classes/Time.js"
import { UserData } from "./classes/User.js"

export type OptionsParser = (
	message: Message,
	user: UserData,
	dryRun?: boolean
) => Promise<boolean>

export interface Configs {
	token: string
	testingToken?: string
	last_update_id?: number
	adminId: number
	webhookUrl?: string
}

export type ListEntry = {
	name: string
	time: Time
}

export interface TextMessage extends Message {
	text: string
}
