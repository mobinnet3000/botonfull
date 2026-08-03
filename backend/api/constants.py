TEST_TYPE_CHOICES = [
    ('compressive', 'مقاومت فشاری'),
    ('schmidt', 'چکش اشمیت'),
]

SPECIMEN_TYPE_CHOICES = [
    ('cube', 'مکعبی'),
    ('cylinder', 'استوانه‌ای'),
]

SPECIMEN_SIZE_CHOICES = [
    ('cube_15', '15x15x15 cm'),
    ('cyl_300_150', 'ارتفاع 300mm - قطر 150mm'),
    ('cyl_200_100', 'ارتفاع 200mm - قطر 100mm'),
]

PRODUCTION_METHOD_CHOICES = [
    ('factory_batching', 'بچینگ کارخانه'),
    ('manual', 'دستی'),
]

TRANSACTION_TYPE_CHOICES = [
    ('income', 'واریزی'),
    ('expense', 'هزینه/برداشت'),
]

TICKET_STATUS_CHOICES = [
    ('open', 'باز'),
    ('in_progress', 'در حال بررسی'),
    ('closed', 'بسته شده'),
]

TICKET_PRIORITY_CHOICES = [
    ('low', 'پایین'),
    ('medium', 'متوسط'),
    ('high', 'بالا'),
]

DEFAULT_SAMPLING_VOLUME = 70.0
SERIES_VOLUME_DIVISOR = 30.0
DEFAULT_CEMENT_GRADE = '350'
DEFAULT_CEMENT_TYPE = 'تیپ 1'
DEFAULT_AMBIENT_TEMPERATURE = 25.0
DEFAULT_CONCRETE_TEMPERATURE = 0.0
DEFAULT_SLUMP = 0.0
DEFAULT_WEATHER = 'آفتابی'
DEFAULT_CONCRETE_FACTORY = '---'
DEFAULT_SAMPLING_LOCATION = 'کارگاه'
DEFAULT_SPECIMEN_TYPE = 'cube'
DEFAULT_SPECIMEN_SIZE = 'cube_15'
DEFAULT_PRODUCTION_METHOD = 'factory_batching'
DEFAULT_PROJECT_TEST_TYPE = 'compressive'
DEFAULT_SAMPLE_CEMENT_GRADE = '350'
DEFAULT_FLOOR_BASE_SAMPLE = 'فنداسیون'
