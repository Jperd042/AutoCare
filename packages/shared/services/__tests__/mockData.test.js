import { describe, expect, test } from '@jest/globals'
import * as shared from '../../index.js'

describe('shared mock data links', () => {
  test('exposes new shared-domain mock arrays', () => {
    expect(Array.isArray(shared.qaAuditCases)).toBe(true)
    expect(Array.isArray(shared.serviceSummaries)).toBe(true)
    expect(Array.isArray(shared.insuranceInquiries)).toBe(true)
  })

  test('contains at least one clean and one high-risk audit case', () => {
    const cleanCase = shared.qaAuditCases?.find((auditCase) => auditCase.auditStatus === 'Approved')
    const highRiskCase = shared.qaAuditCases?.find((auditCase) =>
      shared.isHighRiskAuditCase?.(auditCase)
    )

    expect(cleanCase).toBeDefined()
    expect(shared.isSemanticGatePassed?.(cleanCase?.semanticResolutionScore)).toBe(true)
    expect(shared.isRiskGatePassed?.(cleanCase?.inspectionRiskPoints)).toBe(true)

    expect(highRiskCase).toBeDefined()
    expect(shared.isHighRiskAuditCase?.(highRiskCase)).toBe(true)
  })

  test('links job orders, timeline events, and customer-facing records to valid shared ids', () => {
    const vehicleIds = new Set(shared.vehicles?.map((vehicle) => vehicle.id))
    const customerIds = new Set(shared.loyaltyAccounts?.map((account) => account.id))
    const summaryIds = new Set(shared.serviceSummaries?.map((summary) => summary.id))
    const auditCaseIds = new Set(shared.qaAuditCases?.map((auditCase) => auditCase.id))
    const jobOrderIds = new Set(shared.jobOrders?.map((jobOrder) => jobOrder.id))
    const timelineEventIds = new Set(shared.timelineEvents?.map((event) => event.id))

    shared.qaAuditCases?.forEach((auditCase) => {
      expect(jobOrderIds.has(auditCase.jobOrderId)).toBe(true)
      expect(vehicleIds.has(auditCase.vehicleId)).toBe(true)
      expect(customerIds.has(auditCase.customerId)).toBe(true)
      expect(Array.isArray(auditCase.uploadedEvidence)).toBe(true)
      expect(auditCase.uploadedEvidence.length).toBeGreaterThan(0)
    })

    shared.serviceSummaries?.forEach((summary) => {
      expect(jobOrderIds.has(summary.jobOrderId)).toBe(true)
      expect(timelineEventIds.has(summary.timelineEventId)).toBe(true)
      expect(vehicleIds.has(summary.vehicleId)).toBe(true)
      expect(customerIds.has(summary.customerId)).toBe(true)
    })

    shared.jobOrders?.forEach((jobOrder) => {
      if (jobOrder.qaAuditCaseId) {
        expect(auditCaseIds.has(jobOrder.qaAuditCaseId)).toBe(true)
      }
      if (jobOrder.serviceSummaryId) {
        expect(summaryIds.has(jobOrder.serviceSummaryId)).toBe(true)
      }
    })

    shared.timelineEvents?.forEach((event) => {
      if (event.serviceSummaryId) {
        expect(summaryIds.has(event.serviceSummaryId)).toBe(true)
      }
    })

    shared.insuranceInquiries?.forEach((inquiry) => {
      expect(vehicleIds.has(inquiry.vehicleId)).toBe(true)
      expect(customerIds.has(inquiry.customerId)).toBe(true)
    })
  })
})
