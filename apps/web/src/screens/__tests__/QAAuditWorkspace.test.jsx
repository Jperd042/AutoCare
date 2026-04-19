import React from 'react'
import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/react'
import { ROLE } from '@autocare/shared'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import QAAuditWorkspace from '../QAAuditWorkspace.js'

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

describe('QAAuditWorkspace', () => {
  it('renders audit cases and lets an admin open details with override actions', async () => {
    const user = userEvent.setup()

    renderWithProviders(<QAAuditWorkspace />, {
      user: {
        name: 'Renan Castro',
        email: 'admin@cruiserscrib.com',
        role: ROLE.ADMIN,
      },
    })

    expect(screen.getByRole('heading', { name: /double-gate qa workspace/i })).toBeInTheDocument()
    expect(screen.getAllByText(/gate 1/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/gate 2/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/jo-2026-003/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /view audit jo-2026-003/i }))

    const dialog = screen.getByRole('dialog', { name: /audit case jo-2026-003/i })

    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText(/initial concern was overheating at idle/i)).toBeInTheDocument()
    expect(within(dialog).getByText(/qa2-engine-bay\.jpg/i)).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /approve case/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /administrative override/i })).toBeEnabled()
  })

  it('disables the administrative override action for non-admin reviewers', async () => {
    const user = userEvent.setup()

    renderWithProviders(<QAAuditWorkspace />, {
      user: {
        name: 'Dennis Ocampo',
        email: 'staff@cruiserscrib.com',
        role: ROLE.SERVICE_ADVISER,
      },
    })

    await user.click(screen.getByRole('button', { name: /view audit jo-2026-003/i }))

    expect(screen.getByRole('button', { name: /administrative override/i })).toBeDisabled()
    expect(screen.getByText(/requires admin or super admin access/i)).toBeInTheDocument()
  })
})
