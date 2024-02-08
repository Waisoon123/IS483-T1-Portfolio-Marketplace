from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import models
from backend.validators import ContactNumberValidator, NameValidator


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        email = self.normalize_email(email)

        # Validate the password before creating the user
        try:
            validate_password(password)
        except ValidationError as e:
            raise ValueError(str(e))

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
    # list of built-in methods: https://docs.djangoproject.com/en/5.0/topics/auth/customizing/#django.contrib.auth.models.AbstractBaseUser
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, validators=[NameValidator()])
    last_name = models.CharField(max_length=30, validators=[NameValidator()])
    company = models.CharField(max_length=100)
    interests = models.CharField(max_length=100)
    profile_pic = models.ImageField(upload_to='profile_pics', blank=True)
    contact_number = models.CharField(max_length=20, validators=[ContactNumberValidator()])
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'company', 'interests', 'contact_number']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_active and (self.is_superuser or self.is_staff)

    def has_module_perms(self, app_label):
        return self.is_active and (self.is_superuser or self.is_staff)

class Company(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending'),
    ]
    
    company = models.CharField(max_length=30)
    description = models.CharField(max_length=100)
    tech_sector = models.CharField(max_length=100)
    hq_main_office = models.CharField(max_length=100)
    vertex_entity = models.CharField(max_length=100)
    finance_stage = models.CharField(max_length=100)
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='pending')
    website = models.URLField(max_length=200)