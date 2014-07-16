from django.shortcuts import render
from rest_framework.response import Response
from django.http import HttpResponse, HttpResponseServerError, Http404
from rest_framework import generics, status, viewsets, mixins
from rest_api.serializers import *
from rest_api.models import *

class ManagerSecurityMixin(object):
    """
    View mixin which requires user to be logged in as a manager.
    """
    def get(self, request, *args, **kwargs):
        if request.user.is_anonymous():
            return Response("", status=status.HTTP_403_FORBIDDEN)
        elif request.user.userType == LSCSUser.MANAGER:
            return super(ManagerSecurityMixin, self).get(request, args, kwargs)
        else:
            return Response("", status=status.HTTP_403_FORBIDDEN)

    def post(self, request):
        if request.user.is_anonymous():
            return Response("", status=status.HTTP_403_FORBIDDEN)
        elif request.user.userType == LSCSUser.MANAGER:
            return super(ManagerSecurityMixin, self).post(request)
        else:
            return Response("", status=status.HTTP_403_FORBIDDEN)

class SurveyorSecurityMixin(object):
    """
    View mixin which requires user to be logged in as a surveyor.
    """
    def get(self, request, *args, **kwargs):
        if request.user.is_anonymous():
            return Response("", status=status.HTTP_403_FORBIDDEN)
        elif request.user.userType == LSCSUser.SURVEYOR:
            return super(SurveyorSecurityMixin, self).get(request, args, kwargs)
        else:
            return Response("", status=status.HTTP_403_FORBIDDEN)

    def post(self, request):
        if request.user.is_anonymous():
            return Response("", status=status.HTTP_403_FORBIDDEN)
        elif request.user.userType == LSCSUser.SURVEYOR:
            return super(SurveyorSecurityMixin, self).post(request)
        else:
            return Response("", status=status.HTTP_403_FORBIDDEN)