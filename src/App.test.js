import { render, screen } from '@testing-library/react';
import App from './App';

test('renders account access heading', () => {
  render(<App />);
  expect(screen.getByText(/account access/i)).toBeInTheDocument();
});
