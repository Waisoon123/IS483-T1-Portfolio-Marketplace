from django.contrib import admin
from .models import User, Company, Interest
from import_export.admin import ImportExportModelAdmin
from .models import TechSector, MainOffice, Entity, FinanceStage

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'company')
    #removed interests from user admin , 'interests'
    
class TechSectorAdmin(ImportExportModelAdmin):
    pass
    
class FinanceStageAdmin(ImportExportModelAdmin):
    pass

class MainOfficeAdmin(ImportExportModelAdmin):
    pass

class EntityAdmin(ImportExportModelAdmin):
    pass

class CompanyAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    # list_display = ('company', 'description', 'tech_sector', 'hq_main_office', 'vertex_entity', 'finance_stage', 'status', 'website')
    list_display = ('company', 'description', 'hq_main_office', 'finance_stage', 'status', 'website')
    # removed tech_sector and vertex_entity from company admin
    
admin.site.register(User, UserAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(Interest)
admin.site.register(TechSector, TechSectorAdmin)
admin.site.register(MainOffice, MainOfficeAdmin)
admin.site.register(Entity, EntityAdmin)
admin.site.register(FinanceStage, FinanceStageAdmin)