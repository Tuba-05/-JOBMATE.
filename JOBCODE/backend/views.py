from django.http import HttpResponse, JsonResponse


def home(request):
    return HttpResponse("This is my first Django project")