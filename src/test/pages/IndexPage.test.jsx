import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '../test-utils';
import IndexPage from '../../pages/IndexPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('IndexPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders booking prompt', () => {
    render(<IndexPage />);

    expect(screen.getByText('Would you like to book an appointment online?')).toBeInTheDocument();
  });

  it('renders booking options', () => {
    render(<IndexPage />);

    expect(screen.getByRole('button', { name: /yes, book online/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no thank you/i })).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(<IndexPage />);

    expect(screen.getByText("We'll ask a few quick questions to check your property is suitable.")).toBeInTheDocument();
  });

  it('navigates to address page when "Yes, book online" is clicked', async () => {
    const user = userEvent.setup();
    render(<IndexPage />);

    const bookButton = screen.getByRole('button', { name: /yes, book online/i });
    await user.click(bookButton);

    expect(mockNavigate).toHaveBeenCalledWith('/address');
  });

  it('shows callback confirmation when "No thank you" is clicked', async () => {
    const user = userEvent.setup();
    render(<IndexPage />);

    const noThanksButton = screen.getByRole('button', { name: /no thank you/i });
    await user.click(noThanksButton);

    expect(screen.getByText('0800 112 3110')).toBeInTheDocument();
    expect(screen.getByText(/You'll receive a call in the next 10 minutes/)).toBeInTheDocument();
  });
});
