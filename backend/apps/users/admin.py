from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'id', 'email', 'full_name', 'role_badge_display',
        'trust_score_display', 'verification_badges', 'is_active', 'created_at'
    ]
    list_filter = ['role', 'is_active', 'is_verified', 'is_campus_verified', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'student_id']
    list_editable = ['is_active']
    list_per_page = 20
    
    fieldsets = (
        ('Login Information', {
            'fields': ('email', 'password')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'phone', 'alternate_phone')
        }),
        ('Campus Information', {
            'fields': ('student_id', 'campus', 'department', 'year_of_study')
        }),
        ('Role & Permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Verification Status', {
            'fields': ('is_verified', 'is_campus_verified', 'is_phone_verified')
        }),
        ('Trust Metrics', {
            'fields': ('rating', 'review_count', 'total_sales', 'total_purchases', 'trust_score')
        }),
        ('Profile', {
            'fields': ('profile_picture', 'bio', 'facebook_url', 'twitter_url', 'instagram_url')
        }),
        ('Preferences', {
            'fields': ('email_notifications', 'sms_notifications', 'language')
        }),
        ('Security', {
            'fields': ('failed_login_attempts', 'locked_until', 'last_login_ip')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'last_active', 'created_at', 'updated_at')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'first_name', 'last_name'),
        }),
    )
    
    ordering = ['email']
    readonly_fields = ['created_at', 'updated_at', 'trust_score', 'last_active']
    
    def full_name(self, obj):
        return obj.get_full_name()
    full_name.short_description = 'Full Name'
    
    def role_badge_display(self, obj):
        badge = obj.get_role_badge()
        colors = {
            'blue': '#3b82f6', 'green': '#22c55e', 'red': '#ef4444',
            'orange': '#f97316', 'purple': '#a855f7', 'gray': '#6b7280'
        }
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(badge['color'], '#6b7280'),
            obj.get_role_display()
        )
    role_badge_display.short_description = 'Role'
    
    def trust_score_display(self, obj):
        color = '#22c55e' if obj.trust_score >= 70 else '#f97316' if obj.trust_score >= 40 else '#ef4444'
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 6px; border-radius: 12px; font-size: 11px;">{}%</span>',
            color, obj.trust_score
        )
    trust_score_display.short_description = 'Trust Score'
    
    def verification_badges(self, obj):
        badges = []
        if obj.is_verified:
            badges.append('📧')
        if obj.is_campus_verified:
            badges.append('🎓')
        if obj.is_phone_verified:
            badges.append('📱')
        return ' '.join(badges) or '❌'
    verification_badges.short_description = 'Verified'
    
    actions = ['verify_users', 'make_seller', 'make_admin', 'recalculate_trust_scores']
    
    def verify_users(self, request, queryset):
        count = queryset.update(is_verified=True)
        self.message_user(request, f'✅ {count} user(s) verified')
    verify_users.short_description = 'Verify selected users'
    
    def make_seller(self, request, queryset):
        count = queryset.update(role='seller')
        self.message_user(request, f'📦 {count} user(s) promoted to seller')
    make_seller.short_description = 'Promote to Seller'
    
    def make_admin(self, request, queryset):
        count = queryset.update(role='admin', is_staff=True)
        self.message_user(request, f'👑 {count} user(s) promoted to admin')
    make_admin.short_description = 'Promote to Admin'
    
    def recalculate_trust_scores(self, request, queryset):
        for user in queryset:
            user.update_trust_score()
        self.message_user(request, f'Trust scores recalculated for {queryset.count()} user(s)')
    recalculate_trust_scores.short_description = 'Recalculate Trust Scores'