import { startCmd, stopCmd } from './controllers/Container'

async function main() {
  const res = await startCmd()
  const c = res.unwrapOrElse(() => {
    throw new Error('Failed to start container')
  })

  c.onProgress(event => {
    console.log(event)
  })
  const str = c.toString()
  console.log(str)
}

main()
