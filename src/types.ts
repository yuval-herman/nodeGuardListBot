export type OptionsParser = (
	message: Message,
	user: UserData,
	dryRun?: boolean
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
	savedData: {
		lastList?: string
	}
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
	testingToken?: string
	last_update_id?: number
	adminId: number
}
