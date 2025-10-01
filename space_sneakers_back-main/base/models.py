from django.db import models

class Client(models.Model):
    name = models.CharField(max_length=100)
    calculate_progressive_discount = models.BooleanField(default=True)
    default_discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        db_table = 'clients'
        managed = False

class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    gender = models.CharField(max_length=10)

    class Meta:
        db_table = 'products'
        managed = False

class ClientOrder(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, db_column='client_id')
    created_at = models.DateTimeField()
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_column='product_id', null=True, blank=True)

    class Meta:
        db_table = 'clientorders'
        managed = False

class Discount(models.Model):
    discount_name = models.CharField(max_length=100)
    min_sum = models.DecimalField(max_digits=10, decimal_places=2)
    max_sum = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_num = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        db_table = 'discount'
        managed = False

class Recommendation(models.Model):
    source_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='source_recommendations', db_column='source_product_id')
    recommended_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='recommended_recommendations', db_column='recommended_product_id')
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'recommendations'
        managed = False