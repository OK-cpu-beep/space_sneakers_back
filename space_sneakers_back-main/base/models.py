from django.db import models
from django.core.validators import MinValueValidator
from django.db.models import JSONField

class User(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(max_length=6, choices=[('male', 'Male'), ('female', 'Female')], blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    passport_series = models.CharField(max_length=10, blank=True, null=True)
    passport_number = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email

class Sneaker(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, blank=True, null=True)
    surface_type = models.CharField(max_length=100, blank=True, null=True)
    composition = JSONField(default=list, blank=True)
    description = models.TextField(blank=True, null=True)
    gender = models.CharField(max_length=7, choices=[('male', 'Male'), ('female', 'Female'), ('unisex', 'Unisex')])
    sizes = JSONField(default=dict, blank=True)  # Stores sizes as JSON, e.g., {"8": 10, "9": 5} for size: quantity

    class Meta:
        db_table = 'sneakers'

    def __str__(self):
        return self.name

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_paid = models.BooleanField(default=False)

    class Meta:
        db_table = 'carts'

    def __str__(self):
        return f"Cart {self.id} for {self.user.email}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    sneaker = models.ForeignKey(Sneaker, on_delete=models.CASCADE)
    size = models.FloatField(validators=[MinValueValidator(0)])  # Stores the selected size
    quantity = models.IntegerField(validators=[MinValueValidator(1)])

    class Meta:
        db_table = 'cart_items'

    def __str__(self):
        return f"{self.quantity} x {self.sneaker.name} (Size {self.size})"