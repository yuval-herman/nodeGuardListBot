import { ListEntry } from "../types.js"
import { GenericState } from "../user-states/Generic.js"
import { UserState } from "../user-states/UserState.js"
import { Time } from "./Time.js"

type Guard = {
	name: string
	previousGuards: Time[]
}

export class UserData {
	id: number
	state: UserState
	guards: Guard[] = []

	constructor(id: number) {
		this.id = id
		this.state = new GenericState()
	}

	answerMessage(msg: Message): Promise<void> {
		return this.state.parse(msg, this)
	}

	saveGuards(list: ListEntry[]) {
		for (const { name, time } of list) {
			const guard = this.guards.find((g) => g.name === name)
			if (!guard) {
				this.guards.push({ name, previousGuards: [time] })
			} else {
				guard.previousGuards.push(time)
			}
		}
	}
}
