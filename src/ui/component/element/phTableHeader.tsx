import React from 'react'
import * as R from 'remeda'

export type TableHeadItem = {
  label: string
  width: number | string
  style?: React.CSSProperties
}

export const TableHead: React.FC<{ items: TableHeadItem[] }> = ({ items }) => {
  const headers = items.map((v, i) => <th key={i}> {v.label}</th>)
  const widthDefs = items
    .map((v) => (R.isString(v.width) ? v.width : `${v.width}%`))
    .map((v, i) => <col key={i} style={{ width: v, minWidth: v, maxWidth: v, ...(items[i].style ?? {}) }} />)

  return (
    <>
      <colgroup>{widthDefs}</colgroup>
      <thead>
        <tr>{headers}</tr>
      </thead>
    </>
  )
}
