import { wrap } from '@suspensive/react'
import { Navigate } from 'react-router-dom'

import { isSignedIn, signOut } from '@local/network/client'
import { PHPage } from '@local/ui/component/layout/phPage'
import { PHLoadingPage } from '@local/ui/component/page/phLoadingPage'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

export const SignOutPage = wrap.Suspense({ fallback: <PHLoadingPage description="로그아웃 중이에요..." /> }).on(() => {
  const queryClient = useQueryClient()
  const query = useSuspenseQuery({
    queryKey: ['user', 'signOut'],
    queryFn: async () => {
      if (await isSignedIn()) {
        await signOut()
        queryClient.resetQueries({ queryKey: ['user'] })
      }
      return true
    },
  })

  return (
    <PHPage>
      <section>
        <aside>{query.data && <Navigate to="/" />}</aside>
      </section>
    </PHPage>
  )
})
