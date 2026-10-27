import React from 'react';

export const CategoryMarquee: React.FC = () => {
  const items = [
    'Digital guides',
    'AI resources',
    'Creator kits',
    'Business templates',
    'Productivity tools',
    'Design assets',
  ];

  // Duplicate for continuous seamless marquee ticker
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="marquee" aria-label="DigiEcom product categories">
      <div className="marquee-track" aria-hidden="true">
        {duplicatedItems.map((item, index) => (
          <span key={index} className="marquee-item">
            <b>✳</b> {item}
          </span>
        ))}
      </div>
    </div>
  );
};
