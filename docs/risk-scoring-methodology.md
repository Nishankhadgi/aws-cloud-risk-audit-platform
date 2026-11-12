# Technology Risk Scoring Methodology

## 1. 5×5 Likelihood and Impact Matrix
Technology risks are calibrated using a standard enterprise 5x5 matrix:

$$ \text{Inherent Risk Score} = \text{Likelihood (1–5)} \times \text{Impact (1–5)} $$

| Likelihood \ Impact | 1: Insignificant | 2: Minor | 3: Moderate | 4: Major | 5: Catastrophic |
|---|---|---|---|---|---|
| **5: Almost Certain** | 5 (Low) | 10 (Med) | 15 (High) | 20 (Critical) | 25 (Critical) |
| **4: Likely** | 4 (Low) | 8 (Med) | 12 (High) | 16 (High) | 20 (Critical) |
| **3: Possible** | 3 (Low) | 6 (Med) | 9 (Med) | 12 (High) | 15 (High) |
| **2: Unlikely** | 2 (Low) | 4 (Low) | 6 (Med) | 8 (Med) | 10 (Med) |
| **1: Rare** | 1 (Low) | 2 (Low) | 3 (Low) | 4 (Low) | 5 (Low) |

## 2. Risk Classification Thresholds
- **Critical (Score 20–25):** Severe existential threat, major data breach of customer claims, regulatory revocation. Immediate 14-day SLA.
- **High (Score 12–19):** Significant vulnerability that could enable lateral movement or regulatory fines. 30-day SLA.
- **Medium (Score 6–11):** Moderate control gap partially mitigated by detective controls. 60-day SLA.
- **Low (Score 1–5):** Minor procedural exception or hardening improvement. 90-day SLA.

## 3. Professional Calibration & Auditor Override
Automated AWS scanner alerts must **not** automatically become final business risk ratings. An auditor must evaluate:
- The presence of compensating detective controls (e.g. GuardDuty machine learning detection, immutable CloudTrail logs).
- Network isolation (e.g. database in a private subnet vs public subnet).
- True business impact (e.g. loss of claims processing vs internal test asset disruption).

