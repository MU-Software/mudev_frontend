import * as React from 'react'

import { signIn } from '@local/network/client'
import { PHPage } from '@local/ui/component/layout/phPage'
import { useMutation } from '@tanstack/react-query'
import { Form } from 'react-bootstrap'

export const SignInPage = () => {
  const formRef = React.useRef<HTMLFormElement>(null)
  const mutation = useMutation({ mutationFn: signIn, mutationKey: ['user', 'signIn'] })

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!formRef.current) return
    mutation.mutate(new FormData(formRef.current))
  }

  return (
    <PHPage>
      <Form ref={formRef} onSubmit={onSubmit}>
        <Form.Group>
          <Form.Label>이메일</Form.Label>
          <Form.Control required name="username" disabled={mutation.isPending} />
        </Form.Group>
        <Form.Group>
          <Form.Label>비밀번호</Form.Label>
          <Form.Control required name="password" disabled={mutation.isPending} type="password" />
        </Form.Group>
        <Form.Control type="submit" value="로그인" />
      </Form>
    </PHPage>
  )
}
