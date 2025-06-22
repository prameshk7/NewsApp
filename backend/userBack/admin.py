from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'firstname', 'lastname')

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.set_password(self.cleaned_data["password1"])
            user.is_staff = True  # Automatically set as manager
            user.is_superuser = False  # Ensure not superuser
            user.save()
        return user

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'firstname', 'lastname', 'password', 'is_active', 'is_staff')

    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get('password')
        if password and commit:
            user.set_password(password)
            user.save()
        return user

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    list_display = ('username', 'email', 'firstname', 'lastname', 'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'firstname', 'lastname', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'firstname', 'lastname', 'password1', 'password2', 'is_active'),
        }),
    )

    def get_fieldsets(self, request, obj=None):
        if not obj:  # For add form
            return self.add_fieldsets
        return self.fieldsets

    def save_model(self, request, obj, form, change):
        if not change:  # Only for new users
            obj.is_staff = True  # Automatically set as manager
            obj.is_superuser = False  # Ensure not superuser
        super().save_model(request, obj, form, change)