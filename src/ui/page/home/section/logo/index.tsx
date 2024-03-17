import React from 'react'

import MU8BitLogo from '@local/asset/image/logo/mu_pixel_logo_8x.png'
import { PHScrollIndicator } from '@local/ui/component/element/phScrollIndicator'
import { PHPageSection } from '@local/ui/component/layout/phPageSection'

import MUFullLogoAPNG from '@local/asset/image/logo/mu_logo_512px.png'
import MUFullLogoWebP from '@local/asset/image/logo/mu_logo_512px.webp'
import './index.css'

export const HomeLogoSection: React.FC = () => (
  <PHPageSection className="homeIndexSection">
    <div className="targetLogoContainer">
      <picture className="targetImgLogo">
        <source srcSet={MUFullLogoWebP} type="image/webp" />
        <source srcSet={MUFullLogoAPNG} type="image/apng" />
        <source srcSet={MUFullLogoAPNG} type="image/png" />
        <img className="targetImgLogo" src={MUFullLogoAPNG} alt="MUsoftware Logo" />
      </picture>
      <br />
      <div className="targetTextLogoContainer">
        <h1 className="targetTextLogo">
          <div className="targetTextLogoKor">이준영&nbsp;|&nbsp;</div>
          <img className="targetTextLogoEng" src={MU8BitLogo} alt="MUsoftware" />
        </h1>
      </div>
    </div>
    <PHScrollIndicator className="scrollIndicator" />
  </PHPageSection>
)
