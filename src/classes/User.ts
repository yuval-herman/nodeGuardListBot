import { GenericState } from "../user-states/Generic.js"
import { UserState } from "../user-states/UserState.js"

export class UserData {
	id: number
	state: UserState

	constructor(id: number) {
		this.id = id
		this.state = new GenericState()
	}

	answerMessage(msg: Message): Promise<void> {
		return this.state.parse(msg, this)
	}
}
