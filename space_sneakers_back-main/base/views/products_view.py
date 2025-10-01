from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import Product
from ..serializers import ProductSerializer

@api_view(['GET'])
def get_all_sneakers(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_sneaker_by_id(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=status.HTTP_404_NOT_FOUND
        )