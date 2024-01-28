import { wrap } from '@suspensive/react'
import { useMutation } from '@tanstack/react-query'
import * as React from 'react'
import { Form } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'

import { signIn, useIsSignedIn } from '@local/network/client'
import { PHPage } from '@local/ui/component/layout/phPage'
import { PHLoadingPage } from '@local/ui/component/page/phLoadingPage'

const SignIn = () => {
  const formRef = React.useRef<HTMLFormElement>(null)
  const useGoToHome = () => useNavigate()('/')
  const mutation = useMutation({ mutationFn: signIn, mutationKey: ['user', 'signIn'], onSuccess: useGoToHome })
  const query = useIsSignedIn()
  return (
    <PHPage>
      {query.data && <Navigate to="/" />}
      <Form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (formRef.current) mutation.mutate(new FormData(formRef.current))
        }}
      >
        <Form.Group>
          <Form.Label>ID / Email</Form.Label>
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

export const SignInPage = wrap
  .Suspense({ fallback: <PHLoadingPage description="계정 상태를 확인하는 중이에요..." /> })
  .on(SignIn)
