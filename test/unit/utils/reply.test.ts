import { reply } from '../../../utils/reply'

describe('Reply', () => {
	it('should set ctx.body correctly when data is a string', async () => {
		const ctx: any = {
			body: null,
		}

		const data: string = 'mockData'

		await reply(data, ctx)

		expect(ctx.body).toEqual({
			type: 4,
			data: {
				content: data,
			},
		})
	})

	it('should set ctx.body correctly when data is an object', async () => {
		const ctx: any = {
			body: null,
		}

		const data: object = {
			title: 'mockTitle',
		}

		await reply(data, ctx)

		expect(ctx.body).toEqual({
			type: 4,
			data: {
				embeds: [data],
			},
		})
	})
})
