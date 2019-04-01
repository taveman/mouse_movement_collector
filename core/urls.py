from django.urls import path
from .views import Index, GetRemoteData
from django.conf.urls.static import static
from app import settings

urlpatterns = [
    path('index/', Index.as_view(), name='main-view'),
    path('remote/', GetRemoteData.as_view(), name='remote-view')
]