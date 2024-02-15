from django.contrib import admin
from .models import User, Company

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'company', 'interests')
    
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'tag', 'tech_sector', 'main_office', 'entity_type', 'stage', 'status', 'website')
    
    
admin.site.register(User, UserAdmin)
admin.site.register(Company, CompanyAdmin)