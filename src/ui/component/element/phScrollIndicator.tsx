import React from 'react'

import './phScrollIndicator.css'

type PHScrollIndicatorProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const PHScrollIndicator: React.FC<PHScrollIndicatorProps> = (props) => (
  <div className="scrollIndicator" {...props}>
    &nbsp;
    <span></span>
    <span></span>
    <span></span>
    아래로 내려주세요
  </div>
)
