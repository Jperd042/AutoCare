import React from 'react'
import userEvent from '@testing-library/user-event'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { ROLE } from '@autocare/shared'
import { renderWithProviders } from '@/test/renderWithProviders.jsx'
import SummaryVerificationWorkspace from '../SummaryVerificationWorkspace.js'

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

describe('SummaryVerificationWorkspace', () => {
  it('renders side-by-side notes and lets a reviewer verify a summary', async () => {
    const user = userEvent.setup()

    renderWithProviders(<SummaryVerificationWorkspace />, {
      user: {
        name: 'Renan Castro',
        email: 'admin@cruiserscrib.com',
        role: ROLE.ADMIN,
      },
    })

    expect(screen.getByRole('heading', { name: /layman summary verification/i })).toBeInTheDocument()
    expect(screen.getAllByText(/original technical note/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/customer-facing summary/i).length).toBeGreaterThan(0)

    const draftArticle = screen.getByRole('article', { name: /summary ss3/i })
    await user.click(within(draftArticle).getByRole('button', { name: /verify summary ss3/i }))

    await waitFor(() => {
      expect(within(screen.getByRole('article', { name: /summary ss3/i })).getByText(/verified/i)).toBeInTheDocument()
    })
  })

  it('lets a reviewer edit the generated summary before saving a revision', async () => {
    const user = userEvent.setup()

    renderWithProviders(<SummaryVerificationWorkspace />, {
      user: {
        name: 'Renan Castro',
        email: 'admin@cruiserscrib.com',
        role: ROLE.ADMIN,
      },
    })

    const summaryArticle = screen.getByRole('article', { name: /summary ss2/i })

    await user.click(within(summaryArticle).getByRole('button', { name: /edit summary ss2/i }))

    const editor = screen.getByLabelText(/edit generated summary ss2/i)
    fireEvent.change(editor, {
      target: {
        value: 'We replaced the brake pads and confirmed the car now stops smoothly during final testing.',
      },
    })
    expect(editor).toHaveValue('We replaced the brake pads and confirmed the car now stops smoothly during final testing.')
    await user.click(screen.getByRole('button', { name: /save revision ss2/i }))

    await waitFor(() => {
      const updatedArticle = screen.getByRole('article', { name: /summary ss2/i })
      expect(within(updatedArticle).getByText(/stops smoothly during final testing/i)).toBeInTheDocument()
      expect(within(updatedArticle).getByText(/revised/i)).toBeInTheDocument()
    })
  })
})
