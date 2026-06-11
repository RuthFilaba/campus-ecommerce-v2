# backend/users/serializers.py

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import EmailValidator, RegexValidator
import re
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    """
    IEEE 830 REQ-1: User registration with validation
    Norman's Error Prevention: Validate all inputs
    Shneiderman Rule 3: Informative validation errors
    """
    
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        help_text='Password must be at least 8 characters'
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        help_text='Confirm your password'
    )
    
    class Meta:
        model = User
        fields = ['email', 'password', 'password2', 'first_name', 'last_name', 
                  'phone', 'student_id', 'campus', 'department', 'role']
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True, 'allow_null': True},
            'student_id': {'required': False, 'allow_blank': True},
            'campus': {'required': False, 'allow_blank': True},
            'department': {'required': False, 'allow_blank': True},
            'role': {'required': False, 'default': 'buyer'},
        }
    
    def validate_email(self, value):
        """Validate email format and uniqueness"""
        email_validator = EmailValidator()
        email_validator(value)
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value
    
    def validate_phone(self, value):
        """Validate phone number - optional, any format allowed for now"""
        # Make phone completely optional - accept any format or empty
        if value and value.strip():
            # Optional: basic length check only
            if len(value.replace('+', '').replace('-', '').replace(' ', '')) < 8:
                raise serializers.ValidationError("Phone number seems too short")
        return value if value else ''
    
    def validate_student_id(self, value):
        """Optional student ID validation"""
        if value and len(value) < 3:
            raise serializers.ValidationError("Student ID must be at least 3 characters")
        return value
    
    def validate(self, attrs):
        """Norman's Error Prevention: Password confirmation check"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        # Ensure phone is not None
        if 'phone' not in validated_data or validated_data.get('phone') is None:
            validated_data['phone'] = ''
        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    """
    IEEE 830 REQ-2: User profile display
    Shneiderman Rule 8: Reduce cognitive load - computed fields
    """
    
    full_name = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    is_locked = serializers.SerializerMethodField()
    lockout_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'student_id', 'campus', 'department',
            'role', 'role_display', 'is_verified', 'is_campus_verified',
            'rating', 'review_count', 'total_sales', 'total_purchases',
            'is_active', 'is_locked', 'lockout_minutes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'rating', 'review_count', 'total_sales', 'total_purchases',
            'is_verified', 'is_campus_verified', 'created_at', 'updated_at',
            'is_locked', 'lockout_minutes'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_role_display(self, obj):
        return dict(User.ROLE_CHOICES).get(obj.role, obj.role)
    
    def get_is_locked(self, obj):
        return obj.is_locked()
    
    def get_lockout_minutes(self, obj):
        return obj.get_remaining_lockout_minutes()

class ChangePasswordSerializer(serializers.Serializer):
    """
    Shneiderman Rule 6: Easy reversal - password change
    Norman's Feedback: Clear validation messages
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords don't match"})
        return attrs

class UpdateProfileSerializer(serializers.ModelSerializer):
    """
    IEEE 830 REQ-2: Profile update
    Shneiderman Rule 8: Reduce memory load
    """
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'student_id', 'campus', 'department']
        extra_kwargs = {
            'phone': {'required': False, 'allow_blank': True},
            'student_id': {'required': False, 'allow_blank': True},
            'campus': {'required': False, 'allow_blank': True},
            'department': {'required': False, 'allow_blank': True},
        }