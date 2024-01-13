import React from 'react'

const HrStyle: React.CSSProperties = {
  margin: '0 1.5rem',
  padding: '0',
  width: 'calc(100% - 3rem)',
  borderTop: 'var(--border-color) 1px solid',
}

interface PHDividerPropTypes {
  style?: React.CSSProperties
}

export const PHDivider = ({ style }: PHDividerPropTypes) => <hr style={{ ...HrStyle, ...(style ?? {}) }} />
