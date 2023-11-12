export type UserCurrentStates = "start"
export type OptionsParser = (message: Message, user: UserData) => boolean
type UserState = {
	optionsParsers: OptionsParser[]
	currentState: UserCurrentStates
}
export type Time = [number, number]
export interface UserData {
	startTime?: Time
	endTime?: Time
	nameList?: string[]
	id: number
	state: UserState
}
