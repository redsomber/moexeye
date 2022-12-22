import { DataModel } from '@/models/Data'
import { User, UserModel } from '@/models/User'
import bot from '@/helpers/bot'
import fetch from 'node-fetch'
import mapData from '@/app'

const url =
  'https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities.json?marketdata.columns=SECID, OPEN, LAST&iss.only=marketdata&iss.meta=off'

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
  try {
    const response = await fetch(url)
    const data = await response.json()
    for (let i = 0; i < data.marketdata.data.length; i++) {
      if (temp[i][1] == null) continue
      temp[i][2] = getPercent(temp[i][1], data.marketdata.data[i][2])
      if (temp[i][2] > 0.03 && temp[i][1] > 0) {
        if (!mapData.has(temp[i][0])) {
          await UserModel.find({}, { id: 1 })
            .cursor()
            .eachAsync(async (user: User) => {
              try {
                await bot.api.sendMessage(
                  user.id,
                  `<code>${temp[i][0]}</code> вырос на ${(
                    temp[i][2] * 100
                  ).toFixed(1)}%`,
                  {
                    parse_mode: 'HTML',
                  }
                )
              } catch (error) {
                console.log(error)
                const userd = await UserModel.deleteOne({ id: user.id })
                console.log(userd)
              }
            })
        }
        mapData.set(temp[i][0], temp[i])
      }
      if (temp[i][2] < 0.02 && mapData.has(temp[i][0])) {
        mapData.delete(temp[i][0])
      }
    }

    return temp
  } catch (error) {
    console.log(error)
  }
}

function getPercent(a: any, b: any) {
  return (b - a) / a
}
