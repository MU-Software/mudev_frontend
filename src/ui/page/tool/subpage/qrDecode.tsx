import React, { useEffect } from 'react';

export const QRDecoderMain: React.FC = (props: {
  parentPropsStateFunc?: () => void;
}) => {
  useEffect(
    () => {
      if (Object.prototype.hasOwnProperty.call(props, 'parentPropsStateFunc')) {
        // Make parent container not to scroll y position.
        // This can fix topbar's weird blur issues.
        props.parentPropsStateFunc({
          topBarProps: { disableBlur: true },
          mainContentProps: { style: { overflowY: 'hidden' } },
        });
      }

      return () => {
        if (Object.prototype.hasOwnProperty.call(props, 'parentPropsStateFunc')) {
          props.parentPropsStateFunc({
            topBarProps: { disableBlur: false },
            mainContentProps: { style: {} },
          });
        }
      };
    }, []);

  const iframeContainerStyle = {
    position: 'relative',
    width: '100%',
    // height: 'calc(100% - 56px)',
    // top: '56px'
    height: 'calc(100% + 1px)',
    top: '-1px'
  }

  const iframeStyle = {
    width: '100%',
    height: '100%',
  }

  return <div style={iframeContainerStyle} {...props}>
    <iframe
      title='QR code decoder page'
      aria-label='QR code decoder page'
      aria-labelledby='QR code decoder page'
      style={iframeStyle}
      sandbox='allow-scripts allow-same-origin'
      src='https://mudev.cc/qrdecode' />
  </div>;
}
