import { CronJob } from 'cron'
import { getCurrentData, getLastData, postLastData } from '@/controllers/bot'

let tempData: object

export default function runCron() {
  const lastAPI = new CronJob('0 50 23 * * *', async function () {
    const d = new Date()
    await postLastData()
    console.log('Last data posted:', d)
  })

  const Data = new CronJob('00 15 10 * * 1-5', async function () {
    const d = new Date()
    tempData = await getLastData()
    console.log(tempData)

    console.log('Resieved from DB:', d)
  })

  const startAPI = new CronJob('0/10 0 10-23 * * 1-5', async function () {
    const d = new Date()
    if (!tempData) return console.log('no data', d)

    tempData = await getCurrentData(tempData)
    console.log('Res:', d)
  })

  startAPI.start()
  Data.start()
  lastAPI.start()
}
