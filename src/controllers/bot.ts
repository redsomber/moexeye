import { CronJob } from 'cron'
import { DataModel } from '@/models/Data'
import bot from '@/helpers/bot'
import fetch from 'node-fetch'
import mapData from '@/app'

const url =
  'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json?marketdata.columns=SECID, OPEN, LAST&iss.only=marketdata&iss.meta=off'

export function runCron() {
  const lastAPI = new CronJob('01 50 23 * * *', async function () {
    const d = new Date()
    await postLastData()
    console.log('Data posted:', d)
  })

  const startAPI = new CronJob('*/10 * 10-00 1-5 * *', function () {
    const d = new Date()
    // await getCurrentData()
    console.log('Midnight:', d)
  })

  startAPI.start()
  lastAPI.start()
}

export async function getLastData() {
  const data = await DataModel.find().sort({ createdAt: -1 }).limit(1)
  if (!data) {
    return new Error('Data not found')
  }
  return data[0].data
}

export async function postLastData() {
  const response = await fetch(url)
  const data = await response.json()
  for (let i = 0; i < data.marketdata.data.length; i++) {
    data.marketdata.data[i].splice(1, 1)
    data.marketdata.data[i].push(null)
  }
  await DataModel.create({ data: data.marketdata.data })
}

export async function getCurrentData(temp: any) {
  const response = await fetch(url)
  const data = await response.json()
  for (let i = 0; i < data.marketdata.data.length; i++) {
    temp[i][2] = getPercent(temp[i][1], data.marketdata.data[i][2])
    if (temp[i][2] > 7 && temp[i][1] > 0) {
      if (!mapData.has(temp[i][0])) {
        await bot.api.sendMessage(
          505211008,
          `${temp[i][0]} вырос на ${temp[i][2]}%`
        )
      }
      mapData.set(temp[i][0], temp[i])
    }
    if (temp[i][2] < 2 && mapData.has(temp[i][0])) {
      mapData.delete(temp[i][0])
    }
  }
  console.log(mapData)

  return temp
}

export function getPercent(a: any, b: any) {
  return ((b - a) / a) * 100
}
