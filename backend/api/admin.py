from django.contrib import admin
from .models import User, Company, Interest
from import_export.admin import ImportExportModelAdmin
from .models import TechSector, MainOffice, Entity, FinanceStage

from django.db.models import Min
from django.db import connection
from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget
from django.core.exceptions import ValidationError
from django import forms


class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'company')
    # removed interests from user admin , 'interests'


class TechSectorAdmin(ImportExportModelAdmin):
    pass


class FinanceStageAdmin(ImportExportModelAdmin):
    pass


class MainOfficeAdmin(ImportExportModelAdmin):
    pass


class EntityAdmin(ImportExportModelAdmin):
    pass


class CompanyAdminForm(forms.ModelForm):
    class Meta:
        model = Company
        fields = '__all__'  # Include all fields

    def clean_company(self):
        company = self.cleaned_data['company']
        # Check for an existing company with the same name, excluding the current instance
        if Company.objects.filter(company__iexact=company).exclude(pk=self.instance.pk).exists():
            raise ValidationError("A company with this name already exists.")
        return company


class CompanyAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    form = CompanyAdminForm
    list_display = ('company', 'description', 'hq_main_office', 'finance_stage', 'status', 'website', 'products', 'customers_partners', 'pricings', 'founders')
    # removed tech_sector and vertex_entity from company admin


class InterestResource(resources.ModelResource):
    id = fields.Field(attribute='id', column_name='id')
    name = fields.Field(attribute='name', column_name='name')

    class Meta:
        model = Interest
        skip_unchanged = True  # Skip rows that haven't changed
        report_skipped = True
        import_id_fields = ['id']  # Use 'id' as the import identifier
        fields = ('id', 'name',)  # Fields to import

    def before_import_row(self, row, **kwargs):
        """
        Override to add a check for duplicate interest names before importing a row.
        """
        name = row.get('name', None)
        if name and Interest.objects.filter(name__iexact=name).exists():
            raise ValidationError(f'Interest with the name "{name}" already exists.')

    def after_import_row(self, row, row_result, **kwargs):
        """
        Override to perform additional actions after importing each row.
        """
        id = row.get('id')
        name = row.get('name')
        if id and name:
            interest = Interest.objects.filter(id=id).first()
            if interest:
                interest.name = name
                interest.save()


class InterestAdmin(ImportExportModelAdmin):
    resource_class = InterestResource
    # list_display = ('id', 'name')

    def save_model(self, request, obj, form, change):
        """
        Override to check if the interest name already exists before saving.
        """
        existing_interest = Interest.objects.filter(name=obj.name).first()
        if existing_interest:
            # If an interest with the same name already exists, prevent saving
            self.message_user(request, f'Interest with the name "{obj.name}" already exists.', level='ERROR')
            return
        # If the interest name is unique, proceed with saving
        super().save_model(request, obj, form, change)


admin.site.register(User, UserAdmin)
admin.site.register(Company, CompanyAdmin)
admin.site.register(Interest, InterestAdmin)
admin.site.register(TechSector, TechSectorAdmin)
admin.site.register(MainOffice, MainOfficeAdmin)
admin.site.register(Entity, EntityAdmin)
admin.site.register(FinanceStage, FinanceStageAdmin)
