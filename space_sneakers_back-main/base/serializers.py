from rest_framework import serializers
from .models import Client, Product, ClientOrder, Discount, Recommendation

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

    def validate_default_discount_percent(self, value):
        try:
            return Decimal(value)
        except Exception:
            raise serializers.ValidationError("Некорректное значение для поля 'default_discount_percent'")


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class ClientOrderSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    client_id = serializers.IntegerField()
    product_id = serializers.IntegerField(write_only=True, allow_null=True, required=False, source='product_id')

    class Meta:
        model = ClientOrder
        fields = '__all__'

    def create(self, validated_data):
        client_id = validated_data.pop('client_id')
        product_id = validated_data.pop('product_id', None)
        client = Client.objects.get(id=client_id)
        product = Product.objects.get(id=product_id) if product_id else None
        client_order = ClientOrder.objects.create(client=client, product=product, **validated_data)
        return client_order

    def update(self, instance, validated_data):
        client_id = validated_data.pop('client_id', None)
        product_id = validated_data.pop('product_id', None)
        if client_id:
            instance.client = Client.objects.get(id=client_id)
        if product_id is not None:
            instance.product = Product.objects.get(id=product_id) if product_id else None
        return super().update(instance, validated_data)

class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = '__all__'

class RecommendationSerializer(serializers.ModelSerializer):
    source_product = ProductSerializer(read_only=True)
    recommended_product = ProductSerializer(read_only=True)
    source_product_id = serializers.IntegerField(write_only=True, source='source_product_id')
    recommended_product_id = serializers.IntegerField(write_only=True, source='recommended_product_id')

    class Meta:
        model = Recommendation
        fields = '__all__'

    def create(self, validated_data):
        source_product_id = validated_data.pop('source_product_id')
        recommended_product_id = validated_data.pop('recommended_product_id')
        source_product = Product.objects.get(id=source_product_id)
        recommended_product = Product.objects.get(id=recommended_product_id)
        recommendation = Recommendation.objects.create(
            source_product=source_product,
            recommended_product=recommended_product,
            **validated_data
        )
        return recommendation

    def update(self, instance, validated_data):
        source_product_id = validated_data.pop('source_product_id', None)
        recommended_product_id = validated_data.pop('recommended_product_id', None)
        if source_product_id:
            instance.source_product = Product.objects.get(id=source_product_id)
        if recommended_product_id:
            instance.recommended_product = Product.objects.get(id=recommended_product_id)
        return super().update(instance, validated_data)