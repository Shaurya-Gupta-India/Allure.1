from app.core.config import settings
from app.schemas.api import Finding, Recommendation

# Recommendations are intentionally conservative and cosmetic. They are only
# generated for recognized model labels above the configured confidence floor.
RULES: dict[str, dict] = {
    "acne_appearance": {
        "domain": "skin", "title": "Keep the routine gentle and non-comedogenic",
        "reason": "The connected model flagged an acne-like visual pattern. This is not a diagnosis.",
        "actions": ["Use a gentle cleanser rather than harsh scrubs.", "Choose products labelled non-comedogenic.", "Introduce only one new active product at a time and stop if irritation occurs."],
        "ingredients": ["salicylic acid (if tolerated)"]
    },
    "dryness_appearance": {
        "domain": "skin", "title": "Support skin hydration",
        "reason": "The model flagged a dry-looking skin pattern.",
        "actions": ["Use a gentle, fragrance-free cleanser.", "Apply moisturizer while skin is slightly damp.", "Avoid frequent hot water and over-exfoliation."],
        "ingredients": ["glycerin", "ceramides", "hyaluronic acid"]
    },
    "oily_appearance": {
        "domain": "skin", "title": "Use a lightweight routine",
        "reason": "The model flagged a shiny or oily-looking appearance.",
        "actions": ["Cleanse gently; avoid stripping the skin.", "Use a lightweight, non-comedogenic moisturizer.", "Avoid adding multiple oil-control products at once."],
        "ingredients": ["niacinamide"]
    },
    "hyperpigmentation_appearance": {
        "domain": "skin", "title": "Prioritize daily sun protection",
        "reason": "The model flagged areas of uneven-looking pigmentation.",
        "actions": ["Use a broad-spectrum SPF 30+ sunscreen during the day.", "Reapply sunscreen as directed on its label.", "Avoid picking or aggressively exfoliating affected areas."],
        "ingredients": ["niacinamide", "azelaic acid (if tolerated)"]
    },
    "redness_appearance": {
        "domain": "skin", "title": "Simplify and soothe the routine",
        "reason": "The model flagged visible redness. Image-based results cannot establish its cause.",
        "actions": ["Prefer fragrance-free, gentle products.", "Pause products that sting or cause irritation.", "Seek a dermatologist's advice if redness is persistent, painful, or worsening."],
        "ingredients": ["ceramides"]
    },
    "dry_hair_appearance": {
        "domain": "hair", "title": "Improve hair conditioning",
        "reason": "The model flagged a dry-looking hair pattern.",
        "actions": ["Use conditioner after shampooing.", "Reduce high-heat styling where possible.", "Avoid rough towel drying and excessive brushing when wet."],
        "ingredients": ["conditioning agents"]
    },
    "frizz_appearance": {
        "domain": "hair", "title": "Reduce friction and frizz",
        "reason": "The model flagged a frizzy-looking hair pattern.",
        "actions": ["Use a leave-in conditioner if suitable for your hair.", "Use a wide-tooth comb and handle wet hair gently.", "Limit repeated heat styling."],
        "ingredients": ["conditioning agents"]
    },
    "breakage_appearance": {
        "domain": "hair", "title": "Reduce hair breakage risk",
        "reason": "The model flagged a hair-breakage-like visual pattern; it cannot identify the cause.",
        "actions": ["Avoid tight hairstyles that pull on the hair.", "Reduce heat and chemical processing.", "Discuss sudden or significant hair loss with a qualified clinician."],
        "ingredients": []
    },
}


def build_recommendations(findings: list[Finding]) -> list[Recommendation]:
    recommendations: list[Recommendation] = []
    seen: set[str] = set()
    for finding in findings:
        if finding.confidence < settings.MIN_MODEL_CONFIDENCE or finding.code in seen:
            continue
        rule = RULES.get(finding.code)
        if not rule or rule["domain"] != finding.domain:
            continue
        seen.add(finding.code)
        recommendations.append(Recommendation(
            id=f"{finding.domain}_{finding.code}",
            title=rule["title"],
            reason=rule["reason"],
            actions=rule["actions"],
            ingredients_to_consider=rule["ingredients"],
            domain=finding.domain,
            based_on=finding.code,
        ))
    return recommendations
