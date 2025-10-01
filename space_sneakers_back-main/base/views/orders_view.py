from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import ClientOrder, Product, Client
from ..serializers import ClientOrderSerializer, ProductSerializer

@api_view(['GET'])
def get_orders_by_user(request, user_id):
    try:
        client = Client.objects.get(id=user_id)
        orders = ClientOrder.objects.filter(client=client)
        if not orders.exists():
            return Response({'message': 'Заказы не найдены'}, status=status.HTTP_200_OK)
        serializer = ClientOrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Client.DoesNotExist:
        return Response({"error": "Клиент не найден"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_order(request, order_id):
    try:
        order = ClientOrder.objects.get(id=order_id)
        order.delete()
        return Response({"message": "Заказ удален успешно"}, status=status.HTTP_204_NO_CONTENT)
    except ClientOrder.DoesNotExist:
        return Response({"error": "Заказ не найден"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_order_item(request, order_id):
    try:
        order = ClientOrder.objects.get(id=order_id)
        # Поскольку ClientOrder хранит только одну позицию, просто обнуляем product_id
        order.product_id = None
        order.save()
        serializer = ClientOrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except ClientOrder.DoesNotExist:
        return Response({"error": "Заказ не найден"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def update_order(request, order_id):
    try:
        order = ClientOrder.objects.get(id=order_id)
        product_id = request.data.get('product_id')
        if product_id:
            product = Product.objects.get(id=product_id)
            order.product = product
        else:
            order.product = None
        order.save()
        serializer = ClientOrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except ClientOrder.DoesNotExist:
        return Response({"error": "Заказ не найден"}, status=status.HTTP_404_NOT_FOUND)
    except Product.DoesNotExist:
        return Response({"error": "Продукт не найден"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def create_order(request):
    client_id = request.data.get('client_id')
    product_id = request.data.get('product_id')
    try:
        client = Client.objects.get(id=client_id)
        if product_id:
            product = Product.objects.get(id=product_id)
            order = ClientOrder.objects.create(client=client, product=product, created_at=None)
        else:
            order = ClientOrder.objects.create(client=client, product=None, created_at=None)
        serializer = ClientOrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Client.DoesNotExist:
        return Response({"error": "Клиент не найден"}, status=status.HTTP_404_NOT_FOUND)
    except Product.DoesNotExist:
        return Response({"error": "Продукт не найден"}, status=status.HTTP_404_NOT_FOUND)