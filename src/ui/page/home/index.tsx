import { PHPage } from '@local/ui/component/layout/phPage'
import { HomeLogoSection } from './section/logo'
import { UnderConstructionSection } from './section/logo/underConstruction'

export const HomeMain = () => (
  <PHPage>
    <HomeLogoSection />
    <UnderConstructionSection />
  </PHPage>
)
