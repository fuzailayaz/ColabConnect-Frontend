import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIAssistantPage from '../page';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import supabase from '@/utils/supabase';

// Mock the hooks and Supabase client
jest.mock('@/contexts/AuthContext');
jest.mock('@/contexts/ThemeContext');
jest.mock('@/utils/supabase');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('AIAssistantPage', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
  };

  const mockTheme = {
    card: '#ffffff',
    text: '#000000',
    primary: '#0066cc',
    border: '#e5e7eb',
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useTheme as jest.Mock).mockReturnValue({ theme: mockTheme });

    // Reset mocks before each test
    jest.clearAllMocks();

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            {
              id: '1',
              role: 'user',
              content: 'Hello',
              created_at: new Date().toISOString(),
            },
          ],
          error: null,
        }),
      }),
      insert: jest.fn().mockResolvedValue({ data: [{ id: '2', role: 'user', content: 'Test message', created_at: new Date().toISOString() }], error: null }),
    });
  });

  it('renders the AI Assistant page', () => {
    render(<AIAssistantPage />);
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('displays chat messages', async () => {
    render(<AIAssistantPage />);
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('allows sending messages', async () => {
    const { getByPlaceholderText, getByRole } = render(<AIAssistantPage />);
    
    const input = getByPlaceholderText('Type your message...');
    const sendButton = getByRole('button', { name: '' }); // Empty name because it's an icon button
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('shows loading state while sending message', async () => {
    const { getByPlaceholderText, getByRole } = render(<AIAssistantPage />);
    
    const input = getByPlaceholderText('Type your message...');
    const sendButton = getByRole('button', { name: '' });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    expect(screen.getByText('Thinking...')).toBeInTheDocument();

    // Wait for the message to be sent
    await waitFor(() => expect(screen.queryByText('Thinking...')).toBeNull());
  });

  it('handles keyboard input', () => {
    const { getByPlaceholderText } = render(<AIAssistantPage />);
    
    const input = getByPlaceholderText('Type your message...');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(input).toHaveValue('');
  });
});