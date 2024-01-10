import { UserData } from "../classes/UserData.js"

export interface UserState {
	parse(message: Message, user: UserData): Promise<void>
}
