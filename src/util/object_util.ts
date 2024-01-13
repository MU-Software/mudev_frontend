export const filterRecord: (obj: Record<string, unknown>) => Record<string, unknown> = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter((e) => !e[1]))
}

export function isExist<T>(x: T | undefined | null): x is T {
  return x !== undefined && x !== null
}

export function isAllExist<T>(xs: (T | undefined | null)[]): xs is T[] {
  return xs.every(isExist)
}

export const isExpectedCase: (str: string, isUpper: boolean) => boolean = (str, isUpper) => {
  return str ? (str === str.toUpperCase()) === isUpper : false
}

export const generateID = () => Math.random().toString(36).substr(2, 16)

export const calcDDay = (date: Date) => {
  const today = new Date()
  const diff = date.getTime() - today.getTime()
  const diffDay = Math.ceil(diff / (1000 * 3600 * 24))
  return diffDay
}
