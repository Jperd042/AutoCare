import React from 'react'
import userEvent from '@testing-library/user-event'
import { act, screen, waitFor, within } from '@testing-library/react'
import { createAppointment, resetOperationsState } from '@autocare/shared'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import AppointmentsWorkspace from '../AppointmentsWorkspace.js'

jest.mock('framer-motion', () => {
  const React = require('react')

  function sanitizeProps(props) {
    const {
      animate,
      exit,
      initial,
      layout,
      transition,
      variants,
      whileHover,
      whileTap,
      ...rest
    } = props

    return rest
  }

  return {
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: new Proxy(
      {},
      {
        get: (_, tag) =>
          React.forwardRef(function MotionMock({ children, ...props }, ref) {
            return React.createElement(tag, { ...sanitizeProps(props), ref }, children)
          }),
      }
    ),
  }
})

describe('AppointmentsWorkspace', () => {
  beforeEach(() => {
    resetOperationsState()
  })

  it('renders a new mobile appointment in the queue and lets an adviser convert it to a job order', async () => {
    const user = userEvent.setup()

    renderWithProviders(<AppointmentsWorkspace />)

    act(() => {
      createAppointment({
        customerId: 'lp1',
        vehicleId: 'v1',
        slot: '2026-04-24T10:00:00',
        chosenServices: ['PMS 10,000 km Package'],
        notes: 'Customer created booking from mobile.',
        shopName: 'CruisersCrib Makati',
      })
    })

    const pendingColumn = screen.getByRole('region', { name: /pending appointments/i })
    const appointmentCard = within(pendingColumn).getByText(/pms 10,000 km package/i).closest('article')

    expect(appointmentCard).not.toBeNull()

    await user.click(within(appointmentCard).getByRole('button', { name: /convert to job order/i }))

    await waitFor(() => {
      const updatedColumn = screen.getByRole('region', { name: /confirmed \/ intake/i })
      const updatedCard = within(updatedColumn)
        .getByText(/pms 10,000 km package/i)
        .closest('article')

      expect(updatedCard).not.toBeNull()
      expect(within(updatedCard).getByText(/job order created/i)).toBeInTheDocument()
    })
  })
})
