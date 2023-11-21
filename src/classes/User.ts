import { configs } from "../app.js"
import {
	broadcastParser,
	clearParser,
	durationParser,
	endTimeParser,
	helpParser,
	nameListParser,
	smartParser,
	startParser,
	startTimeParser,
	unknownMessageParser,
} from "../parsers.js"
import { OptionsParser } from "../types.js"
import { Time } from "./Time.js"

export class UserData {
	id: number
	private _startTime?: Time
	private _endTime?: Time
	private _guardDuration?: number
	private _nameList?: string[]

	constructor(id: number) {
		this.id = id
	}

	getOptionsParsers(): OptionsParser[] {
		const parsers: OptionsParser[] = []
		if (!this.startTime) parsers.push(startTimeParser)
		if (!(this.endTime || this.guardDuration))
			parsers.push(endTimeParser, durationParser)
		if (!this.nameList) parsers.push(nameListParser)
		if (this.id === configs.adminId) parsers.push(broadcastParser)

		return parsers.concat(
			startParser,
			helpParser,
			clearParser,
			smartParser,
			unknownMessageParser
		) // add default parsers
	}

	isNameListDataComplete(): this is UserDataFull {
		return Boolean(
			this.startTime && (this.endTime || this.guardDuration) && this.nameList
		)
	}

	cleanNameListData() {
		this.endTime = undefined
		this.startTime = undefined
		this.guardDuration = undefined
		this.nameList = undefined
	}

	public get startTime(): Time | undefined {
		return this._startTime
	}
	public set startTime(value: Time | undefined) {
		this._startTime = value
	}
	public get endTime(): Time | undefined {
		return this._endTime
	}
	public set endTime(value: Time | undefined) {
		this._endTime = value
	}
	public get guardDuration(): number | undefined {
		return this._guardDuration
	}
	public set guardDuration(value: number | undefined) {
		this._guardDuration = value
	}
	public get nameList(): string[] | undefined {
		return this._nameList
	}
	public set nameList(value: string[] | undefined) {
		this._nameList = value
	}
}

export class UserDataFull extends UserData {
	public get startTime(): Time {
		return this.startTime
	}
	public get endTime(): Time {
		return this.endTime
	}
	public get guardDuration(): number {
		return this.guardDuration
	}
	public get nameList(): string[] {
		return this.nameList
	}
}
