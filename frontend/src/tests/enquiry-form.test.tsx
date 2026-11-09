import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EnquiryForm } from '../components/enquiry/EnquiryForm';
import * as enquiriesApi from '../api/enquiries';

describe('EnquiryForm', () => {
  it('shows validation errors and does not submit when required fields are invalid', async () => {
    const submitSpy = vi.spyOn(enquiriesApi, 'submitEnquiry');
    const user = userEvent.setup();

    render(<EnquiryForm productId="1" productTitle="Mens Cotton Jacket" />);
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(await screen.findByText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('submits the enquiry and shows a thank-you message on success', async () => {
    vi.spyOn(enquiriesApi, 'submitEnquiry').mockResolvedValue({ id: 'abc123', status: 'received' });
    const user = userEvent.setup();

    render(<EnquiryForm productId="1" productTitle="Mens Cotton Jacket" />);

    await user.type(screen.getByLabelText(/^name$/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/^email$/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/^message$/i), 'Is this available in a large?');
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
    expect(enquiriesApi.submitEnquiry).toHaveBeenCalledWith({
      productId: '1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: undefined,
      message: 'Is this available in a large?',
    });
  });

  it('surfaces a server error message and leaves the form editable to retry', async () => {
    vi.spyOn(enquiriesApi, 'submitEnquiry').mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    render(<EnquiryForm productId="1" productTitle="Mens Cotton Jacket" />);

    await user.type(screen.getByLabelText(/^name$/i), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/^email$/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/^message$/i), 'Is this available in a large?');
    await user.click(screen.getByRole('button', { name: /send enquiry/i }));

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send enquiry/i })).toBeEnabled();
  });
});
