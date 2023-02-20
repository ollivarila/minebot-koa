import axios from 'axios'
import mockAdaper from 'axios-mock-adapter'

const mock = new mockAdaper(axios)

const discordUrl: string = 'https://discord.com/api/v10/mockEndpoint'

const azureAuthUrl: string = 'https://login.microsoftonline.com/test/oauth2/v2.0/token'

const azureContainerUrl: string =
	'https://management.azure.com/subscriptions/test/resourceGroups/test/providers/Microsoft.ContainerInstance/containerGroups/test'

mock.onGet(discordUrl).reply(200, {})

mock.onPost(azureAuthUrl).reply(200, { access_token: 'test' })

mock.onGet(`${azureContainerUrl}?api-version=2022-10-01-preview`).reply(200, { state: 'Running' })

export default mock
