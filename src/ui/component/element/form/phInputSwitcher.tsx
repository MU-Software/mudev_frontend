import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { isNil } from 'remeda';

import { calcDDay } from 'util/util';

const flexStyle: React.CSSProperties = {
  margin: '0.25rem 0',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
};

export const PHInputSwitcher: React.FC<{
  disabled: boolean;
  children: React.ReactNode[];
  style?: React.CSSProperties;
  state?: {
    isOptionEnabled: boolean;
    setOptionEnabledAs: (value: boolean) => void;
  },
}> = ({ disabled, children, style, state }) => {
  const [isOptionEnabled, setOptionEnabledAs] = state ? [state.isOptionEnabled, state.setOptionEnabledAs] : useState(false);
  // const [isOptionEnabled, setOptionEnabledAs] = useState(false);

  const childrenElement = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return <>{child}</>;
    return React.cloneElement(child, { ...child.props, disabled: child.props.disabled || disabled || !isOptionEnabled });
  });

  return <div style={{ ...flexStyle, margin: '0.25rem' }}>
    {/* 스위치를 Vertically하게 중앙에 보이게 하기 위해 빈 스타일을 넣어줘야 합니다. 하... 이게 맞나... */}
    <Form.Switch style={{}} disabled={disabled} checked={isOptionEnabled} onChange={() => setOptionEnabledAs(!isOptionEnabled)} />
    <div style={{...flexStyle, ...(style || {}) }}>{childrenElement}</div>
  </div>
}

export const PHSwitchableDatePicker: React.FC<{
  label: string;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onChange ?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, disabled, inputRef, onChange }) => {
  const [isOptionEnabled, setOptionEnabledAs] = useState(false);

  const dday : number | null | undefined = inputRef.current?.valueAsDate && calcDDay(inputRef.current?.valueAsDate);
  let ddayText: React.ReactNode = isOptionEnabled ? <>공백(null)으</> : <></>;
  if (isOptionEnabled && !isNil(dday))
    ddayText = <>{dday === 0 ? '오늘' : (dday < 0 ? `${Math.abs(dday)}일 전으` : `${Math.abs(dday)}일 후`)}</>;

  return <PHInputSwitcher disabled={disabled} state={{isOptionEnabled, setOptionEnabledAs}}>
    <><b>{label}</b>&nbsp;날짜를&nbsp;</>
    <Form.Control ref={inputRef} style={{ maxWidth: '10rem' }} type="date" onChange={onChange} />
    <>&nbsp;{ddayText}로 설정합니다.</>
  </PHInputSwitcher>
};
