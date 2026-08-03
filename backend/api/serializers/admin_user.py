from rest_framework import serializers
from django.contrib.auth.models import User

from api.models import LabProfile, Factory, Profile
from api.roles import CLIENT, ROLE_CHOICES, get_role, role_label
from api.services.auth_service import ProfileService


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=ROLE_CHOICES, required=False)
    role_display = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    lab = serializers.PrimaryKeyRelatedField(
        queryset=LabProfile.objects.all(), required=False, allow_null=True,
    )
    factory = serializers.PrimaryKeyRelatedField(
        queryset=Factory.objects.all(), required=False, allow_null=True,
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'role', 'role_display',
            'password', 'lab', 'factory', 'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']
        extra_kwargs = {'username': {'required': False}}

    def get_role_display(self, obj):
        return role_label(get_role(obj))

    def create(self, validated_data):
        role = validated_data.pop('role', CLIENT)
        lab = validated_data.pop('lab', None)
        factory = validated_data.pop('factory', None)
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data) if password else User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        ProfileService.ensure_profile(user, role=role, lab=lab, factory=factory)
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        lab = validated_data.pop('lab', None)
        factory = validated_data.pop('factory', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        profile, _ = Profile.objects.get_or_create(user=instance)
        if role is not None:
            profile.role = role
        if lab is not None:
            profile.lab = lab
        if factory is not None:
            profile.factory = factory
        profile.save()
        return instance
