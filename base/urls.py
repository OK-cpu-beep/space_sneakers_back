from django.contrib import admin
from django.urls import path
from base.views.products_view import get_all_sneakers, get_sneaker_by_id
from base.views.orders_view import get_orders_by_user, delete_order, delete_order_item, update_order, create_order
from base.views.users_view import LoginView, RegisterView, UserProfileView

urlpatterns = [
    # Маршруты для кроссовок
    path('sneakers/', get_all_sneakers, name='get_all_sneakers'),
    path('sneakers/<int:pk>/', get_sneaker_by_id, name='get_sneaker_by_id'),
    # Маршруты для заказов
    path('orders/delete/<int:cart_id>/', delete_order, name='delete_order'),
    path('orders/<int:cart_id>/items/<int:item_id>/', delete_order_item, name='delete_order_item'),
    path('orders/<int:cart_id>/update/', update_order, name='update_order'),
    path('orders/create/', create_order, name='create_order'),
    path('orders/<int:user_id>/', get_orders_by_user, name='get_orders_by_user'),

    path('register/', RegisterView.as_view(), name='register'),
    path('users/<int:user_id>/', UserProfileView.as_view(), name='user-profile'),
    path('login/', LoginView.as_view(), name='login'),
    
]
