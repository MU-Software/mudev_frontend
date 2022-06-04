import React from 'react';

const HrStyle: React.CSSProperties = {
  margin: 0 + 'px',
  padding: 0 + 'px',
  marginLeft: 1.5 + 'rem',
  marginRight: 1.5 + 'rem',
  width: 'calc(100% - 3rem)',
  borderTop: 'var(--border)',
}

interface DividerPropTypes {
  style?: React.CSSProperties
}

export const Divider = ({style}: DividerPropTypes) => <hr style={{ ...HrStyle, ...(style ?? {}) }} />;
