from core.models import RemoteData, UserData


class CustomDBRouter:

    def db_for_read(self, model, **hints):
        if model in (RemoteData, UserData):
            return 'data'
        return None

    def db_for_write(self, model, **hints):
        if model in (RemoteData, UserData):
            return 'data'
        return None
