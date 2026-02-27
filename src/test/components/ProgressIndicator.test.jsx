import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressIndicator from '../../components/layout/ProgressIndicator';

describe('ProgressIndicator', () => {
  it('displays the current stage label', () => {
    render(<ProgressIndicator currentStep={2} totalSteps={5} />);

    expect(screen.getByText('Assessment')).toBeInTheDocument();
  });

  it('renders all five step icons', () => {
    const { container } = render(<ProgressIndicator currentStep={1} totalSteps={5} />);

    const icons = container.querySelectorAll('[class*="stepIcon"]');
    expect(icons.length).toBe(5);
  });

  it('marks completed steps correctly', () => {
    const { container } = render(<ProgressIndicator currentStep={3} totalSteps={5} />);

    const icons = container.querySelectorAll('[class*="stepIcon"]');
    expect(icons[0].className).toContain('completed');
    expect(icons[1].className).toContain('completed');
    expect(icons[2].className).toContain('current');
    expect(icons[3].className).toContain('incomplete');
    expect(icons[4].className).toContain('incomplete');
  });

  it('renders connectors between steps', () => {
    const { container } = render(<ProgressIndicator currentStep={1} totalSteps={5} />);

    const connectors = container.querySelectorAll('[class*="connector"]');
    expect(connectors.length).toBe(4);
  });

  it('marks completed connectors as active', () => {
    const { container } = render(<ProgressIndicator currentStep={3} totalSteps={5} />);

    const connectors = container.querySelectorAll('[class*="connector"]');
    expect(connectors[0].className).toContain('connectorActive');
    expect(connectors[1].className).toContain('connectorActive');
    expect(connectors[2].className).not.toContain('connectorActive');
    expect(connectors[3].className).not.toContain('connectorActive');
  });

  it('shows the last stage label on the final step', () => {
    render(<ProgressIndicator currentStep={5} totalSteps={5} />);

    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
