import React from 'react';
import Icon from '@mdi/react';
import { mdiEmailOutline, mdiTwitter, mdiGithub } from '@mdi/js';

import './footer.css';

export const HomeFooterSection = props => {
  const generateEmailAddress = (event) => {
    let target = event.target.hasAttribute('dataset') ? event.target : event.target.parentElement;
    let dataset = target.dataset;
    target.href = 'mailto:' + dataset.name + '@' + dataset.domain + '.' + dataset.tld;
  };

  const generateRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  };

  return <footer className='homeFooterSection' {...props}>
    &copy; MUsoftware, 2022&nbsp;&nbsp;|&nbsp;&nbsp;
    <a href='https://github.com/MU-Software'>
      <Icon className='homeFooterSectionIcon' path={mdiGithub} alt='Go to MUsoftware Github Page' />
    </a>&nbsp;&nbsp;
    <a href='https://twitter.com/MUsoftware'>
      <Icon className='homeFooterSectionIcon' path={mdiTwitter} alt='Go to MUsoftware twitter account' />
    </a>&nbsp;&nbsp;
    <a href="#"
      data-name="musoftware"
      data-domain="mudev"
      data-tld="cc"
      onClick={(e) => generateEmailAddress(e)} >
      <Icon className='homeFooterSectionIcon' path={mdiEmailOutline} alt='Mail to MUsoftware' />
    </a>&nbsp;&nbsp;
    <br />
    <div className='taglineContainer'>
      {
        (generateRandomInt(0, 10) === 1)
          ? <a
            target='_blank'
            rel='noopener noreferrer'
            href='https://youtu.be/CZ9VcBs8H2Y'
            className='tagline'>On est en vie, il faut danser</a>
          : <div className='tagline'>People with right faith and possibility change the world.</div>
      }
    </div>
  </footer>;
};
