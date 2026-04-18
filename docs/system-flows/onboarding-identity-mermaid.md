# Onboarding and Identity Flow

```mermaid
flowchart TD
  Entry[Mobile Entry] --> Register[Register]
  Register --> Verify[Identity Verification / OTP Activation]
  Verify --> Active[Account Active]
  Active --> Profile[Profile Setup]
  Profile --> Vehicle[Add Vehicle]
  Vehicle --> Home[Customer Home]

  Home --> Book[Book Service]
  Home --> Inquiry[Insurance Inquiry]
  Home --> Shop[Shop Catalog]
  Home --> Rewards[Loyalty and Rewards]
  Home --> History[Timeline / History]
```
