from django.contrib import admin
from .models import Sneaker, Cart, CartItem, User

admin.site.register(Sneaker)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(User)