import { HttpStatusCode } from 'axios'
import { verifyDiscordRequest, checkAuth, userParser } from '../../../utils/middleware'

describe('Middleware', () => {
	describe('verifyDiscordRequest', () => {
		it('should respond with 401 if the request is not verified', async () => {
			const ctx: any = {
				request: {
					rawBody: 'rawBody',
				},
				get: jest.fn().mockReturnValue('val'),
				assert: jest.fn(),
			}

			const next: any = jest.fn()

			await verifyDiscordRequest(ctx, next)

			expect(ctx.assert).toHaveBeenCalledWith(false, HttpStatusCode.Unauthorized, 'invalid request signature')

			expect(next).toHaveBeenCalled()
		})
	})

	describe('checkAuth', () => {
		test('ctx.assert is called with correct parameters when Authorization is not present', async () => {
			const ctx: any = {
				assert: jest.fn(),
				get: jest.fn().mockReturnValue(''),
			}

			const next: any = jest.fn()

			await checkAuth(ctx, next)

			expect(ctx.assert).toHaveBeenCalledWith(false, HttpStatusCode.Unauthorized, 'No token provided')

			expect(next).toHaveBeenCalled()
		})

		test('ctx.assert is called with correct parameters when Authorization is present but token is invalid', async () => {
			const ctx: any = {
				assert: jest.fn(),
				get: jest.fn().mockReturnValue('Bearer invalidToken'),
			}

			const next: any = jest.fn()

			await checkAuth(ctx, next)

			expect(ctx.assert).toHaveBeenCalledWith(false, HttpStatusCode.Unauthorized, 'Token invalid')

			expect(next).toHaveBeenCalled()
		})

		test('ctx.assert is called with correct parameters when Authorization is present and token is valid', async () => {
			const ctx: any = {
				assert: jest.fn(),
				get: jest.fn().mockReturnValue('Bearer validToken'),
			}

			process.env.MY_TOKEN = 'validToken'

			const next: any = jest.fn()

			await checkAuth(ctx, next)

			expect(ctx.assert).toHaveBeenCalledWith(true, HttpStatusCode.Unauthorized, 'Token invalid')

			expect(next).toHaveBeenCalled()
		})
	})

	describe('userParser', () => {
		it('should parse discord id from request body', async () => {
			const ctx: any = {
				request: {
					body: {
						member: {
							user: {
								id: '1234567890',
							},
						},
					},
				},
				state: {},
			}

			const next: any = jest.fn()

			await userParser(ctx, next)

			expect(ctx.state.discordId).toBe('1234567890')
		})
	})
})
