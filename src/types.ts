export type OptionsParser = (
	message: Message,
	user: UserData
) => Promise<boolean>
type UserState = {
	optionsParsers: OptionsParser[]
}
export type Time = [number, number]
export interface UserData {
	startTime?: Time
	endTime?: Time
	guardDuration?: number
	nameList?: string[]
	id: number
	state: UserState
}

export type CompleteUserData = UserData & {
	startTime: Time
	nameList: string[]
} & (
		| {
				endTime: Time
		  }
		| {
				guardDuration: number
		  }
	)

export interface Configs {
	token: string
	last_update_id?: number
}
