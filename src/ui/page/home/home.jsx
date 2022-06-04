import React from 'react';

import { HomeIndexSection } from './home_section/main';
import { HomeIntroduceSection } from './home_section/introduce';
import { HomeMySkillsSection } from './home_section/my_skills';
import { HomeProjectsByMUSection } from './home_section/projects';
import { HomeFooterSection } from './home_section/footer';
import './home.css';

export const GlowHome = () => {
  return <div className='homePageContainer'>
    <div className='homePage'>
      <HomeIndexSection />

      <HomeIntroduceSection />
      <HomeMySkillsSection />
      <HomeProjectsByMUSection />

      <HomeFooterSection />
    </div>
  </div>
};
