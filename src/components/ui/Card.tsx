import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ hover = false, className = '', children, ...props }) => {
  return (
    <div className={`${hover ? 'transition-shadow hover:shadow-lg' : ''} bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
