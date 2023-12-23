import React from 'react';

import { Divider } from '@ui/component/element/divider';

import './phFold.css';

export type PHFoldablePropsType = {
  title: React.ReactNode;
  description: React.ReactNode;
  open: boolean;
  onFoldSwitch: React.MouseEventHandler<HTMLElement>;
  foldRef?: React.RefObject<HTMLDetailsElement>;
  children: React.ReactNode;
};

export type PHFoldableBaseStateType = {
  isProcessing: boolean;
};

export const PH_FOLDABLE_BASE_STATE = {
  isProcessing: false,
} satisfies PHFoldableBaseStateType;

export class PHFoldableComponent<
  AdditionalPropsType = {},
  AdditionalStateType = {},
> extends React.Component<
  PHFoldablePropsType & AdditionalPropsType,
  PHFoldableBaseStateType & AdditionalStateType
> {
  readonly defaultAdditionalState: AdditionalStateType = {} as AdditionalStateType;

  constructor(props: PHFoldablePropsType & AdditionalPropsType) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState: () => PHFoldableBaseStateType & AdditionalStateType = () => (
    { ...PH_FOLDABLE_BASE_STATE, ...this.defaultAdditionalState as AdditionalStateType }
  );

  forceUpdateUI = () => this.setState(prevState => ({ ...prevState }));

  getChildren: () => React.ReactNode = () => this.props.children;

  _render() {
    return <details open={this.props.open} ref={this.props.foldRef}>
      {/* Title */}
      <summary className='h4' onClick={this.props.onFoldSwitch}>
        <h4 style={{ display: 'inline' }}>{this.props.title}</h4>
      </summary>
      {/* Description */}
      <div className='phFoldDescription'>{this.props.description}</div>
      <Divider style={{ margin: '1.25rem 0', padding: 0, width: '100%' }} />

      {/* Children */}
      {this.getChildren()}
    </details>;
  }

  render() {
    return React.createElement("aside", {}, this._render()) as JSX.Element;
  }
}
