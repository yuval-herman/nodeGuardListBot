import { UserData } from "../classes/User.js"

export interface UserState {
	parse(message: Message, user: UserData): Promise<void>
}
