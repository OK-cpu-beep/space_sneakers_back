from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..models import Product, ClientOrder, Client
from ..serializers import ProductSerializer, ClientOrderSerializer, ClientSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    cart = request.data.get('cart', [])  # Список product_id
    if not cart:
        return Response([], status=status.HTTP_200_OK)
    recommended = Product.objects.exclude(id__in=cart).order_by('?')[:3]
    serializer = ProductSerializer(recommended, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart(request):
    client_id = request.user.id  # Предполагаем связь с Client (нужно доработать аутентификацию)
    product_list = request.data.get('products', [])
    if not product_list or not isinstance(product_list, list):
        return Response({'error': 'Неверный список продуктов'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return Response({'error': 'Клиент не найден'}, status=status.HTTP_404_NOT_FOUND)
    # Удаляем старый заказ клиента и создаем новый с первым продуктом
    ClientOrder.objects.filter(client=client).delete()
    if product_list:
        order = ClientOrder.objects.create(client=client, created_at=None, product_id=product_list[0])
    else:
        order = ClientOrder.objects.create(client=client, created_at=None, product_id=None)
    serializer = ClientOrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    client_id = request.user.id
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return Response({'error': 'Клиент не найден'}, status=status.HTTP_404_NOT_FOUND)
    order = ClientOrder.objects.filter(client=client).order_by('-id').first()
    if not order:
        return Response({'message': 'Корзина пуста'}, status=status.HTTP_200_OK)
    serializer = ClientOrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_discount(request):
    discounts = Discount.objects.all()
    serializer = DiscountSerializer(discounts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
