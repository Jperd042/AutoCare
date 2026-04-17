import { render, screen, within } from '@testing-library/react'
import VehicleRecords from '../VehicleRecords'

jest.mock('@/hooks/useVehicles', () => ({
  useVehicles: jest.fn(),
}))

const { useVehicles } = jest.requireMock('@/hooks/useVehicles')

describe('VehicleRecords', () => {
  it('shows fleet summary cards with counts for each status bucket', () => {
    useVehicles.mockReturnValue({
      loading: false,
      vehicles: [
        {
          id: 'veh-1',
          owner: 'Juan dela Cruz',
          plate: 'ABC1234',
          model: 'Toyota Vios',
          type: 'Sedan',
          year: 2021,
          mileage: 41000,
          status: 'active',
        },
        {
          id: 'veh-2',
          owner: 'Maria Santos',
          plate: 'XYZ8821',
          model: 'Honda City',
          type: 'Sedan',
          year: 2020,
          mileage: 56000,
          status: 'maintenance',
        },
        {
          id: 'veh-3',
          owner: 'Pedro Reyes',
          plate: 'LMN9012',
          model: 'Ford Ranger',
          type: 'Pickup',
          year: 2019,
          mileage: 90000,
          status: 'inactive',
        },
      ],
    })

    render(<VehicleRecords />)

    expect(screen.getByText('Fleet Overview')).toBeInTheDocument()
    const totalVehiclesCard = screen.getByText('Total Vehicles').closest('div.card')
    const activeUnitsCard = screen.getByText('Active Units').closest('div.card')
    const inServiceCard = screen.getByText('In Service').closest('div.card')

    expect(totalVehiclesCard).not.toBeNull()
    expect(activeUnitsCard).not.toBeNull()
    expect(inServiceCard).not.toBeNull()
    expect(within(totalVehiclesCard).getByText('3')).toBeInTheDocument()
    expect(within(activeUnitsCard).getByText('1')).toBeInTheDocument()
    expect(within(inServiceCard).getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Needs coordination from the admin team')).toBeInTheDocument()
    expect(screen.getByText('Parked / Inactive')).toBeInTheDocument()
  })
})
