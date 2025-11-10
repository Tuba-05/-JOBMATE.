from django.urls import path # to transfer app control to main folder of project through include
from . import views

urlpatterns = [
    # path("path name after port no. 8000/", views.function from views file, name = optional)
    path(" ", views.home ),
]