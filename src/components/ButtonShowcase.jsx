import React from 'react';
import Button from './Button';

const ButtonShowcase = () => {
  return (
    <div className="component-grid">
      <div style={{ padding: '2rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Primary</h3>
        <Button variant="primary">Get Started</Button>
      </div>
      
      <div style={{ padding: '2rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Outline</h3>
        <Button variant="outline">Learn More</Button>
      </div>

      <div style={{ padding: '2rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Ghost</h3>
        <Button variant="ghost">Cancel</Button>
      </div>
    </div>
  );
};

export default ButtonShowcase;
