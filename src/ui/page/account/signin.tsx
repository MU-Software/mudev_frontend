import { wrap } from '@suspensive/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import { Form } from 'react-bootstrap'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'

import { signIn, useIsSignedIn } from '@local/network/client'
import { PHButton } from '@local/ui/component/element/phButton'
import { PHPageWithSection } from '@local/ui/component/layout/phPage'
import { PHLoadingPage } from '@local/ui/component/page/phLoadingPage'

const SignIn = () => {
  const formRef = React.useRef<HTMLFormElement>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextURL = searchParams.get('nextURL') || '/'

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ['user', 'signIn'],
    mutationFn: signIn,
    onSuccess: () => {
      navigate(nextURL)
      queryClient.invalidateQueries()
      queryClient.resetQueries()
    },
  })
  const query = useIsSignedIn()
  return (
    <PHPageWithSection>
      {query.data && <Navigate to="/" />}
      <Form
        ref={formRef}
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (formRef.current) mutation.mutate(new FormData(formRef.current))
        }}
        style={{ width: 'var(--width-card-wide)' }}
      >
        <Form.Group>
          <Form.Label>ID / Email</Form.Label>
          <Form.Control required name="username" disabled={mutation.isPending} />
        </Form.Group>
        <Form.Group>
          <Form.Label>비밀번호</Form.Label>
          <Form.Control required name="password" disabled={mutation.isPending} type="password" />
        </Form.Group>
        <Form.Control type="submit" value="로그인" disabled={mutation.isPending} />
        <PHButton
          variant="secondary"
          onClick={() => navigate('/account/signup')}
          style={{ width: '100%', margin: '0', fontWeight: 'bold' }}
        >
          회원가입하기
        </PHButton>
      </Form>
    </PHPageWithSection>
  )
}

export const SignInPage = wrap
  .Suspense({ fallback: <PHLoadingPage description="계정 상태를 확인하는 중이에요..." /> })
  .on(SignIn)
