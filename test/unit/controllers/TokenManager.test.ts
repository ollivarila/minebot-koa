import TokenManager from '../../../controllers/TokenManager'

describe('TokenManager', () => {
	const tokenManager: TokenManager = new TokenManager()

	beforeEach(() => {
		tokenManager.resetToken()
	})

	it('sets tokenGranted when token is set', () => {
		tokenManager.setToken('test')

		expect(tokenManager.getTokenGranted()).not.toBe(undefined)
	})

	it('tells that token is invalid when token is not set', () => {
		expect(tokenManager.tokenIsValid()).toBe(false)
	})

	it('tells that token is valid when token is set', () => {
		tokenManager.setToken('test')

		expect(tokenManager.tokenIsValid()).toBe(true)
	})

	it('tells that token is invalid when token is set and time is expired', () => {
		tokenManager.setToken('test')
		tokenManager.setTokenGranted(Date.now() - 3_600_001)

		expect(tokenManager.tokenIsValid()).toBe(false)
	})
})
