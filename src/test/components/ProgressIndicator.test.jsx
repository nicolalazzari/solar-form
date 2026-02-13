import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressIndicator from '../../components/layout/ProgressIndicator';

describe('ProgressIndicator', () => {
  it('displays correct step count', () => {
    render(<ProgressIndicator currentStep={2} totalSteps={5} />);

    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
  });

  it('calculates percentage correctly', () => {
    render(<ProgressIndicator currentStep={2} totalSteps={5} />);

    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('displays 100% on last step', () => {
    render(<ProgressIndicator currentStep={5} totalSteps={5} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('has accessible progressbar role', () => {
    render(<ProgressIndicator currentStep={3} totalSteps={5} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('updates progress bar width based on percentage', () => {
    render(<ProgressIndicator currentStep={1} totalSteps={4} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle({ width: '25%' });
  });
});
