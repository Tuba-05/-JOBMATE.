from django.urls import path
from . import views

urlpatterns = [
    # path("path name after port no. 8000/", views.function from views file, name = optional)
    path("", views.home, name='home'),
]