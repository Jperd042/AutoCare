import { describe, expect, test } from '@jest/globals'
import * as shared from '../../index.js'

describe('service summary domain', () => {
  test('exports summary verification statuses', () => {
    expect(shared.SERVICE_SUMMARY_STATUS).toEqual({
      DRAFT: 'Draft',
      VERIFIED: 'Verified',
      REJECTED: 'Rejected',
      REVISED: 'Revised',
    })
  })

  test('detects verified summaries and finds them by job order', () => {
    const verifiedSummary = {
      id: 'ss-verified',
      jobOrderId: 'JO-2026-001',
      verificationStatus: 'Verified',
    }

    const revisedSummary = {
      id: 'ss-revised',
      jobOrderId: 'JO-2026-002',
      verificationStatus: 'Revised',
    }

    expect(shared.isServiceSummaryVerified?.(verifiedSummary)).toBe(true)
    expect(shared.isServiceSummaryVerified?.(revisedSummary)).toBe(false)
    expect(
      shared.getServiceSummaryForJobOrder?.('JO-2026-001', [
        revisedSummary,
        verifiedSummary,
      ])
    ).toEqual(verifiedSummary)
  })
})
