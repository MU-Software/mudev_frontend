import { mdiClipboardPulseOutline } from '@mdi/js'
import { ErrorBoundary } from '@suspensive/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import React from 'react'
import { UAParser } from 'ua-parser-js'

import { deleteSignInHistory, fetchAllSignedInHistories } from '@local/network/route/user'
import { SingInCheckBoundary } from '@local/ui/component/element/account/phSignInCheckBoundary'
import { PHButton, PHIconOverlayButton } from '@local/ui/component/element/phButton'
import { PHLoading } from '@local/ui/component/element/phLoading'
import { TableHead, TableHeadItem } from '@local/ui/component/element/phTableHeader'
import { PHPageWithSection } from '@local/ui/component/layout/phPage'
import { formatDateTimeToKorean } from '@local/util/string_util'

const SignInHistoryRow = () => {
  const query = useSuspenseQuery({ queryKey: ['user', 'signInStatus', 'query'], queryFn: fetchAllSignedInHistories })
  const mutation = useMutation({
    mutationKey: ['user', 'signInStatus', 'delete'],
    mutationFn: deleteSignInHistory,
    onSuccess: () => query.refetch(),
  })
  return query.data
    .filter((v) => !v.deleted_at && new Date(v.expires_at) > new Date())
    .map((v, i) => {
      const userAgent = new UAParser(v.user_agent).getResult()
      const userOS = userAgent.os.name === 'Mac OS' ? 'macOS' : userAgent.os.name
      const userDevice = userAgent.os.name ? userOS : userAgent.device.type ?? '알 수 없음'
      const userAgentString = `${userAgent.browser.name ?? '알 수 없는'} 브라우저 ( ${userDevice} )`

      const copyUserAgent = () => {
        navigator.clipboard.writeText(v.user_agent)
        alert('클립보드에 복사되었습니다.')
      }
      return (
        <tr key={i}>
          <td>{formatDateTimeToKorean(new Date(v.created_at))}</td>
          <td>
            <abbr title={v.user_agent}>{userAgentString}</abbr>&nbsp;
            <PHIconOverlayButton iconSize={1} icon={mdiClipboardPulseOutline} onClick={copyUserAgent} label="복사" />
          </td>
          <td>
            <PHButton onClick={() => mutation.mutate(v.uuid)} disabled={mutation.isPending}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}>
                <div>로그아웃</div>
                {mutation.isPending && <PHLoading emSize={0.8} />}
              </div>
            </PHButton>
          </td>
        </tr>
      )
    })
}

export const SignInHistoryPage = () => {
  const tableDef: TableHeadItem[] = [
    { label: '로그인 일시', width: 20 },
    { label: 'User-Agent', width: 50 },
    { label: '해당 기기 로그아웃', width: 30 },
  ]
  const FullRow: React.FC<{ label: string }> = ({ label }) => (
    <tr>
      <td colSpan={tableDef.length}>{label}</td>
    </tr>
  )

  return (
    <PHPageWithSection>
      <SingInCheckBoundary>
        <aside style={{ width: 'var(--width-card-wide)' }}>
          <table style={{ maxWidth: '100%', width: '100%' }}>
            <TableHead items={tableDef} />
            <tbody>
              <ErrorBoundary fallback={<FullRow label="에러가 발생했어요..." />}>
                <React.Suspense fallback={<FullRow label="로딩 중입니다..." />}>
                  <SignInHistoryRow />
                </React.Suspense>
              </ErrorBoundary>
            </tbody>
          </table>
        </aside>
      </SingInCheckBoundary>
    </PHPageWithSection>
  )
}
