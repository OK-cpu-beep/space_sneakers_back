from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from ..models import Client
from ..serializers import ClientSerializer  # Используем существующий ClientSerializer

def generate_jwt(client):
    payload = {
        "id": client.id,
        "email": client.email,
        "default_discount_percent": float(client.default_discount_percent) if isinstance(client.default_discount_percent, Decimal) else client.default_discount_percent,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

class RegisterView(APIView):
    def post(self, request):
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            # Проверка уникальности имени
            name = serializer.validated_data['name']
            if Client.objects.filter(name=name).exists():
                return Response({'error': 'Клиент с таким именем уже существует'}, status=status.HTTP_400_BAD_REQUEST)
            client = serializer.save()
            token = generate_jwt(client)
            return Response({
                'token': token,
                'id': client.id,
                'name': client.name
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    def get(self, request, user_id):
        try:
            client = Client.objects.get(id=user_id)
            serializer = ClientSerializer(client)
            return Response(serializer.data)
        except Client.DoesNotExist:
            return Response({"error": "Клиент не найден"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, user_id):
        token = request.headers.get('Authorization', '').split(' ')[-1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            if payload['id'] != user_id:
                return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
            client = Client.objects.get(id=user_id)
            serializer = ClientSerializer(client, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except (jwt.ExpiredSignatureError, jwt.DecodeError):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    def delete(self, request, user_id):
        token = request.headers.get('Authorization', '').split(' ')[-1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            if payload['id'] != user_id:
                return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
            Client.objects.filter(id=user_id).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (jwt.ExpiredSignatureError, jwt.DecodeError):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

class LoginView(APIView):
    def post(self, request):
        name = request.data.get('name')  # Используем name вместо email
        if not name:
            return Response({'error': 'Имя пользователя обязательно'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            client = Client.objects.get(name=name)
            token = generate_jwt(client)
            return Response({
                'token': token,
                'id': client.id,
                'name': client.name  # Заменили email на name
            }, status=status.HTTP_200_OK)
        except Client.DoesNotExist:
            return Response({'error': 'Клиент не найден'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'Неверные данные'}, status=status.HTTP_400_BAD_REQUEST)