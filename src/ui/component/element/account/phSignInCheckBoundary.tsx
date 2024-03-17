import React from 'react'
import { Navigate } from 'react-router-dom'

import { useIsSignedIn } from '@local/network/client'
import { PHLoadingPage } from '@local/ui/component/page/phLoadingPage'

const SignInCheckElement: React.FC<React.PropsWithChildren> = (props) => {
  const query = useIsSignedIn()
  return (
    <>
      {!query.data && <Navigate to={`/account/signin?nextURL=${window.location.pathname}`} />}
      {query.isFetched && props.children}
    </>
  )
}

export const SingInCheckBoundary: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <>
      <React.Suspense fallback={<PHLoadingPage description="계정 상태를 확인하는 중이에요..." />}>
        <SignInCheckElement {...props} />
      </React.Suspense>
    </>
  )
}
