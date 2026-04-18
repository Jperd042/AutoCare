# AUTOCARE Master System Flow

```mermaid
flowchart TD
  Mobile[Customer Onboarding and Identity]
  Service[Main Service Flow]
  Insurance[Insurance Flow]
  BackJobs[Back Job Flow]
  Ecommerce[E-Commerce Flow]
  Catalog[Shop Product Admin]
  Loyalty[Loyalty and Rewards]
  Staff[Staff Provision]
  Support[Support Flows]

  Mobile --> Service
  Mobile --> Insurance
  Mobile --> Ecommerce
  Service --> BackJobs
  Service --> Loyalty
  Ecommerce --> Loyalty
  Catalog -. publishes .-> Ecommerce
  Staff -. enables .-> Service
  Service -. timeline / analytics / notices .-> Support
  Insurance -. history / notices .-> Support
  Ecommerce -. history / analytics .-> Support
  BackJobs -. lifecycle history .-> Support
```
