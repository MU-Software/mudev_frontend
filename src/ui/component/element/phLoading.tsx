import React from 'react'
import './phLoading.css'

export const PHLoading: React.FC<{
  primaryColor?: React.CSSProperties['borderColor']
  secondaryColor?: React.CSSProperties['borderColor']
  emSize?: number
}> = ({ primaryColor = 'var(--color)', secondaryColor = 'transparent', emSize = 2 }) => {
  const circleStyle: React.CSSProperties = {
    width: `${emSize}em`,
    height: `${emSize / 2}em`,
  }
  const borderStyle: React.CSSProperties = {
    border: `${emSize / 8}em solid ${primaryColor}`,
    borderBottom: `${emSize / 8}em solid ${secondaryColor}`,
    borderRight: `${emSize / 8}em solid ${secondaryColor}`,
  }
  return (
    <div className="phLoading">
      <div className="spinner">
        <div className="circle circle-1" style={circleStyle}>
          <div className="circle-inner" style={borderStyle} />
        </div>
        <div className="circle circle-2" style={circleStyle}>
          <div className="circle-inner" style={borderStyle} />
        </div>
      </div>
    </div>
  )
}
