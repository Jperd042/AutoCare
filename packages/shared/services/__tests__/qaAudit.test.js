import { describe, expect, test } from '@jest/globals'
import * as shared from '../../index.js'

describe('qa audit domain', () => {
  test('exports audit status constants and semantic/risk gate helpers', () => {
    expect(shared.AUDIT_STATUS).toEqual({
      PENDING: 'Pending',
      FLAGGED: 'Flagged',
      RESOLVED: 'Resolved',
      APPROVED: 'Approved',
    })
    expect(shared.isSemanticGatePassed?.(0.7)).toBe(true)
    expect(shared.isSemanticGatePassed?.(0.69)).toBe(false)
    expect(shared.isRiskGatePassed?.(3)).toBe(true)
    expect(shared.isRiskGatePassed?.(4)).toBe(false)
  })

  test('suggests approved only when both gates pass', () => {
    expect(
      shared.getSuggestedAuditStatus?.({
        semanticResolutionScore: 0.88,
        inspectionRiskPoints: 1,
      })
    ).toBe('Approved')

    expect(
      shared.getSuggestedAuditStatus?.({
        semanticResolutionScore: 0.62,
        inspectionRiskPoints: 1,
      })
    ).toBe('Flagged')

    expect(
      shared.getSuggestedAuditStatus?.({
        semanticResolutionScore: 0.82,
        inspectionRiskPoints: 5,
      })
    ).toBe('Flagged')
  })

  test('identifies high-risk audit cases from failed gates', () => {
    expect(
      shared.isHighRiskAuditCase?.({
        semanticResolutionScore: 0.64,
        inspectionRiskPoints: 2,
      })
    ).toBe(true)

    expect(
      shared.isHighRiskAuditCase?.({
        semanticResolutionScore: 0.9,
        inspectionRiskPoints: 4,
      })
    ).toBe(true)

    expect(
      shared.isHighRiskAuditCase?.({
        semanticResolutionScore: 0.9,
        inspectionRiskPoints: 2,
      })
    ).toBe(false)
  })
})
