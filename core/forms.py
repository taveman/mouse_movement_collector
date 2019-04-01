from django.forms import ModelForm

from core.models import UserData, RemoteData


class UserForm(ModelForm):

    class Meta:
        model = UserData
        fields = ['surname', 'age', 'gender', 'lefthanded', 'grade']


class RemoteDataForm(ModelForm):

    class Meta:
        model = RemoteData
        fields = ['user', 'marker', 'channel', 'vm', 'os', 'device', 'remote_tool', 'time_slots', 'movements']
