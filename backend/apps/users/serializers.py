from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 'first_name', 'last_name',
            'phone', 'student_id', 'campus', 'department', 'year_of_study',
            'role'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    role_badge = serializers.SerializerMethodField()
    is_locked = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'alternate_phone', 'student_id', 'campus',
            'department', 'year_of_study', 'role', 'role_display',
            'role_badge', 'is_verified', 'is_campus_verified',
            'is_phone_verified', 'rating', 'review_count',
            'total_sales', 'total_purchases', 'trust_score',
            'is_active', 'is_locked', 'profile_picture', 'bio',
            'facebook_url', 'twitter_url', 'instagram_url',
            'email_notifications', 'sms_notifications', 'language',
            'created_at', 'last_active'
        ]
        read_only_fields = [
            'id', 'rating', 'review_count', 'total_sales',
            'total_purchases', 'trust_score', 'created_at',
            'last_active', 'is_locked'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_role_display(self, obj):
        return obj.get_role_display()
    
    def get_role_badge(self, obj):
        return obj.get_role_badge()
    
    def get_is_locked(self, obj):
        return obj.is_locked()

class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'alternate_phone',
            'student_id', 'campus', 'department', 'year_of_study',
            'profile_picture', 'bio', 'facebook_url', 'twitter_url',
            'instagram_url', 'email_notifications', 'sms_notifications',
            'language'
        ]

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match"})
        return attrs

class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Admin-only serializer for managing users"""
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'phone', 'role',
            'is_active', 'is_verified', 'is_campus_verified',
            'is_phone_verified', 'rating', 'trust_score'
        ]

class UserListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing users"""
    full_name = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'role', 'role_display',
            'is_active', 'is_verified', 'trust_score', 'created_at'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_role_display(self, obj):
        return obj.get_role_display()