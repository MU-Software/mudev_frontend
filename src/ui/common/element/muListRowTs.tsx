// FIXME: MOVE THIS TO TSX
/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */

import React from 'react';
import { PHButton } from "./muButton";

const REACT_ELEMENT_TYPE = (typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) || 0xeac7;
const LISTROW_DEFAULT_LABEL_WIDTH = 10;
const LISTROW_MIN_ITEM_WIDTH = 15;

const TextCutStyle: React.CSSProperties = {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
}

const ListRowStyle: React.CSSProperties = {
  marginLeft: 2 + 'vw',
  marginRight: 2 + 'vw',
  padding: 8 + 'px',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  borderBottom: '1px solid #ddd',
}

const ListRowAsHeaderStyle: React.CSSProperties = {
  ...ListRowStyle,
  fontWeight: 'bold',
  borderTop: null,
  borderBottom: '2px solid #ddd',
}

const ListRowItemStyle: React.CSSProperties = {
  ...TextCutStyle,
  flexGrow: 1,
  width: 100 + '%',
}


export class ListRowLongTextType {
  constructor(
    public text: string)
}
export const L = ListRowLongTextType;

export class ListRowInputType {
  name: string;
  placeholder: string;
  type: string;
  onChange: any;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  /** @type { Object } */
  state;

  innerValue?: string;

  pattern?: string;
  minLength?: number;
  maxLength?: number;

  min?: number;
  max?: number;
  step?: number;

  /**
   * Set visual variants of button.
   * "variant" is for input[type=("button"|"reset"|"submit")]
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'light' | 'dark' | 'link';
  /**
   * Set button size.
   * "size" is for input[type=("button"|"reset"|"submit")]
   */
  size?: 'lg' | 'sm' | 'extra-sm';

  constructor({
    name,
    placeholder = '',
    type = 'text',
    onChange = null,
    disabled = false,
    readonly = false,
    required = false,
    state = null,

    innerValue = null,
    pattern = null,
    // min/max length of string input
    minLength = null, maxLength = null,
    // For input[type="number"]
    min = null, max = null, step = null,

    // For input[type=("button"|"reset"|"submit")]
    variant = null, size = null,
  }) {
    this.name = name;
    this.placeholder = placeholder;
    this.type = type;
    this.onChange = onChange;
    this.disabled = disabled;
    this.readonly = readonly;
    this.required = required;
    this.state = state;

    this.innerValue = innerValue;

    this.pattern = pattern;
    this.minLength = minLength;
    this.maxLength = maxLength;

    this.min = min;
    this.max = max;
    this.step = step;

    this.variant = variant;
    this.size = size;

    Object.preventExtensions(this);
  }

  static n(param) {
    return new ListRowInputType(param);
  }
}

export class ListRowButtonType {
  name: string;
  innerValue: React.ReactNode;
  type: string;
  onClick: any;
  disabled: boolean;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'light' | 'dark' | 'link';
  size: 'lg' | 'sm' | 'extra-sm';

  constructor({
    name,
    innerValue = 'Submit',
    type = 'button',
    onClick = null,
    disabled = false,
    variant = null,
    size = null,
  }) {
    this.name = name;
    this.innerValue = innerValue;
    this.type = type;
    this.onClick = onClick;
    this.disabled = disabled;
    this.variant = variant;
    this.size = size;

    Object.preventExtensions(this);
  }

  static n(param) {
    return new ListRowButtonType(param);
  }
}

export const ListRow = (props) => {
  const randomId = Math.random().toString(36).substr(2, 11);
  const rowStyle = Object.assign(
    {},
    props.header ? ListRowAsHeaderStyle : ListRowStyle,
    props.style || {});
  const enableLabel = !props.noLabel && props.label;

  /** @type Array */
  let childrenElement = props.children || [];
  if (!Array.isArray(childrenElement))
    childrenElement = [childrenElement,];

  /** @type number[] */
  let itemWidthCollection = props.itemWidth || [];
  // Check if all values in array are number
  if (!Array.isArray(itemWidthCollection) || !itemWidthCollection.every((e) => typeof e === 'number'))
    itemWidthCollection = [enableLabel ? LISTROW_DEFAULT_LABEL_WIDTH : 0,];
  if (itemWidthCollection.length === 0)
    itemWidthCollection.push(enableLabel ? LISTROW_DEFAULT_LABEL_WIDTH : 0);

  const targetLen = childrenElement.length + 1;
  const currLen = itemWidthCollection.length;
  if (currLen < targetLen) {
    const definedWidth = itemWidthCollection.reduce((a, b) => a + b, 0) + (LISTROW_MIN_ITEM_WIDTH * (targetLen - currLen));
    if (definedWidth > 100)
      itemWidthCollection = itemWidthCollection.map((e) => e / definedWidth * 100);

    const oobWidth = (100 - itemWidthCollection.reduce((a, b) => a + b, 0)) / (targetLen - currLen);
    while (itemWidthCollection.length < targetLen) {
      itemWidthCollection.push(oobWidth);
    }
  }

  return <div
    className={props.className ?? ''}
    style={rowStyle}
    onClick={props.onClick || null}>
    {
      enableLabel && <label htmlFor={randomId} style={{ ...ListRowItemStyle, width: itemWidthCollection[0] + '%' }}>
        {props.label || ''}
      </label>
    }
    {
      childrenElement.map((obj, idx, arr) => {
        const attrCollection = {
          id: idx === 0 ? randomId : randomId + idx,
          htmlFor: idx !== childrenElement.length - 1 ? randomId + (idx + 1) : null,
          width: itemWidthCollection[idx + 1] + '%',
          style: {
            ...ListRowItemStyle,
            ...((typeof obj === 'string')
              ? {
                textAlign: 'center',
              } : {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }),
            width: itemWidthCollection[idx + 1] + '%',
            ...((typeof (obj) === 'object' && (obj.$$typeof === REACT_ELEMENT_TYPE))
              ? obj.props.style : {}),
          },
        }

        if (obj instanceof ListRowInputType) {
          if (obj.state === undefined || obj.state === null)
            obj.state = {}

          // input ????????? checkbox?????? radio, select??? ?????? ???????????????
          if (obj.type === 'checkbox') {
            return <input
              {...attrCollection}
              type={obj.type}
              name={obj.name}
              disabled={obj.disabled}
              checked={obj.state[obj.name]}
              onChange={obj.onChange(obj.name)} />;
          } else if (obj.type === 'radio') {
            return <input
              {...attrCollection}
              type={obj.type}
              name={obj.name}
              disabled={obj.disabled}
              value={obj.innerValue}
              onChange={obj.onChange(obj.name)} />;
          } else if (obj.type === 'textarea') {
            const autoGrow = (e) => { e.target.style.height = 'inherit'; e.target.style.height = (e.target.scrollHeight + 20) + 'px'; };
            delete (attrCollection.style.textOverflow);
            delete (attrCollection.style.overflow);
            delete (attrCollection.style.whiteSpace);

            return <textarea
              {...attrCollection}
              type={obj.type}
              name={obj.name}
              placeholder={obj.placeholder}
              disabled={obj.disabled}
              readOnly={obj.readonly}
              value={obj.state[obj.name]}
              onInput={(e) => autoGrow(e)}
              onChange={obj.onChange(obj.name)}

              minLength={obj.minLength} maxLength={obj.maxLength}
              pattern={obj.pattern}
            />;
          } else if (obj.type === 'select') {
            let optionValue = obj.value;
            let optionValueText = obj.innerValue;
            if (!Array.isArray(optionValue))
              optionValue = [optionValue,];
            if (!Array.isArray(optionValueText))
              optionValueText = [optionValueText];

            return <select
              {...attrCollection}
              disabled={obj.disabled}
              name={obj.name}>
              {optionValue.map((o, i, a) => <option value={optionValue}>{optionValueText[i] || ''}</option>)}
            </select>
          } else if (obj.type === 'button' || obj.type === 'submit' || obj.type === 'reset') {
            return <PHButton
              {...attrCollection}
              disabled={obj.disabled}
              onClick={obj.onChange(obj.name)}
              size={obj.size}
              type={obj.type}
              variant={obj.variant} >
              {obj.innerValue}
            </PHButton>;
          } else {
            return <input
              {...attrCollection}
              type={obj.type}
              name={obj.name}
              placeholder={obj.placeholder}
              disabled={obj.disabled}
              readOnly={obj.readonly}
              value={obj.state[obj.name]}
              onChange={obj.onChange(obj.name)}

              min={obj.min} max={obj.max} step={obj.step}
              minLength={obj.minLength} maxLength={obj.maxLength}
              pattern={obj.pattern}
            />;
          }
        } else if (obj instanceof ListRowButtonType) {
          return <PHButton
            {...attrCollection}
            disabled={obj.disabled}
            onClick={obj.onClick(obj.name)}
            size={obj.size}
            type={obj.type}
            variant={obj.variant} >
            {obj.innerValue}
          </PHButton>;
        } else if (obj instanceof ListRowLongTextType) {
          delete (attrCollection.style.textOverflow);
          delete (attrCollection.style.overflow);
          delete (attrCollection.style.whiteSpace);
          attrCollection.style.wordBreak = 'keep-all';
          attrCollection.style.textAlign = 'start'

          return <div {...attrCollection}>{obj.text}</div>;
        } else if (obj === null || obj === undefined) {
          return <div {...attrCollection}></div>;
        } else if (typeof (obj) === 'string' || typeof (obj) === 'number' || typeof (obj) === 'bigint') {
          return <div {...attrCollection}>{obj}</div>;
        } else if (typeof (obj) === 'boolean') {
          return <div {...attrCollection}>{obj ? 'true' : 'false'}</div>;
        } else if (typeof (obj) === 'object' && (obj.$$typeof === REACT_ELEMENT_TYPE)) {
          return React.cloneElement(obj, attrCollection);
        } else {
          return obj;
        }
      })
    }
  </div>;
}
