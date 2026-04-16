import { render } from '@testing-library/react'
import { ToastProvider } from '@/components/Toast.jsx'
import { UserProvider } from '@/lib/userContext.jsx'

export function renderWithProviders(ui, options = {}) {
  const { user = null, updateUser = () => {}, ...renderOptions } = options

  return render(
    <ToastProvider>
      <UserProvider user={user} updateUser={updateUser}>
        {ui}
      </UserProvider>
    </ToastProvider>,
    renderOptions
  )
}
