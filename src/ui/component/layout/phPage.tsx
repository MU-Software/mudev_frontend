import React from 'react';

import './phPage.css';

type PHPageProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const PHPage: React.FC<PHPageProps> = props => <div className='phPageContainer'>
  <div className='phPage'>
    {props.children}
  </div>
</div>;
