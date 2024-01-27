import React from 'react'
import { isEmpty } from 'remeda'

export const handleInputChange: <T>(
  valueName: string,
  setState: (s: (oS: T) => T) => void
) => React.ChangeEventHandler<HTMLInputElement> = (valueName, setState) => (e) => {
  setState((state) => {
    const newValue = e.currentTarget.type === 'checkbox' ? e.currentTarget.checked : e.currentTarget.value
    return { ...state, [valueName]: newValue }
  })
}

export function getFormValue<T>(_: {
  form: HTMLFormElement
  fieldToExcludeWhenFalse?: string[]
  fieldToNullWhenFalse?: string[]
}): T {
  const formData: {
    [k: string]: FormDataEntryValue | null
  } = Object.fromEntries(new FormData(_.form))
  Object.keys(formData)
    .filter((key) => (_.fieldToExcludeWhenFalse ?? []).includes(key) || (_.fieldToNullWhenFalse ?? []).includes(key))
    .filter((key) => isEmpty(formData[key] as string))
    .forEach((key) => {
      if ((_.fieldToExcludeWhenFalse ?? []).includes(key)) {
        delete formData[key]
      } else if ((_.fieldToNullWhenFalse ?? []).includes(key)) {
        formData[key] = null
      }
    })
  Array.from(_.form.children).forEach((child) => {
    const targetElement: Element | null = child
    if (targetElement && !(targetElement instanceof HTMLInputElement)) {
      const targetElements = targetElement.querySelectorAll('input')
      for (const target of targetElements)
        if (target instanceof HTMLInputElement && target.type === 'checkbox')
          formData[target.name] = target.checked ? 'true' : 'false'
    }
  })
  return formData as T
}
