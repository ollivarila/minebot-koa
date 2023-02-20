export default class Logger {
	private static environment: string = process.env.NODE_ENV || 'development'

	public static log(...params: any): void {
		if (Logger.environment !== 'test') {
			console.log(...params)
		}
	}

	public static error(...params: any): void {
		if (Logger.environment !== 'test') {
			console.error(...params)
		}
	}

	public static warn(params: any): void {
		if (Logger.environment !== 'test') {
			console.warn(...params)
		}
	}
}
