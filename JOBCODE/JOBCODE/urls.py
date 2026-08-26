"""
URL configuration for JOBCODE project.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    return JsonResponse(
        {
            "status": "online",
            "message": "JobMate Backend API Server is running successfully!",
            "frontend_url": "http://localhost:5173",
            "available_endpoints": "/api/",
        },
        status=200,
    )


urlpatterns = [
    path("", api_root, name="api_root"),
    path("admin/", admin.site.urls),
    path("api/", include("Backend.urls")),
]
