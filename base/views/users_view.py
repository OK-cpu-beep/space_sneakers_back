from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from ..models import User
from ..serializers import UserRegisterSerializer, UserProfileSerializer, UserLoginSerializer
from django.contrib.auth.hashers import check_password

def generate_jwt(user):
    payload = {
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=24),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = generate_jwt(user)
            return Response({
                'token': token,
                'id': user.id,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        else:
            # Выводим ошибки в консоль для отладки
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def put(self, request, user_id):
        token = request.headers.get('Authorization', '').split(' ')[-1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            if payload['user_id'] != user_id:
                return Response(status=status.HTTP_403_FORBIDDEN)
            
            user = User.objects.get(id=user_id)
            serializer = UserProfileSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except (jwt.ExpiredSignatureError, jwt.DecodeError):
            return Response(status=status.HTTP_401_UNAUTHORIZED)

    def delete(self, request, user_id):
        token = request.headers.get('Authorization', '').split(' ')[-1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            if payload['user_id'] != user_id:
                return Response(status=status.HTTP_403_FORBIDDEN)
            
            User.objects.filter(id=user_id).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except (jwt.ExpiredSignatureError, jwt.DecodeError):
            return Response(status=status.HTTP_401_UNAUTHORIZED)

class LoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            try:
                user = User.objects.get(email=email)
                if check_password(password, user.password):
                    token = generate_jwt(user)
                    return Response({
                        'token': token,
                        'id': user.id,           # <--- добавьте это!
                        'email': user.email
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            except User.DoesNotExist:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
