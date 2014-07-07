from django.shortcuts import render
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse, HttpResponseServerError, Http404
from rest_framework import generics, status, viewsets, mixins
from rest_api.mixins import *
from rest_api.serializers import *
from rest_api.models import *

class ObtainAuthTokenAndUserType(ObtainAuthToken):
    def post(self, request):
        serializer = self.serializer_class(data=request.DATA)
        if serializer.is_valid():
            user = LSCSUser.objects.get(id=serializer.object['user'].id)
            token, created = Token.objects.get_or_create(user=serializer.object['user'])
            return Response({'id' : user.id, 'token': token.key, 'username': serializer.object['user'].username, 'email' : serializer.object['user'].email, 'userType' : serializer.object['user'].userType, 'first_name' : user.first_name, 'last_name' : user.last_name})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateUser(ManagerSecurityMixin, generics.CreateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        
        serializer = LSCSUserRegisterSerializer(data=request.DATA);
        if serializer.is_valid():
            serializer.save()

            serializer = LSCSUserSerializer(serializer.object)
            return Response(data=serializer.data, status=status.HTTP_201_CREATED);
        else:
            header = {"Access-Control-Expose-Headers": "Error-Message, Error-Type"}
            errors = serializer.errors["non_field_errors"]
            if errors:
                if errors[0] == "username":
                    header["Error-Type"] = errors[0]
                    header["Error-Message"] = "Username {0} already exists.".format(serializer.init_data['username'])
                elif errors[0] == "email":
                    header["Error-Type"] = errors[0]
                    header["Error-Message"] = "Email {0} already exists.".format(serializer.init_data['email'])
            return Response(headers=header, status=status.HTTP_400_BAD_REQUEST)

class UpdateSurveyor(ManagerSecurityMixin, generics.CreateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        serializer = rest_api.serializers.LSCSUserRegisterSerializer(fields=request.DATA.keys(), data=request.DATA)
        if serializer.is_valid():
            user = LSCSUser.objects.get(pk=serializer.init_data['id'])
            if('password' in request.DATA.keys()):
                user.set_password(serializer.init_data['password'])
            if('email' in request.DATA.keys()):
                user.email = serializer.init_data['email']
            if('first_name' in request.DATA.keys()):
                user.first_name = serializer.init_data['first_name']
            if('last_name' in request.DATA.keys()):
                user.last_name = serializer.init_data['last_name']                
            user.save()
            return HttpResponse("success") 
        else:
            header = {"Access-Control-Expose-Headers": "Error-Message, Error-Type"}
            errors = serializer.errors["non_field_errors"]
            if errors:
                if errors[0] == "username":
                    header["Error-Type"] = errors[0]
                    header["Error-Message"] = "Username {0} already exists".format(serializer.init_data['username'])                  
                elif errors[0] == "email":
                    header['Error-Type'] = errors[0]
                    header["Error-Message"] = "Email {0} already exists".format(serializer.init_data['email'])
            return Response(headers=header, status=400)    

class ListSurveyors(ManagerSecurityMixin, generics.ListAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = LSCSUserSerializer

    def get_queryset(self):
        return LSCSUser.objects.filter(userType=LSCSUser.SURVEYOR)

class ListManagerChecklists(ManagerSecurityMixin, generics.ListAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = CreatedChecklistSerializerLight

    #TODO: Each checklist should show a set of assigned users.

    def get_queryset(self):
        return CreatedChecklists.objects.filter(manager__pk=request.user.id)

class ListSurveyorChecklists(SurveyorSecurityMixin, generics.ListAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = AssignedChecklistSerializerLight

    def get_queryset(self):
        return AssignedChecklists.objects.filter(surveyor__pk=request.user.id)

obtain_auth_token_user_type = ObtainAuthTokenAndUserType.as_view()

create_user = CreateUser.as_view();
update_surveyor = UpdateSurveyor.as_view();
list_surveyors = ListSurveyors.as_view();
manager_checklists = ListManagerChecklists.as_view();

surveyor_checklists = ListSurveyorChecklists.as_view();
