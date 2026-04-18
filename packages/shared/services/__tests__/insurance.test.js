import { describe, expect, test } from '@jest/globals'
import * as shared from '../../index.js'

describe('insurance inquiry domain', () => {
  test('exports insurance inquiry enums', () => {
    expect(shared.INSURANCE_INQUIRY_TYPE).toEqual({
      CTPL: 'CTPL',
      COMPREHENSIVE: 'Comprehensive',
    })

    expect(shared.INSURANCE_INQUIRY_STATUS).toEqual({
      SUBMITTED: 'Submitted',
      RFQ_PENDING: 'RFQ_Pending',
      QUOTED: 'Quoted',
      APPROVED: 'Approved',
      ISSUED: 'Issued',
    })
  })

  test('derives proof, quote, and issued states from inquiry status', () => {
    expect(shared.canAttachProofOfPayment?.('Quoted')).toBe(true)
    expect(shared.canAttachProofOfPayment?.('Submitted')).toBe(false)

    expect(
      shared.isInsuranceQuoteReady?.({
        status: 'Quoted',
        quotePdfUrl: 'https://mock.autocare.local/quotes/inq-1.pdf',
      })
    ).toBe(true)

    expect(
      shared.isInsuranceQuoteReady?.({
        status: 'RFQ_Pending',
        quotePdfUrl: null,
      })
    ).toBe(false)

    expect(
      shared.isInsuranceIssued?.({
        status: 'Issued',
      })
    ).toBe(true)
  })
})
