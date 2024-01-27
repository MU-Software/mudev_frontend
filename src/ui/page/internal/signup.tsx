import * as React from 'react'

import { signUp } from '@local/network/client'
import { PHPage } from '@local/ui/component/layout/phPage'
import { getFormValue } from '@local/util/input_util'
import { useMutation } from '@tanstack/react-query'
import { Form } from 'react-bootstrap'

export const SignUpPage = () => {
  const formRef = React.useRef<HTMLFormElement>(null)
  const mutation = useMutation({ mutationFn: signUp, mutationKey: ['user', 'signUp'] })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!formRef.current) return
    mutation.mutate(getFormValue({ form: formRef.current, fieldToExcludeWhenFalse: ['description'] }))
  }

  return (
    <PHPage>
      <Form ref={formRef} onSubmit={onSubmit}>
        <Form.Group>
          <Form.Label>이메일</Form.Label>
          <Form.Control required name="email" disabled={mutation.isPending} type="email" />
        </Form.Group>
        <Form.Group>
          <Form.Label>이름</Form.Label>
          <Form.Control required name="username" disabled={mutation.isPending} />
        </Form.Group>
        <Form.Group>
          <Form.Label>별칭</Form.Label>
          <Form.Control required name="nickname" disabled={mutation.isPending} />
        </Form.Group>
        <Form.Group>
          <Form.Label>비밀번호</Form.Label>
          <Form.Control required name="password" disabled={mutation.isPending} type="password" />
        </Form.Group>
        <Form.Group>
          <Form.Label>비밀번호 다시 입력</Form.Label>
          <Form.Control required name="password_confirm" disabled={mutation.isPending} type="password" />
        </Form.Group>
        <Form.Group>
          <Form.Label>설명</Form.Label>
          <Form.Control name="description" disabled={mutation.isPending} as="textarea" />
        </Form.Group>
        <Form.Control type="submit" value="로그인" />
      </Form>
    </PHPage>
  )
}
