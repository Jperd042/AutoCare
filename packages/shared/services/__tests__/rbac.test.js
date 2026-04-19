import { describe, expect, test } from '@jest/globals'
import * as shared from '../../index.js'

describe('rbac helpers', () => {
  test('exports the supported role constants', () => {
    expect(shared.ROLE).toEqual({
      SUPER_ADMIN: 'SUPER_ADMIN',
      ADMIN: 'ADMIN',
      SERVICE_ADVISER: 'SERVICE_ADVISER',
      TECHNICIAN: 'TECHNICIAN',
      CUSTOMER: 'CUSTOMER',
    })
  })

  test('returns permission sets and enforces role access', () => {
    const superAdminPermissions = shared.getRolePermissions?.(shared.ROLE?.SUPER_ADMIN)
    expect(Array.isArray(superAdminPermissions)).toBe(true)
    expect(superAdminPermissions).toContain('qa.audit.approve')
    expect(superAdminPermissions).toContain('users.manage.roles')

    expect(shared.hasPermission?.(shared.ROLE?.ADMIN, 'qa.audit.approve')).toBe(true)
    expect(shared.hasPermission?.(shared.ROLE?.SERVICE_ADVISER, 'qa.audit.approve')).toBe(false)
    expect(shared.hasPermission?.(shared.ROLE?.TECHNICIAN, 'job_order.update.own')).toBe(true)
    expect(shared.hasPermission?.(shared.ROLE?.CUSTOMER, 'inventory.manage')).toBe(false)
  })
})
