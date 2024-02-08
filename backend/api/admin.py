from django.contrib import admin
from .models import User, Company

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'company', 'interests')
    
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('company', 'description', 'tech_sector', 'hq_main_office', 'vertex_entity', 'finance_stage', 'status', 'website')
    
admin.site.register(User, UserAdmin)
admin.site.register(Company, CompanyAdmin)