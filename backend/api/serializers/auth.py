from rest_framework import serializers
from django.contrib.auth.models import User

from api.models import LabProfile
from api.roles import (
    ADMIN, CLIENT, LAB_MANAGER, TECHNICIAN, FACTORY_MANAGER,
    ROLE_CHOICES, get_role,
)
from api.services.auth_service import AuthService
from api.serializers.lab_profile import LabProfileSerializer
from api.serializers.ticket import TicketSerializer
from api.serializers.project import ProjectReadSerializer

REGISTRABLE_ROLES = [r for r, _ in ROLE_CHOICES if r != ADMIN]

LAB_FIELDS = ['lab_name', 'lab_mobile_number', 'lab_address', 'province', 'city', 'lab_phone_number', 'telegram_id']
FACTORY_FIELDS = ['factory_name', 'factory_address', 'factory_phone_number']

ROLE_REQUIRED_FIELDS = {
    LAB_MANAGER: ['lab_name', 'lab_mobile_number', 'lab_address', 'province', 'city'],
    TECHNICIAN: ['lab_code'],
    FACTORY_MANAGER: ['factory_name'],
}


class UserRegistrationSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=ROLE_CHOICES, write_only=True, default=CLIENT)
    phone_number = serializers.CharField(required=False, allow_blank=True, write_only=True)
    lab_code = serializers.CharField(required=False, allow_blank=True, write_only=True)
    lab_name = serializers.CharField(required=False, write_only=True)
    lab_mobile_number = serializers.CharField(required=False, write_only=True)
    lab_address = serializers.CharField(required=False, write_only=True)
    province = serializers.CharField(required=False, write_only=True)
    city = serializers.CharField(required=False, write_only=True)
    lab_phone_number = serializers.CharField(required=False, allow_blank=True, write_only=True)
    telegram_id = serializers.CharField(required=False, allow_blank=True, write_only=True)
    factory_name = serializers.CharField(required=False, write_only=True)
    factory_address = serializers.CharField(required=False, write_only=True)
    factory_phone_number = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'password', 'first_name', 'last_name', 'email',
            'role', 'phone_number', 'lab_code',
            'lab_name', 'lab_mobile_number', 'lab_address', 'province', 'city',
            'lab_phone_number', 'telegram_id',
            'factory_name', 'factory_address', 'factory_phone_number',
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        role = attrs.get('role', CLIENT)
        if role not in REGISTRABLE_ROLES:
            raise serializers.ValidationError({'role': 'ثبت‌نام با این نقش مجاز نیست.'})
        for field in ROLE_REQUIRED_FIELDS.get(role, []):
            if not attrs.get(field):
                raise serializers.ValidationError({field: 'این فیلد الزامی است.'})
        if role == TECHNICIAN and not LabProfile.objects.filter(lab_code=attrs['lab_code']).exists():
            raise serializers.ValidationError({'lab_code': 'کد آزمایشگاه نامعتبر است.'})
        return attrs

    def create(self, validated_data):
        role = validated_data.get('role', CLIENT)
        lab_fields = {f: validated_data.pop(f, '') for f in LAB_FIELDS if f in validated_data}
        factory_fields = {f: validated_data.pop(f, '') for f in FACTORY_FIELDS if f in validated_data}
        validated_data['lab_fields'] = lab_fields
        validated_data['factory_fields'] = factory_fields
        return AuthService.create_user_with_profile(validated_data)


class UserForFullDataSerializer(serializers.ModelSerializer):
    lab_profile = LabProfileSerializer(read_only=True, allow_null=True)
    tickets = TicketSerializer(many=True, read_only=True)
    role = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'role_display', 'lab_profile', 'tickets']

    @staticmethod
    def get_role(obj):
        return get_role(obj)

    @staticmethod
    def get_role_display(obj):
        from api.roles import role_label
        return role_label(get_role(obj))


class FullUserDataSerializer(serializers.Serializer):
    user = UserForFullDataSerializer()
    projects = ProjectReadSerializer(many=True, read_only=True)
