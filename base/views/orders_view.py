from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import Cart, CartItem, Sneaker, User
from ..serializers import CartSerializer, CartItemSerializer



# views.py
@api_view(['GET'])
def get_orders_by_user(request, user_id):
    try:
        carts = Cart.objects.filter(user_id=user_id)
        if not carts.exists():
            cart = Cart.objects.create(user_id=user_id)
            carts = [cart]
        serializer = CartSerializer(carts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)    

@api_view(['DELETE'])
def delete_order(request, cart_id):
    try:
        cart = Cart.objects.get(id=cart_id)
        cart.delete()
        return Response({"message": "Order deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except Cart.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_order_item(request, cart_id, item_id):
    try:
        cart = Cart.objects.get(id=cart_id)
        item = CartItem.objects.get(id=item_id, cart=cart)
        item.delete()
        # Пересчитываем total_amount
        cart.total_amount = sum(item.sneaker.price * item.quantity for item in cart.cartitem_set.all())
        cart.save()
        return Response({"message": "Item deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except Cart.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
    except CartItem.DoesNotExist:
        return Response({"error": "Item not found in this order"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def update_order(request, cart_id):
    try:
        cart = Cart.objects.get(id=cart_id)
        # Удаляем все старые позиции
        cart.cartitem_set.all().delete()

        # Создаём по тем, что пришли в запросе
        for item_data in request.data.get('items', []):
            sneaker_id = item_data.get('sneaker_id')
            size       = item_data.get('size')
            quantity   = item_data.get('quantity')
            if sneaker_id and size and quantity:
                sneaker = Sneaker.objects.get(id=sneaker_id)
                CartItem.objects.create(
                    cart=cart,
                    sneaker=sneaker,
                    size=size,
                    quantity=quantity
                )

        # Пересчитываем сумму
        cart.total_amount = sum(
            ci.sneaker.price * ci.quantity
            for ci in cart.cartitem_set.all()
        )
        cart.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Cart.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
    except Sneaker.DoesNotExist:
        return Response({"error": "Sneaker not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def create_order(request):
    serializer = CartSerializer(data=request.data)
    if serializer.is_valid():
        cart = serializer.save()
        # Если переданы элементы, добавляем их
        if 'items' in request.data:
            for item_data in request.data['items']:
                sneaker_id = item_data.get('sneaker_id')
                size = item_data.get('size')
                quantity = item_data.get('quantity')
                if sneaker_id and size and quantity:
                    sneaker = Sneaker.objects.get(id=sneaker_id)
                    CartItem.objects.create(
                        cart=cart,
                        sneaker=sneaker,
                        size=size,
                        quantity=quantity
                    )
        # Считаем total_amount
        cart.total_amount = sum(item.sneaker.price * item.quantity for item in cart.cartitem_set.all())
        cart.save()
        result = CartSerializer(cart)
        return Response(result.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
