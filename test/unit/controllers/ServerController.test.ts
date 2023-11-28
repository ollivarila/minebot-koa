import ServerController from '../../../controllers/ServerController'
import mockAxios from '../../mocks/axiosMock'

describe('ServerController', () => {
	let serverController: ServerController

	process.env.CLIENT_ID = 'test'
	process.env.SUBSCRIPTION_ID = 'test'
	process.env.RESOURCE_GROUP = 'test'
	process.env.CONTAINER_GROUP = 'test'
	process.env.TENANT_ID = 'test'
	process.env.HOSTNAME = 'test'

	beforeEach(() => {
		serverController = new ServerController()
		mockAxios.reset()
	})

	it('sends request to correct endpoint when getting status', async () => {
		const url: string =
			'https://management.azure.com/subscriptions/test/resourceGroups/test/providers/Microsoft.ContainerInstance/containerGroups/test?api-version=2022-10-01-preview'

		try {
			await serverController.status()
		} catch (error) {}

		expect(mockAxios.history.get[0].url).toBe(url)
	})
})
