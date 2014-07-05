from django.shortcuts import render
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_api.models import LSCSUser
from rest_framework import status

class ObtainAuthTokenAndUserType(ObtainAuthToken):
    def post(self, request):
        serializer = self.serializer_class(data=request.DATA)
        if serializer.is_valid():
            user = LSCSUser.objects.get(id=serializer.object['user'].id)
            token, created = Token.objects.get_or_create(user=serializer.object['user'])
            return Response({'token': token.key, 'username': serializer.object['user'].username, 'email' : serializer.object['user'].email, 'userType' : serializer.object['user'].userType})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


obtain_auth_token_user_type = ObtainAuthTokenAndUserType.as_view()