from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import Sneaker
from ..serializers import SneakerSerializer

@api_view(['GET'])
def get_all_sneakers(request):
    sneakers = Sneaker.objects.all()
    serializer = SneakerSerializer(sneakers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_sneaker_by_id(request, pk):
    try:
        sneaker = Sneaker.objects.get(pk=pk)
        serializer = SneakerSerializer(sneaker)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Sneaker.DoesNotExist:
        return Response(
            {"error": "Sneaker not found"},
            status=status.HTTP_404_NOT_FOUND
        )