from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.profile import UserProfile, UserSkill
from app.schemas.profile import ProfileCreate, ProfileUpdate, SkillCreate


def calculate_completion_percentage(profile: UserProfile) -> int:
    """Calculate transparent profile readiness percentage based on provided fields."""
    score = 0
    
    # 1. Education (15%)
    if profile.education_level and profile.education_level.lower() != "unknown":
        score += 15
        
    # 2. Prior experience / occupation (20%)
    if profile.prior_occupation and profile.prior_occupation.lower() != "unknown":
        score += 20
    elif profile.experience_years and profile.experience_years > 0:
        score += 10
        
    # 3. Livelihood goal (15%)
    if profile.livelihood_goal and profile.livelihood_goal.lower() != "unknown":
        score += 15
        
    # 4. Resources and equipment (15%)
    if profile.resources and len(profile.resources) > 0:
        score += 15
        
    # 5. Interests / preferences (15%)
    if (profile.interests and len(profile.interests) > 0) or (profile.work_preference and profile.work_preference != "flexible"):
        score += 15
        
    # 6. Skills detected / extracted (20%)
    if profile.skills and len(profile.skills) > 0:
        score += 20
        
    return min(score, 100)


def get_or_create_profile(db: Session, user_id: int) -> UserProfile:
    """Retrieve existing profile or create a fresh candidate profile for user."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        profile = UserProfile(
            user_id=user_id,
            education_level="unknown",
            qualification="unknown",
            prior_occupation="unknown",
            livelihood_goal="employment",
            completion_percentage=0
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_profile_data(db: Session, profile: UserProfile, update_data: ProfileUpdate) -> UserProfile:
    """Update profile fields and recalculate completeness score."""
    for field, value in update_data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(profile, field, value)
            
    profile.completion_percentage = calculate_completion_percentage(profile)
    db.commit()
    db.refresh(profile)
    return profile


def add_skill_to_profile(db: Session, profile_id: int, skill_in: SkillCreate) -> UserSkill:
    """Add a verified or extracted skill to candidate profile."""
    # Check if duplicate
    existing = db.query(UserSkill).filter(
        UserSkill.profile_id == profile_id,
        UserSkill.skill_name.ilike(skill_in.skill_name.strip())
    ).first()
    
    if existing:
        existing.proficiency_level = skill_in.proficiency_level
        existing.is_verified = skill_in.is_verified
        db.commit()
        db.refresh(existing)
        return existing

    new_skill = UserSkill(
        profile_id=profile_id,
        skill_name=skill_in.skill_name.strip(),
        category=skill_in.category or "technical",
        proficiency_level=skill_in.proficiency_level or "intermediate",
        is_verified=skill_in.is_verified or False,
        source=skill_in.source or "voice_extracted"
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    
    # Recalculate profile score
    profile = db.query(UserProfile).filter(UserProfile.id == profile_id).first()
    if profile:
        profile.completion_percentage = calculate_completion_percentage(profile)
        db.commit()

    return new_skill
