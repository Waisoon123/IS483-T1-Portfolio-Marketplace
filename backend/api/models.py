from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import models
from backend.validators import ContactNumberValidator, NameValidator
import requests


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        email = self.normalize_email(email)

        # Validate the password before creating the user
        try:
            validate_password(password)
        except ValidationError as e:
            raise ValueError(str(e))


        interests = extra_fields.pop('interests', None)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        if interests is not None:
            # Assuming interests is a list of interest IDs
            interest_objects = Interest.objects.filter(id__in=interests)
            user.interests.set(interest_objects)
        
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class Interest(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name
class User(AbstractBaseUser):
    # list of built-in methods: https://docs.djangoproject.com/en/5.0/topics/auth/customizing/#django.contrib.auth.models.AbstractBaseUser
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, validators=[NameValidator()])
    last_name = models.CharField(max_length=30, validators=[NameValidator()])
    company = models.CharField(max_length=100)
    interests = models.ManyToManyField('Interest', related_name='users')
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

# class Company(models.Model):
#     STATUS_CHOICES = [
#         ('active', 'Active'),
#         ('inactive', 'Inactive'),
#         ('pending', 'Pending'),
#     ]
    
#     company = models.CharField(max_length=10000)
#     description = models.CharField(max_length=100000)
#     tech_sector = models.CharField(max_length=10000)
#     hq_main_office = models.CharField(max_length=100)
#     vertex_entity = models.CharField(max_length=100)
#     finance_stage = models.CharField(max_length=100)
#     status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='pending')
#     website = models.CharField(max_length=200)
    
    # def clean(self):
    #     # Perform the built-in clean method for URLField
    #     super().clean()
    #     # Custom validation for URL accessibility
    #     try:
    #         response = requests.head(self.website, timeout=5)
    #         # Fall back to GET request if HEAD is not allowed
    #         if response.status_code == 405:
    #             response = requests.get(self.website, stream=True, timeout=5)
    #     except requests.RequestException:
    #         # If the initial HEAD request fails for any reason other than 405, try GET
    #         try:
    #             response = requests.get(self.website, stream=True, timeout=5)
    #         except requests.RequestException as e:
    #             raise ValidationError(f"The URL {self.website} is not reachable.") from e
        
    #     # Final check for the response status code for both HEAD and GET requests
    #     if response.status_code >= 400:
    #         raise ValidationError(f"The URL {self.website} is not reachable.")

    # def save(self, *args, **kwargs):
    #     self.clean()
    #     super().save(*args, **kwargs)

# Model for Tech Sectors
class TechSector(models.Model):
    sector_name = models.CharField(max_length=255)

    def __str__(self):
        return self.sector_name

# Model for Main Offices
class MainOffice(models.Model):
    hq_name = models.CharField(max_length=255)

    def __str__(self):
        return self.hq_name

# Model for Entities
class Entity(models.Model):
    entity_name = models.CharField(max_length=255)

    def __str__(self):
        return self.entity_name
    
    class Meta:
        verbose_name_plural = "entities"

# Model for Finance Stages
class FinanceStage(models.Model):
    stage_name = models.CharField(max_length=255)

    def __str__(self):
        return self.stage_name
    
class Company(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending'),
    ]
    
    company = models.CharField(max_length=10000)
    description = models.TextField()
    tech_sector = models.ForeignKey(TechSector, on_delete=models.CASCADE)
    hq_main_office = models.ForeignKey(MainOffice, on_delete=models.CASCADE)
    vertex_entity = models.ForeignKey(Entity, on_delete=models.CASCADE)
    finance_stage = models.ForeignKey(FinanceStage, on_delete=models.CASCADE)
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='pending')
    website = models.CharField(max_length=200)
    # website = models.URLField()
    
    def __str__(self):
        return self.company
    
    class Meta:
        verbose_name_plural = "companies"