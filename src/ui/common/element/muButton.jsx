// FIXME: MOVE THIS TO TSX
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */

import React from 'react';
import { Button, Spinner } from "react-bootstrap";

import './muButton.css'

const REACT_ELEMENT_TYPE = (typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) || 0xeac7;

export const PHButton = (props) => {
  let variant = props.variant || 'outline-primary';
  let buttonDisabled = props.disabled || false;
  let buttonType = props.type || 'button'
  let buttonSize = (props.size === 'extra-sm' ? 'sm' : props.size) ?? 'sm'
  let buttonStyle = (props.smaller || props.size === 'extra-sm')
    ? {
      margin: 0.25 + 'rem',
      width: props.width,
      height: props.height,
      padding: '0rem 0.25rem',
      fontSize: 0.75 + 'rem',
      ...(props.style || {}),
    }
    : {
      margin: 0.25 + 'rem',
      width: props.width,
      height: props.height,
      ...(props.style || {}),
    };

  let attrCollection = {
    disabled: buttonDisabled,
    onClick: props.onClick,
    size: buttonSize,
    style: buttonStyle,
    type: buttonType,
    variant: variant,
  }

  return <Button {...attrCollection}>
    {props.children}
  </Button>
};

export const PHSpinnerButton = (inProps) => {
  let props = Object.assign({}, inProps, {});

  // When props.showSpinner is true, we disable button and show spinner
  let shouldSpinnerShow = props.showSpinner || false;
  delete (props.showSpinner);

  let spinnerElement = props.spinner || <Spinner animation="border" role="status">
    {/* visually-hidden is Bootstrap's. */}
    <span className="visually-hidden">Loading...</span>
  </Spinner>;
  delete (props.spinner);

  let btnChildElement = props.children || '\u00A0';
  if (React.Children.count(btnChildElement) > 1)
    throw Error('PHSpinnerButton accepts only one element for the children.');
  delete (props.children);


  // If btnChild is not an DOMElement or reactElement, then wrap it with plain div.
  if (!(typeof (btnChildElement) == 'object' && (btnChildElement.$$typeof === REACT_ELEMENT_TYPE)))
    btnChildElement = <div>{btnChildElement}</div>;

  if (shouldSpinnerShow) {
    props.disabled = true;
    if (props.setGrayWhenDisabled) {
      if ((props.variant || '').startsWith('outline-'))
        props.variant = 'outline-secondary';
      else
        props.variant = 'secondary';
    }
  }

  btnChildElement = React.cloneElement(btnChildElement, {
    style: {
      width: 'fit-content',
      height: 'fit-content',
      // visibility: shouldSpinnerShow ? 'hidden' : 'visible',
      opacity: shouldSpinnerShow ? '50%' : '100%',
    }
  });
  spinnerElement = React.cloneElement(spinnerElement, {
    style: {
      visibility: shouldSpinnerShow ? 'visible' : 'hidden',
    }
  });

  return <PHButton {...props}>
    <div className='PHSpinnerButtonChildrenContainer'>
      {btnChildElement}
      <div className='PHSpinnerButtonSpinnerContainer'>
        {spinnerElement}
      </div>
    </div>
  </PHButton>
}
