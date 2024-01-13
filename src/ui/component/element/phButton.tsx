import React from 'react'
import { Button } from 'react-bootstrap'

import './phButton.css'

// From react-bootstrap
type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light'
export type ButtonVariant =
  | Variant
  | 'link'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-warning'
  | 'outline-info'
  | 'outline-dark'
  | 'outline-light'

interface PHButtonProps {
  variant?: ButtonVariant
  disabled?: boolean
  buttonType?: 'button' | 'submit' | 'reset'
  size?: 'extra-sm' | 'sm' | 'lg'
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  width?: string
  height?: string
  smaller?: boolean
  children?: React.ReactNode
}

const PHButton: React.FC<PHButtonProps> = ({
  variant = 'outline-primary',
  disabled = false,
  buttonType = 'button',
  size = 'sm',
  style = null,
  onClick = null,
  smaller = false,
  children = null,
}) => {
  const commonButtonStyle = {
    margin: '0.25rem',
  }
  const extraSmallButtonStyle = {
    ...commonButtonStyle,
    padding: '0rem 0.25rem',
    fontSize: '0.75rem',
  }

  return (
    <Button
      disabled={disabled ?? undefined}
      onClick={onClick ?? undefined}
      size={(size === 'extra-sm' ? 'sm' : size) ?? undefined}
      type={buttonType ?? undefined}
      variant={variant ?? undefined}
      style={{
        ...(smaller || size === 'extra-sm' ? extraSmallButtonStyle : commonButtonStyle),
        ...(style || {}),
      }}
    >
      {children}
    </Button>
  )
}

// export const PHSpinnerButton = (inProps) => {
//   let props = Object.assign({}, inProps, {});

//   // When props.showSpinner is true, we disable button and show spinner
//   let shouldSpinnerShow = props.showSpinner || false;
//   delete (props.showSpinner);

//   let spinnerElement = props.spinner || <Spinner animation='border' role='status'>
//     {/* visually-hidden is Bootstrap's. */}
//     <span className='visually-hidden'>Loading...</span>
//   </Spinner>;
//   delete (props.spinner);

//   let btnChildElement = props.children || '\u00A0';
//   if (React.Children.count(btnChildElement) > 1)
//     throw Error('PHSpinnerButton accepts only one element for the children.');
//   delete (props.children);

//   // If btnChild is not an DOMElement or reactElement, then wrap it with plain div.
//   if (!(typeof (btnChildElement) == 'object' && (btnChildElement.$$typeof === REACT_ELEMENT_TYPE)))
//     btnChildElement = <div>{btnChildElement}</div>;

//   if (shouldSpinnerShow) {
//     props.disabled = true;
//     if (props.setGrayWhenDisabled) {
//       if ((props.variant || '').startsWith('outline-'))
//         props.variant = 'outline-secondary';
//       else
//         props.variant = 'secondary';
//     }
//   }

//   btnChildElement = React.cloneElement(btnChildElement, {
//     style: {
//       width: 'fit-content',
//       height: 'fit-content',
//       // visibility: shouldSpinnerShow ? 'hidden' : 'visible',
//       opacity: shouldSpinnerShow ? '50%' : '100%',
//     }
//   });
//   spinnerElement = React.cloneElement(spinnerElement, {
//     style: {
//       visibility: shouldSpinnerShow ? 'visible' : 'hidden',
//     }
//   });

//   return <PHButton {...props}>
//     <div className='PHSpinnerButtonChildrenContainer'>
//       {btnChildElement}
//       <div className='PHSpinnerButtonSpinnerContainer'>
//         {spinnerElement}
//       </div>
//     </div>
//   </PHButton>
// }

export { PHButton }
