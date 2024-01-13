import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class CustomPasswordValidator:
    def validate(self, password, user=None):
        if not re.search(r'\d', password):
            raise ValidationError(_('Password must contain at least 1 digit.'))
        if not re.search(r'[A-Za-z]', password):
            raise ValidationError(_('Password must contain at least 1 letter.'))
        if not re.search(r'[A-Z]', password):
            raise ValidationError(_('Password must contain at least 1 uppercase letter.'))
        if not re.search(r'[a-z]', password):
            raise ValidationError(_('Password must contain at least 1 lowercase letter.'))
        if not re.search(r'[!@#$%^&*()_+]', password):
            raise ValidationError(
                _('Password must contain at least 1 special character: !@#$%^&*()_+'))

    def get_help_text(self):
        return _('Your password must contain at least 1 digit, 1 letter, 1 uppercase letter, 1 lowercase letter, and 1 special character: !@#$%^&*()_+')
