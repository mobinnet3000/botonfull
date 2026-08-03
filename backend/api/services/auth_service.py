from django.db import transaction
from django.contrib.auth.models import User

from api.models import LabProfile, Factory, Profile
from api.roles import ADMIN, CLIENT, LAB_MANAGER, TECHNICIAN, FACTORY_MANAGER


class ProfileService:

    @staticmethod
    def ensure_profile(user: User, role: str = None, lab=None, factory=None, phone='') -> Profile:
        profile, _ = Profile.objects.get_or_create(user=user)
        changed = False
        if role and profile.role != role:
            profile.role = role
            changed = True
        if lab is not None and profile.lab_id != lab.id:
            profile.lab = lab
            changed = True
        if factory is not None and profile.factory_id != factory.id:
            profile.factory = factory
            changed = True
        if phone and profile.phone_number != phone:
            profile.phone_number = phone
            changed = True
        if changed:
            profile.save()
        # همگام‌سازی کش ریورس رابطه تا get_role همیشه مقدار تازه را ببیند
        user.profile = profile
        if role == ADMIN and not user.is_staff:
            user.is_staff = True
            user.save(update_fields=['is_staff'])
        return profile


class AuthService:

    @staticmethod
    @transaction.atomic
    def create_user_with_profile(validated_data: dict) -> User:
        role = validated_data.pop('role', CLIENT)
        phone = validated_data.pop('phone_number', '')
        lab_fields = validated_data.pop('lab_fields', {})
        factory_fields = validated_data.pop('factory_fields', {})
        lab_code = validated_data.pop('lab_code', '')

        user = User.objects.create_user(**validated_data)

        if role == LAB_MANAGER:
            lab = LabProfile.objects.create(user=user, **lab_fields)
            ProfileService.ensure_profile(user, role=LAB_MANAGER, lab=lab, phone=phone)
        elif role == TECHNICIAN:
            lab = LabProfile.objects.filter(lab_code=lab_code).first()
            ProfileService.ensure_profile(user, role=role, lab=lab, phone=phone)
        elif role == FACTORY_MANAGER:
            factory = Factory.objects.create(
                manager=user,
                name=factory_fields.get('factory_name', ''),
                phone_number=factory_fields.get('factory_phone_number', ''),
                address=factory_fields.get('factory_address', ''),
            )
            ProfileService.ensure_profile(user, role=FACTORY_MANAGER, factory=factory, phone=phone)
        else:
            ProfileService.ensure_profile(user, role=role, phone=phone)

        return user
