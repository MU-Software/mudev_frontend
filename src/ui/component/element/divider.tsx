import React from 'react';

const HrStyle: React.CSSProperties = {
  margin: '0 1.5rem',
  padding: '0',
  width: 'calc(100% - 3rem)',
  borderTop: 'var(--border)',
};

interface DividerPropTypes {
  style?: React.CSSProperties
}

export const Divider = ({style}: DividerPropTypes) => <hr style={{ ...HrStyle, ...(style ?? {}) }} />;
