import { wrap } from '@suspensive/react'
import { useMutation } from '@tanstack/react-query'
import * as React from 'react'
import { Form } from 'react-bootstrap'
import { Navigate, useNavigate } from 'react-router-dom'

import { signUp, useIsSignedIn } from '@local/network/client'
import { PHPage } from '@local/ui/component/layout/phPage'
import { PHLoadingPage } from '@local/ui/component/page/phLoadingPage'
import { getFormValue } from '@local/util/input_util'

const SignUp = () => {
  const formRef = React.useRef<HTMLFormElement>(null)
  const useGoToLogin = () => useNavigate()('/account/signin')
  const mutation = useMutation({ mutationFn: signUp, mutationKey: ['user', 'signUp'], onSuccess: useGoToLogin })
  const query = useIsSignedIn()
  return (
    <PHPage>
      {query.data && <Navigate to="/" />}
      <Form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (formRef.current)
            mutation.mutate(getFormValue({ form: formRef.current, fieldToExcludeWhenFalse: ['description'] }))
        }}
      >
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

export const SignUpPage = wrap
  .Suspense({ fallback: <PHLoadingPage description="계정 상태를 확인하는 중이에요..." /> })
  .on(SignUp)
