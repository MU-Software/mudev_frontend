import React from "react";
import "./phPageSection.css";

type PHPageSectionProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const PHPageSection: React.FC<PHPageSectionProps> = props => <section className='phPageSection'>{props.children}</section>;
