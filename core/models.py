from django.db import models
from django.utils import timezone
from django.contrib.postgres.forms import SimpleArrayField
from django.contrib.postgres.fields import ArrayField, JSONField

# Create your models here.


class RemoteData(models.Model):
    """
    Remote data model
    """
    CHANNEL_WIFI = 'wifi'
    CHANNEL_CABLE = 'cable'
    CHANNEL_MOBILE = 'mobile'

    CHANNELS = (
        (CHANNEL_WIFI, 'Wifi'),
        (CHANNEL_CABLE, 'Cable'),
        (CHANNEL_MOBILE, 'Mobile')
    )

    DEVICE_SMART = 'smartphone'
    DEVICE_DESKTOP = 'desktop'
    DEVICE_LAPTOP = 'laptop'

    DEVICES = (
        (DEVICE_SMART, 'Smartphone'),
        (DEVICE_DESKTOP, 'Desktop'),
        (DEVICE_LAPTOP, 'Laptop')
    )

    OS_WINDOWS = 'windows'
    OS_LINUX = 'linux'
    OS_ANDROID = 'android'
    OS_IOS = 'ios'
    OS_MACOS = 'macos'

    OSs = (
        (OS_WINDOWS, 'Windows'),
        (OS_LINUX, 'Linux'),
        (OS_ANDROID, 'Android'),
        (OS_IOS, 'Ios'),
        (OS_MACOS, 'Macos'),
    )

    REMOTE_TEAM_VIEWER = 'teamviewer'
    REMOTE_ANYDESC = 'anydesc'
    REMOTE_RADMIN = 'radmin'
    REMOTE_AMMYY_ADMIN = 'ammyy_admin'
    REMOTE_SUPREMO = 'supremo'
    REMOTE_TRUSTVIEWER = 'trustviewer'

    REMOTE_TOOLS = (
        (REMOTE_TEAM_VIEWER, 'Teamviewer'),
        (REMOTE_ANYDESC, 'Anydesc'),
        (REMOTE_RADMIN, 'Radmin'),
        (REMOTE_AMMYY_ADMIN, 'Ammyy admin'),
        (REMOTE_SUPREMO, 'Supremo'),
        (REMOTE_TRUSTVIEWER, 'TrustViewer'),
    )

    ip = models.GenericIPAddressField('ip address', blank=False)
    time_slots = ArrayField(models.FloatField())
    marker = models.CharField('marker', max_length=255, blank=False, unique=True)
    user = models.ForeignKey('UserData', on_delete=models.CASCADE, db_column='user_obj')
    channel = models.CharField('channel', max_length=10, choices=CHANNELS)
    vm = models.BooleanField('virtual machine', default=False)
    os = models.CharField('operating system', max_length=10, choices=OSs)
    device = models.CharField('device', max_length=20, choices=DEVICES)
    remote_tool = models.CharField('remote_tool', max_length=30, choices=REMOTE_TOOLS)
    movements = JSONField()
    is_ok = models.BooleanField('is ok', default=True)
    record_date = models.DateTimeField('record_date', default=timezone.now)

    class Meta:
        managed = False
        db_table = 'statistics_schema\".\"stats'


class UserData(models.Model):
    """
    User's data
    """
    Female = 'F'
    Male = 'M'

    FIRST_GRADE = 'first'
    SECOND_GRADE = 'second'
    THIRD_GRADE = 'third'
    FOURTH_GRADE = 'fourth'
    FIFTH_GRADE = 'fifth'
    MAGISTER_GRADE = 'magister'
    OTHER_GRADE = 'other'

    GENDERS = (
        (Female, 'Female'),
        (Male, 'Male')
    )

    GRADES = (
        (FIRST_GRADE, 'First'),
        (SECOND_GRADE, 'Second'),
        (THIRD_GRADE, 'Third'),
        (FOURTH_GRADE, 'Fourth'),
        (FIFTH_GRADE, 'Fifth'),
        (MAGISTER_GRADE, 'Magister'),
        (OTHER_GRADE, 'Other')
    )

    surname = models.CharField('surname', max_length=100)
    age = models.PositiveSmallIntegerField('age')
    gender = models.CharField('gender', max_length=1, choices=GENDERS)
    lefthanded = models.BooleanField('left_handed', default=False)
    grade = models.CharField('grade', max_length=10, choices=GRADES)
    record_date = models.DateTimeField('record_date', default=timezone.now)

    class Meta:
        managed = False
        db_table = 'statistics_schema\".\"users'
