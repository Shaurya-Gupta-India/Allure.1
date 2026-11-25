"""Template for the model adapter to be written once the partner shares weights.

Copy this to app/ml/partner_pipeline.py and replace each TODO with the real
preprocessing and inference call. Do not return fabricated/placeholder scores.
"""


def run_analysis(image_bytes: bytes) -> dict:
    # TODO: Decode/orient/resize the image exactly as required by the trained models.
    # TODO: Run the face model and map its class outputs to normalized face codes.
    # TODO: Run the hair model and map its class outputs to normalized hair codes.
    # TODO: Run the skin model and map its class outputs to normalized skin codes.
    # TODO: Convert any confidence percentages to floats in the 0.0–1.0 range.
    # TODO: Return only findings that the models actually predict.
    raise NotImplementedError("Connect the partner's trained face, hair, and skin models first.")

    # Expected shape after implementation:
    # return {
    #     "model_version": "partner-models-2026-xx",
    #     "findings": [
    #         {
    #             "domain": "skin",  # skin | hair | face
    #             "code": "dryness_appearance",
    #             "confidence": 0.91,
    #             "severity": "mild",  # low | mild | moderate | high | None
    #             "label": "Dry-looking skin",
    #         }
    #     ],
    # }
