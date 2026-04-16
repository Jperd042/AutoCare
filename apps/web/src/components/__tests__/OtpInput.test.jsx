import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import OtpInput from '../OtpInput.jsx'

function ControlledOtp({ initialValue = '' }) {
  const [value, setValue] = useState(initialValue)

  return <OtpInput value={value} onChange={setValue} />
}

describe('OtpInput', () => {
  it('renders six inputs for an empty value', () => {
    render(<OtpInput value="" onChange={() => {}} />)

    expect(screen.getAllByLabelText(/OTP digit/i)).toHaveLength(6)
  })

  it('pastes a full code and reports the digits in order', async () => {
    const onChange = jest.fn()

    render(<OtpInput value="" onChange={onChange} />)

    const firstInput = screen.getByLabelText('OTP digit 1')
    fireEvent.paste(firstInput, {
      clipboardData: {
        getData: () => '123456',
      },
    })

    expect(onChange).toHaveBeenCalledWith('123456')
  })

  it('backspace from an empty later box clears the previous digit and moves back', async () => {
    const user = userEvent.setup()

    render(<ControlledOtp initialValue="1234" />)

    const fourthInput = screen.getByLabelText('OTP digit 4')
    const fifthInput = screen.getByLabelText('OTP digit 5')

    await user.click(fifthInput)
    await user.keyboard('{Backspace}')

    expect(fourthInput).toHaveValue('')
    await waitFor(() => expect(fourthInput).toHaveFocus())
  })
})
