from django.http import JsonResponse
from django.views import View
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import Cart, CartItem, Sneaker, User
from ..serializers import CartSerializer, CartItemSerializer
from ..sql_queries_sql import get_recommendations, get_all_discount, clear_cart, insert_cart_consumables, get_consumables_by_cart_id

# @api_view(['GET'])
# def get_orders_by_user(request, user_id):
#     try:
#         carts = Cart.objects.filter(user_id=user_id)
#         if not carts.exists():
#             cart = Cart.objects.create(user_id=user_id)
#             carts = [cart]
#         serializer = CartSerializer(carts, many=True)
#
#         print(serializer.data)
#         return Response(serializer.data, status=status.HTTP_200_OK)
#     except User.DoesNotExist:
#         return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
@api_view(['GET'])
def get_orders_by_user(request, user_id):
    try:
        # Убедимся, что пользователь существует
        user = User.objects.get(id=user_id)

        # Получаем все корзины пользователя (или создаём одну, если нет)
        carts = Cart.objects.filter(user_id=user_id)
        if not carts.exists():
            cart = Cart.objects.create(user_id=user_id, total_amount=0.00, is_paid=False)
            carts = [cart]

        # Формируем ответ вручную
        serializer = CartSerializer(carts, many=True)
        response_data = []
        for cart in carts:
            consumables = get_consumables_by_cart_id(cart.id)  # ваша функция

            # Преобразуем каждый расходник в нужный формат
            items = {
                'id' : cart.id,
                'sneaker' : [
                {
                    'id': item['con_id'],
                    'name': item['name'],
                    'price': str(float(item['price']))+"0",  # Decimal -> float для JSON
                    'category': item['category'],
                    'imageurl': item['imageurl'] or '',
                    'quantity': item['quantity']
                }
                for item in consumables
            ]
            }
            response_data.append({
                'id': cart.id,
                'total_amount': float(cart.total_amount),
                'is_paid': cart.is_paid,
                'user_id': cart.user_id,
                'items': items
            })
        counter = 0
        for x in response_data[0]["items"]["sneaker"]:
            serializer.data[0]["items"].append({
                "id" : cart.id + counter,
                "sneaker" : x,
                "quantity" : x["quantity"]
            })
            counter += 1
        return Response(serializer.data, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_order(request, cart_id):
    try:
        cart = Cart.objects.get(id=cart_id)
        clear_cart(cart_id)
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
        cart.save()
        return Response({"message": "Item deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except Cart.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
    except CartItem.DoesNotExist:
        return Response({"error": "Item not found in this order"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT'])
def update_order(request, order_id):
    try:
        cart = Cart.objects.get(id=order_id)
        # Удаляем все старые позиции
        cart.cartitem_set.all().delete()
        clear_cart(cart.id)
        print(request.data)
        # Создаём по тем, что пришли в запросе
        consumables = list()
        for item_data in request.data.get('items', []):
            print(item_data)
            sneaker_id = item_data.get('sneaker_id')
            size       = item_data.get('size')
            quantity   = item_data.get('quantity')
            if sneaker_id and size and quantity:
                if(sneaker_id>1000):
                    consumables.append({
                        "cart_id" : order_id,
                        "con_id" : sneaker_id,
                        "quantity" : quantity
                    })
                    continue
                sneaker = Sneaker.objects.get(id=sneaker_id)
                CartItem.objects.create(
                    cart=cart,
                    sneaker=sneaker,
                    size=size,
                    quantity=quantity
                )
        insert_cart_consumables(consumables)
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
        consumables = list()
        if 'items' in request.data:
            for item_data in request.data['items']:
                sneaker_id = item_data.get('sneaker_id')
                size = item_data.get('size')
                quantity = item_data.get('quantity')
                if sneaker_id and size and quantity:
                    if (sneaker_id > 1000):
                        consumables.append({
                            "cart_id": cart.id,
                            "con_id": sneaker_id,
                            "quantity": quantity
                        })
                        continue
                    sneaker = Sneaker.objects.get(id=sneaker_id)
                    CartItem.objects.create(
                        cart=cart,
                        sneaker=sneaker,
                        size=size,
                        quantity=quantity
                    )
        insert_cart_consumables(consumables)
        # Считаем total_amount
        result = CartSerializer(cart)
        return Response(result.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecommendationsView(View):
    def get(self, request, user_id):
        try:
            # Проверка: user_id должен быть целым положительным числом
            if not isinstance(user_id, int) or user_id <= 0:
                return JsonResponse({"error": "Invalid user_id"}, status=400)

            recommendations = get_recommendations(user_id)
            return JsonResponse(recommendations, safe=False, json_dumps_params={'ensure_ascii': False})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

def all_discounts_view(request):
    data = get_all_discount()
    print(data)
    return JsonResponse(data, safe=False)

