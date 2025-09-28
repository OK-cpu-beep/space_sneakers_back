from rest_framework import serializers
from .models import Sneaker, Cart, CartItem, User, Feedback
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate

class SneakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sneaker
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    sneaker = SneakerSerializer(read_only=True)  # Включаем информацию о кроссовке
    sneaker_id = serializers.PrimaryKeyRelatedField(queryset=Sneaker.objects.all(), source='sneaker', write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'sneaker', 'sneaker_id', 'size', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        source='cartitem_set',      # <-- вот отсюда
        many=True,
        read_only=True
    )
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='user')

    class Meta:
        model = Cart
        fields = ['id', 'user_id', 'total_amount', 'is_paid', 'items']
        depth = 1


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'phone', 'gender', 
                 'birth_date', 'passport_series', 'passport_number']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'gender', 
                 'birth_date', 'passport_series', 'passport_number']
        read_only_fields = ['email']

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

