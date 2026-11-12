"""Technology Risk Scoring Engine utilizing 5x5 Likelihood and Impact Matrix."""

from typing import Dict, Any, Tuple

class RiskScoringEngine:
    """Calculates inherent and residual risk scores using standard 5x5 enterprise matrix."""

    LIKELIHOOD_LABELS = {
        1: "Rare",
        2: "Unlikely",
        3: "Possible",
        4: "Likely",
        5: "Almost Certain"
    }

    IMPACT_LABELS = {
        1: "Insignificant",
        2: "Minor",
        3: "Moderate",
        4: "Major",
        5: "Catastrophic"
    }

    @classmethod
    def calculate_score(cls, likelihood: int, impact: int) -> Tuple[int, str]:
        """Calculates numerical score (1-25) and severity classification."""
        if not (1 <= likelihood <= 5 and 1 <= impact <= 5):
            raise ValueError(f"Likelihood ({likelihood}) and Impact ({impact}) must be between 1 and 5.")

        score = likelihood * impact
        if score >= 20:
            classification = "CRITICAL"
        elif score >= 12:
            classification = "HIGH"
        elif score >= 6:
            classification = "MEDIUM"
        else:
            classification = "LOW"

        return score, classification

    @classmethod
    def evaluate_residual_risk(
        cls,
        inherent_likelihood: int,
        inherent_impact: int,
        control_effectiveness: str
    ) -> Dict[str, Any]:
        """Computes residual risk taking into account audit control testing conclusions."""
        inherent_score, inherent_class = cls.calculate_score(inherent_likelihood, inherent_impact)

        # Control effectiveness mitigates likelihood and partially impact
        reduction_factor = {
            "PASS": 0.4,       # Mitigates score by 60%
            "PARTIAL": 0.75,   # Mitigates score by 25%
            "FAIL": 1.0,       # No mitigation
            "NOT_TESTED": 1.0,
            "NOT_APPLICABLE": 1.0,
        }.get(control_effectiveness, 1.0)

        residual_score = max(1, round(inherent_score * reduction_factor))
        if residual_score >= 20:
            residual_class = "CRITICAL"
        elif residual_score >= 12:
            residual_class = "HIGH"
        elif residual_score >= 6:
            residual_class = "MEDIUM"
        else:
            residual_class = "LOW"

        return {
            "inherent_likelihood": inherent_likelihood,
            "inherent_impact": inherent_impact,
            "inherent_score": inherent_score,
            "inherent_classification": inherent_class,
            "control_effectiveness": control_effectiveness,
            "residual_score": residual_score,
            "residual_classification": residual_class,
            "methodology_disclaimer": "Automated calculation requires IT Auditor validation based on business context."
        }

