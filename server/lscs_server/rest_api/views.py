from django.shortcuts import render
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, status, viewsets, mixins
from rest_api.serializers import *
from rest_api.models import *

class ObtainAuthTokenAndUserType(ObtainAuthToken):
    def post(self, request):
        serializer = self.serializer_class(data=request.DATA)
        if serializer.is_valid():
            user = LSCSUser.objects.get(id=serializer.object['user'].id)
            token, created = Token.objects.get_or_create(user=serializer.object['user'])
            return Response({'token': token.key, 'username': serializer.object['user'].username, 'email' : serializer.object['user'].email, 'userType' : serializer.object['user'].userType})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateUser(generics.CreateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        
        serializer = LSCSUserRegisterSerializer(data=request.DATA);
        if serializer.is_valid():
            #callingUser = LSCSUser.objects.get(pk=request.user.id)
            if request.user.userType == LSCSUser.MANAGER:
                user = LSCSUser.objects.create_user(
                    username=serializer.init_data["username"],
                    password=serializer.init_data["password"],
                    email=serializer.init_data["email"],
                )
                user.userType=serializer.init_data["userType"]
                user.save()
                return Response(status=status.HTTP_201_CREATED);
        else:
            header = {"Access-Control-Expose-Headers": "Error-Message, Error-Type"}
            error = serializer.errors["non_field_errors"]
            if errors:
                if errors[0] == "username":
                    header["Error-Type"] = errors[0]
                    header["Error-Message"] = "Username {0} already exists.".format(serializer.init_data['username'])
                elif errors[0] == "email":
                    header["Error-Type"] = errors[0]
                    header["Error-Message"] = "Email {0} already exists.".format(serializer.init_data['email'])
            return Response(headers=header, status=HTTP_400_BAD_REQUEST)
        
        return Response("", status=status.HTTP_403_FORBIDDEN)

class ListSurveyors(generics.ListAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = LSCSUserSerializer

    #def get(self, request, *args, **kwargs):
    #    if request.user.userType == LSCSUser.MANAGER:
    #        super.get(self, request, args, kwargs)
    #    else:
    #        return Response("", status=status.HTTP_403_FORBIDDEN)

    def get_queryset(self):
        return LSCSUser.objects.filter(userType=LSCSUser.SURVEYOR)

obtain_auth_token_user_type = ObtainAuthTokenAndUserType.as_view()
create_user = CreateUser.as_view();
list_surveyors = ListSurveyors.as_view();