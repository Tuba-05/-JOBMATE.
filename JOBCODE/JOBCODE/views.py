from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def register(request):
    if request.method == "POST":
        # process request
        ...


def home(request):
    return HttpResponse("This is my first Django project")