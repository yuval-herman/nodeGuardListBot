import { UserData } from "../classes/User.js"

export interface UserState {
	name: string
	parse(message: Message, user: UserData): Promise<void>
}
