import { UserData } from "./classes/User.js"

export type OptionsParser = (
	message: Message,
	user: UserData,
	dryRun?: boolean
) => Promise<boolean>

export type Time = [number, number]

export interface Configs {
	token: string
	testingToken?: string
	last_update_id?: number
	adminId: number
	webhookUrl?: string
}
