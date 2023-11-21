export class Time {
	minute: number
	hour: number
	constructor(hour: number, minute: number) {
		this.hour = hour
		this.minute = minute
	}

	toSeconds() {
		return this.hour * (60 * 60) + this.minute * 60
	}

	equals(time: Time) {
		return this.hour === time.hour && this.minute === time.minute
	}

	static fromSeconds(timeInSeconds: number) {
		return new Time(
			Math.floor(timeInSeconds / (60 * 60)),
			Math.floor((timeInSeconds / 60) % 60)
		)
	}

	/**
	 * Parse a `Time` class from a string.
	 * If no `Time` is detected return undefined.
	 */
	static parseTime(text: string): Time | undefined {
		const res = text.match(/^(\d{1,2}):(\d{1,2})$/)
		if (res) return new Time(+res[1], +res[2])
	}

	/**
	 * Parse a `Time` class from a string.
	 * Searches the entire string for `Time` instances and returns array.
	 */
	static parseTimeGlobal(text: string): Time[] {
		return Array.from(text.matchAll(/(\d{1,2}):(\d{1,2})/g)).map(
			(res) => new Time(+res[1], +res[2])
		)
	}

	toString() {
		function digitFormat(digit: number) {
			return digit.toString().padStart(2, "0")
		}
		return `${digitFormat(this.hour)}:${digitFormat(this.minute)}`
	}
}
