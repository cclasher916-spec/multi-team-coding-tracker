import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const CardRoot: React.FC<CardProps> = ({ hover = false, className = '', children, ...props }) => {
  return (
    <div className={`${hover ? 'transition-shadow hover:shadow-lg' : ''} bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`px-6 pt-6 ${className}`} {...props}>{children}</div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>{children}</h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`px-6 pb-6 ${className}`} {...props}>{children}</div>
);

const Card = Object.assign(CardRoot, { Header: CardHeader, Title: CardTitle, Content: CardContent });

export default Card;
