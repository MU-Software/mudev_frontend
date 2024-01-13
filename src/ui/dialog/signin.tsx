import { css } from '@emotion/css'
import React from 'react'
import { Form } from 'react-bootstrap'

import { PHDialog } from '@local/ui/component/layout/phDialog'

type SignInDialogPropType = {
  isOpen?: boolean
  closeDialog: () => void
}

const SignInTextInputStyle = css({
  width: '100%',
})

export const PHSignInDialog: React.FC<SignInDialogPropType> = (props) => {
  const formRef = React.useRef<HTMLFormElement>(null)

  const onSubmit = () => {
    formRef.current?.reportValidity()
    formRef.current?.requestSubmit()
  }

  return (
    <PHDialog
      header={<h4>로그인</h4>}
      actions={[
        { children: '취소', variant: 'danger', onClick: props.closeDialog },
        { children: '로그인', variant: 'primary', onClick: onSubmit },
      ]}
      isCancelable
      isOpen={props.isOpen}
      closeDialog={props.closeDialog}
    >
      <Form ref={formRef}>
        <Form.Group>
          <Form.Label>이메일</Form.Label>
          <Form.Control className={SignInTextInputStyle} type="text" placeholder="example@wesang.com" />
        </Form.Group>
        <Form.Group>
          <Form.Label>비밀번호</Form.Label>
          <Form.Control className={SignInTextInputStyle} type="password" placeholder="my_secret_password" />
        </Form.Group>
      </Form>
    </PHDialog>
  )
}
