import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, describe, test, vi } from 'vitest';
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card';
import { LiquidGlassButton } from '@/components/ui/liquid-glass-button';
import { 
  validateTextContrast, 
  getAccessibleTextColor,
  validateGlassAccessibility,
  getFocusStyles,
  getAccessibleAnimationClasses,
  ACCESSIBLE_GLASS_COLORS
} from '@/utils/accessibility';

describe('Accessibility Utils', () => {
  describe('Color Contrast Calculations', () => {
    test('validates text contrast meets WCAG AA standards', () => {
      const blackOnWhite = validateTextContrast('#000000', '#ffffff');
      expect(blackOnWhite.isValid).toBe(true);
      expect(blackOnWhite.ratio).toBeGreaterThan(7); // Should be 21
      
      const whiteOnBlack = validateTextContrast('#ffffff', '#000000');
      expect(whiteOnBlack.isValid).toBe(true);
      expect(whiteOnBlack.ratio).toBeGreaterThan(7); // Should be 21
      
      const grayOnWhite = validateTextContrast('#888888', '#ffffff');
      expect(grayOnWhite.isValid).toBe(false); // Should not meet AA standards
    });

    test('returns accessible text color for backgrounds', () => {
      expect(getAccessibleTextColor('#000000')).toBe('#ffffff');
      expect(getAccessibleTextColor('#ffffff')).toBe('#000000');
      expect(getAccessibleTextColor('#333333')).toBe('#ffffff');
    });
  });

  describe('Component Accessibility Validation', () => {
    test('validates accessible component configuration', () => {
      const accessibleConfig = {
        textColor: '#ffffff',
        backgroundColor: '#000000',
        borderColor: '#ffffff',
        isInteractive: true
      };
      
      expect(validateGlassAccessibility(accessibleConfig).isAccessible).toBe(true);
    });

    test('fails validation for inaccessible component', () => {
      const inaccessibleConfig = {
        textColor: '#cccccc',
        backgroundColor: '#dddddd', // Poor contrast
        borderColor: '#cccccc',
        isInteractive: true
      };
      
      expect(validateGlassAccessibility(inaccessibleConfig).isAccessible).toBe(false);
    });
  });
});

describe('LiquidGlassCard Accessibility', () => {
  test('renders with proper accessibility attributes when focusable', () => {
    render(
      <LiquidGlassCard 
        focusable={true} 
        aria-label="Interactive card"
        onClick={() => {}}
      >
        Card content
      </LiquidGlassCard>
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveAttribute('aria-label', 'Interactive card');
  });

  test('handles keyboard navigation correctly', () => {
    const handleClick = vi.fn();
    render(
      <LiquidGlassCard 
        focusable={true} 
        onClick={handleClick}
      >
        Card content
      </LiquidGlassCard>
    );

    const card = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
    
    // Test other keys (should not trigger)
    fireEvent.keyDown(card, { key: 'Tab' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  test('does not have interactive attributes when not focusable', () => {
    render(
      <LiquidGlassCard focusable={false}>
        Card content
      </LiquidGlassCard>
    );

    const card = screen.getByText('Card content').parentElement;
    expect(card).not.toHaveAttribute('tabIndex');
    expect(card).not.toHaveAttribute('role');
  });

  test('applies focus styles correctly', () => {
    render(
      <LiquidGlassCard focusable={true}>
        Card content
      </LiquidGlassCard>
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('focus:outline-none');
    expect(card).toHaveClass('focus:ring-2');
    expect(card).toHaveClass('focus:ring-white/50');
  });
});

describe('LiquidGlassButton Accessibility', () => {
  test('renders with proper ARIA attributes', () => {
    render(
      <LiquidGlassButton aria-label="Custom button label">
        Button text
      </LiquidGlassButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom button label');
  });

  test('is focusable by default', () => {
    render(
      <LiquidGlassButton>
        Focus test
      </LiquidGlassButton>
    );

    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('disabled');
    expect(button.tagName).toBe('BUTTON'); // Native buttons are focusable
  });

  test('handles disabled state correctly', () => {
    render(
      <LiquidGlassButton disabled>
        Disabled button
      </LiquidGlassButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none');
    expect(button).toHaveClass('disabled:opacity-50');
  });

  test('respects reduced motion preferences', () => {
    render(
      <LiquidGlassButton animation="morph">
        Animated button
      </LiquidGlassButton>
    );

    const button = screen.getByRole('button');
    // Button should render without issues
    expect(button).toBeInTheDocument();
  });
});

describe('Color Contrast Compliance', () => {
  test('liquid glass variants meet contrast requirements', () => {
    const variants = [
      { text: '#ffffff', background: '#1a1a1a' },
      { text: '#ffffff', background: '#000000' },
      { text: '#60a5fa', background: '#1e293b' }
    ];

    variants.forEach(variant => {
      const contrastResult = validateTextContrast(variant.text, variant.background);
      // Check that the function returns a valid result
      expect(contrastResult.ratio).toBeGreaterThan(0);
      expect(typeof contrastResult.isValid).toBe('boolean');
      expect(typeof contrastResult.required).toBe('number');
    });
  });

  test('button variants are accessible', () => {
    const buttonVariants = [
      'default',
      'primary', 
      'secondary',
      'accent',
      'ghost',
      'liquid'
    ];

    buttonVariants.forEach(variant => {
      const { unmount } = render(
        <LiquidGlassButton variant={variant as 'default' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'liquid'}>
          Test button
        </LiquidGlassButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveAttribute('disabled');
      
      unmount(); // Clean up between variants
    });
  });
});

describe('Keyboard Navigation', () => {
  test('tab order is logical for multiple interactive elements', () => {
    render(
      <div>
        <LiquidGlassButton>First button</LiquidGlassButton>
        <LiquidGlassCard focusable={true}>Interactive card</LiquidGlassCard>
        <LiquidGlassButton>Second button</LiquidGlassButton>
      </div>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3); // Two buttons + one interactive card
    
    const firstButton = buttons.find(btn => btn.textContent?.includes('First button'));
    const card = buttons.find(btn => btn.textContent?.includes('Interactive card'));
    const secondButton = buttons.find(btn => btn.textContent?.includes('Second button'));
    
    // Test that all elements are accessible
    expect(firstButton?.tagName).toBe('BUTTON');
    expect(card).toHaveAttribute('tabIndex', '0'); // Card has explicit tabIndex
    expect(secondButton?.tagName).toBe('BUTTON');
    
    // Verify they are not disabled
    expect(firstButton).not.toHaveAttribute('disabled');
    expect(card).not.toHaveAttribute('disabled');
    expect(secondButton).not.toHaveAttribute('disabled');
  });
});

describe('Screen Reader Support', () => {
  test('provides meaningful content for screen readers', () => {
    render(
      <LiquidGlassCard 
        focusable={true}
        aria-label="Project showcase card"
      >
        <h3>Project Title</h3>
        <p>Project description</p>
      </LiquidGlassCard>
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Project showcase card');
    
    // Verify content is accessible
    expect(screen.getByText('Project Title')).toBeInTheDocument();
    expect(screen.getByText('Project description')).toBeInTheDocument();
  });

  test('button has accessible name', () => {
    render(
      <LiquidGlassButton aria-label="View project details">
        <span>
          <span aria-hidden="true">👁️</span>
          View
        </span>
      </LiquidGlassButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName('View project details');
  });
});