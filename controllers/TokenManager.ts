export default class TokenManager {
	private token: string | undefined
	private tokenGranted: number | undefined
	private ONE_HOUR: number = 3_600_000

	constructor() {}

	public getToken(): string | undefined {
		return this.token
	}
	public setToken(value: string | undefined) {
		this.token = value
		this.tokenGranted = Date.now()
	}

	public getTokenGranted(): number | undefined {
		return this.tokenGranted
	}
	public setTokenGranted(time: number | undefined) {
		this.tokenGranted = time
	}

	public resetToken(): void {
		this.token = undefined
		this.tokenGranted = undefined
	}

	public tokenIsValid(): boolean {
		if (this.tokenGranted === undefined) {
			return false
		}

		if (this.token === undefined) {
			return false
		}

		const now: number = Date.now()

		return now - this.tokenGranted <= this.ONE_HOUR
	}

	public timeToExpire(): number {
		if (!this.tokenGranted) {
			return 0
		}

		if (!this.token) {
			return 0
		}

		const now: number = Date.now()

		const timeInMs: number = this.ONE_HOUR - (now - this.tokenGranted)

		return Math.floor(timeInMs / 60_000)
	}
}
