import Web3 from 'web3'

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export async function batch(requests = {}) {
  const entries = Object.entries(requests)

  const res = await Promise.all(entries.map(([_, req]) => req()))

  return entries.reduce((acc, [key], i) => {
    acc[key] = res[i]
    return acc
  }, {})
}

export async function bigNumberResponseToStr(request) {
  const bigNum = await request()
  return bigNum.toString()
}
