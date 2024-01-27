export const calcDDay = (date?: Date | null) => {
  if (!date) return null
  const today = new Date()
  const diff = date.getTime() - today.getTime()
  const diffDay = Math.ceil(diff / (1000 * 3600 * 24))
  return diffDay
}

export const getFullYmdStr = (d: Date) => {
  let result = d.getFullYear() + '년 '
  result += d.getMonth() + 1 + '월 '
  result += d.getDate() + '일 '
  result += d.getHours() + '시 '
  result += d.getMinutes() + '분 '
  result += d.getSeconds() + '초 '
  result += '일월화수목금토'.charAt(d.getUTCDay()) + '요일'
  return result
}
