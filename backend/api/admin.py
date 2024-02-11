from django.contrib import admin
from .models import User, Company
from import_export.admin import ImportExportModelAdmin

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'company', 'interests')
    
class CompanyAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    list_display = ('company', 'description', 'tech_sector', 'hq_main_office', 'vertex_entity', 'finance_stage', 'status', 'website')
    
admin.site.register(User, UserAdmin)
admin.site.register(Company, CompanyAdmin)