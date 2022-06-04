import React from 'react';
import { Form } from 'react-bootstrap';

import './muFormText.css';

interface PHFormTextPropTypes {
  className?: string;
  defaultChildren?: string;
  children?: React.ReactNode;
  showOnlyNeeded?: boolean;
}

export const PHFormText = ({ className, defaultChildren, children, showOnlyNeeded }: PHFormTextPropTypes) => {
  if ((typeof (defaultChildren) === 'string' || defaultChildren instanceof String) && defaultChildren.includes('\n'))
    defaultChildren = <div>{defaultChildren.split('\n').map((value) => <>{value}<br /></>)}</div>;

  if ((typeof (children) === 'string' || children instanceof String) && children.includes('\n'))
    children = <div>{children.split('\n').map((value) => <>{value}<br /></>)}</div>;

  return <Form.Text
    className={(children ? 'text-danger ' : 'text-muted ') + 'PHFormGroupText ' + (className ? className : '')}>
    {children || (defaultChildren || (showOnlyNeeded ? '' : '\u00A0'))}
  </Form.Text>
};
