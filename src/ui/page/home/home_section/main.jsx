import React from 'react';

import { ScrollIndicator } from 'src/ui/common/element/scrollIndicator';
import MU8BitLogo from './mu_pixel_logo_8x.png';

import MUFullLogoWebP from './mu_logo_512px.webp';
import MUFullLogoAPNG from './mu_logo_512px.png';
import './main.css';

export const HomeIndexSection = props => <section className='homeIndexSection'>
  <ScrollIndicator className='dummyScrollIndicator' style={{ visibility: 'hidden', }} />
  <div className='targetLogoContainer'>
    <picture className='targetImgLogo'>
      <source srcSet={MUFullLogoWebP} type='image/webp'/>
      <source srcSet={MUFullLogoAPNG} type='image/apng'/>
      <source srcSet={MUFullLogoAPNG} type='image/png'/>
      <img className='targetImgLogo' src={MUFullLogoAPNG} alt='MUsoftware Logo' />
    </picture>
    <br />
    <div className='targetTextLogoContainer'>
      <h1 className='targetTextLogo' {...props}>
        이준영 | <img className='targetTextLogoEng' src={MU8BitLogo} alt='MUsoftware' />
        <p>
          아름답게 해내는 것에 희열을 느끼는 개발자입니다.
        </p>
      </h1>
    </div>
  </div>
  <ScrollIndicator className='scrollIndicator' />
</section>;
