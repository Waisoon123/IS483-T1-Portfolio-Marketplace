from django.contrib import admin
from .models import User, Company
from .models import User, Company, Interest
from import_export.admin import ImportExportModelAdmin
from .models import TechSector, MainOffice, Entity, FinanceStage


class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'company', 'interests')
    
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'tag', 'tech_sector', 'main_office', 'entity_type', 'stage', 'status', 'website')
    
    
admin.site.register(User, UserAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(Interest)
admin.site.register(TechSector)
admin.site.register(MainOffice)
admin.site.register(Entity)
admin.site.register(FinanceStage)
