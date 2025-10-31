from django.contrib import admin
from django.urls import path
from .views.products_view import get_all_sneakers, get_sneaker_by_id, ConsumablesListView
from .views.orders_view import get_orders_by_user, delete_order, delete_order_item, update_order, create_order
from .views.users_view import LoginView, RegisterView, UserProfileView

urlpatterns = [
    path('consumables/', ConsumablesListView.as_view(), name='consumables-list'), #приколы
    path('products/', get_all_sneakers, name='get_all_products'),  # Переименовал для ясности
    path('products/<int:pk>/', get_sneaker_by_id, name='get_product_by_id'),  # Переименовал для ясности
    path('orders/delete/<int:order_id>/', delete_order, name='delete_order'),  # Заменил cart_id на order_id
    path('orders/<int:order_id>/items/<int:item_id>/', delete_order_item, name='delete_order_item'),  # Адаптировал
    path('orders/<int:order_id>/update/', update_order, name='update_order'),  # Заменил cart_id на order_id
    path('orders/create/', create_order, name='create_order'),
    path('orders/<int:user_id>/', get_orders_by_user, name='get_orders_by_user'),
    path('register/', RegisterView.as_view(), name='register'),
    path('users/<int:user_id>/', UserProfileView.as_view(), name='user-profile'),
    path('login/', LoginView.as_view(), name='login'),
]