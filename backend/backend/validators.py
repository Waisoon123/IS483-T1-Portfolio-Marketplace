import re
import phonenumbers
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class CustomPasswordValidator:
    validation_rules = {
        'digit': (re.compile(r'\d'), 'Password must contain at least 1 digit.'),
        'letter': (re.compile(r'[A-Za-z]'), 'Password must contain at least 1 letter.'),
        'uppercase': (re.compile(r'[A-Z]'), 'Password must contain at least 1 uppercase letter.'),
        'lowercase': (re.compile(r'[a-z]'), 'Password must contain at least 1 lowercase letter.'),
        'special': (re.compile(r'[!@#$%^&*()_+]'), 'Password must contain at least 1 special character: !@#$%^&*()_+'),
    }

    def validate(self, password, user=None):
        for rule, (regex, error_message) in self.validation_rules.items():
            if not regex.search(password):
                raise ValidationError(_(error_message))

    def get_help_text(self):
        return _('Your password must contain at least 1 digit, 1 letter, 1 uppercase letter, 1 lowercase letter, and 1 special character: !@#$%^&*()_+')


class ContactNumberValidator:
    def __call__(self, contact_number):
        self.validate_contact_number(contact_number)

    def validate_contact_number(self, contact_number):
        try:
            parsed_number = phonenumbers.parse(contact_number)
            if not phonenumbers.is_valid_number(parsed_number):
                raise ValidationError(_('Invalid contact number.'))
        except phonenumbers.phonenumberutil.NumberParseException:
            raise ValidationError(
                _('Failed to parse the contact number. Unrecognized format. Did you forget to include the country code? (e.g. +65)'))
