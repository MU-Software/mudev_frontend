import { isNil } from 'remeda'

export const Light = 'light' as const
export const Dark = 'dark' as const
export const DeepDark = 'deep-dark' as const

export type ThemeType = typeof Dark | typeof Light | typeof DeepDark
export const lightThemeTypeCollection: ThemeType[] = [Light]
export const darkThemeTypeCollection: ThemeType[] = [Dark, DeepDark]
export const themeTypeCollection: ThemeType[] = [Dark, Light, DeepDark]

export const getCurrentTheme: () => ThemeType = () => {
  let colorTheme = <ThemeType | undefined>localStorage.getItem('color-theme')
  if (isNil(colorTheme) || !themeTypeCollection.includes(colorTheme))
    colorTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? Dark : Light

  document.documentElement.setAttribute('color-theme', colorTheme)
  return colorTheme
}

export const isDeepDarkEnabled: () => boolean = () => localStorage.getItem('use-deep-dark') === 'true'

export const toggleDeepDark: () => boolean = () => {
  const newDeepDarkValue = !isDeepDarkEnabled()
  localStorage.setItem('use-deep-dark', newDeepDarkValue ? 'true' : 'false')

  const currentTheme = getCurrentTheme()
  if (darkThemeTypeCollection.includes(currentTheme)) {
    const newTheme = newDeepDarkValue ? DeepDark : Dark
    localStorage.setItem('color-theme', newTheme)
    document.documentElement.setAttribute('color-theme', newTheme)
  }
  return newDeepDarkValue
}

export const toggleTheme: () => ThemeType = () => {
  const useDeepDark: boolean = isDeepDarkEnabled()
  const newDarkModeValue: ThemeType = getCurrentTheme() === Light ? (useDeepDark ? DeepDark : Dark) : Light
  localStorage.setItem('color-theme', newDarkModeValue)
  localStorage.setItem('use-deep-dark', useDeepDark ? 'true' : 'false')

  document.documentElement.setAttribute('color-theme', newDarkModeValue)
  return newDarkModeValue
}
