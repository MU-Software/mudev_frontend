import React from 'react'
import { Form } from 'react-bootstrap'

import { FetchMethod } from '@local/network/api.type'
import { PHButton } from '@local/ui/component/element/phButton'
import { PHDivider } from '@local/ui/component/element/phDivider'
import { PHLoading } from '@local/ui/component/element/phLoading'
import {
  PHFoldableBaseStateType,
  PHFoldableComponent,
  PHFoldablePropsType,
  PH_FOLDABLE_BASE_STATE,
} from '@local/ui/component/layout/phFold'

export type PHFormFoldableBasePropsType = PHFoldablePropsType & {
  apiRoute: string
  apiMethod: FetchMethod
  showResetBtn?: boolean
  submitBtnChildren?: React.ReactNode
}

export type PHFormFoldableBaseStateType = PHFoldableBaseStateType
export const PH_FORM_FOLDABLE_BASE_STATE: PHFormFoldableBaseStateType = {
  ...PH_FOLDABLE_BASE_STATE,
  ...({} as PHFormFoldableBaseStateType),
}

export class PHFormFoldableComponent<
  FormAdditionalPropsType = {},
  FormAdditionalStateType = {},
> extends PHFoldableComponent<
  PHFormFoldableBasePropsType & FormAdditionalPropsType,
  PHFormFoldableBaseStateType & FormAdditionalStateType
> {
  private formRef: React.RefObject<HTMLFormElement> = React.createRef()

  constructor(props: PHFormFoldableBasePropsType & FormAdditionalPropsType) {
    super(props)
    this.state = this.getInitialState()
  }

  getInitialState: () => PHFormFoldableBaseStateType & FormAdditionalStateType = () => {
    return { ...PH_FORM_FOLDABLE_BASE_STATE, ...({} as FormAdditionalStateType) }
  }

  handleInputChange: (valueName: string) => React.ChangeEventHandler<HTMLInputElement & HTMLSelectElement> = (
    valueName: string
  ) => {
    return (e) =>
      this.setState((state) => ({
        ...state,
        [valueName]: e.currentTarget.type === 'checkbox' ? e.currentTarget.checked : e.currentTarget.value,
      }))
  }

  forceUpdateUI = () => this.setState((prevState) => ({ ...prevState }))

  getRequestRoute: () => string | undefined = () => this.props.apiRoute

  getRequestData: () => object = () => ({})

  onSubmit: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!this.formRef.current?.checkValidity()) {
      this.formRef.current?.reportValidity()
      return
    }
    this.setState({ ...this.state, isProcessing: true })
  }

  onReset: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (confirm('내용을 정말 초기화하실건가요? 이 작업은 되돌릴 수 없습니다!')) this.setState(this.getInitialState())
  }

  getResultChildren: () => React.ReactNode = () => <></>

  getChildren: () => React.ReactNode = () => {
    const submitBtn = (
      <PHButton
        disabled={this.state.isProcessing}
        buttonType="submit"
        variant="primary"
        onClick={this.onSubmit}
        style={{ margin: '0.25rem 0.25rem 0.25rem 0' }}
      >
        {this.state.isProcessing && <PHLoading />}
        {this.props.submitBtnChildren ?? '제출'}
      </PHButton>
    )
    const resetBtn = (
      <PHButton disabled={this.state.isProcessing} buttonType="submit" variant="danger" onClick={this.onReset}>
        초기화
      </PHButton>
    )

    return (
      <>
        {this.props.children}
        <div className="phFormFoldButtonContainer">
          {submitBtn}
          {this.props.showResetBtn && resetBtn}
        </div>
        <PHDivider style={{ margin: '1.25rem 0', padding: 0, width: '100%' }} />
        {this.getResultChildren()}
      </>
    )
  }

  render() {
    return <Form ref={this.formRef}>{super._render()}</Form>
  }
}
