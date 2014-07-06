from rest_framework import serializers
from django.core.exceptions import ValidationError
import rest_api.models

class LSCSUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = rest_api.models.LSCSUser
        fields = ('id', 'username', 'email', 'userType')

class LSCSUserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = rest_api.models.LSCSUser

    def validate(self, attrs):
        if 'username' in attrs and rest_api.models.LSCSUser.objects.filter(username=attrs['username']).exists():
            raise ValidationError("username")
        elif 'email' in attrs and rest_api.models.LSCSUser.objects.filter(email=attrs['email']).exists():
            raise ValidationError("email");
        else:
            return attrs;

class ChecklistTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = rest_api.models.ChecklistType

class ChecklistSerializer(serializers.ModelSerializer):
    checklist_type = ChecklistTypeSerializer();
    class Meta:
        model = rest_api.models.Checklist

class ChecklistSerializerLight(serializers.ModelSerializer):
    class Meta:
        model = rest_api.models.Checklist
        fields = ('id', 'dateCreated', 'title', 'address', 'state')

class CreatedChecklistSerializer(serializers.ModelSerializer):
    manager = LSCSUserSerializer()
    checklist = ChecklistSerializer()
    class Meta:
        model = rest_api.models.CreatedChecklists

class CreatedChecklistSerializerLight(serializers.ModelSerializer):
    checklist = ChecklistSerializerLight()
    class Meta:
        model = rest_api.models.CreatedChecklists
        fields = ('checklist', 'seen')

class AssignedChecklistSerializer(serializers.ModelSerializer):
    surveyor = LSCSUserSerializer()
    checklist = ChecklistSerializer()
    class Meta:
        model = rest_api.models.AssignedChecklists

class AssignedChecklistSerializerLight(serializers.ModelSerializer):
    checklist = ChecklistSerializerLight()
    class Meta:
        model = rest_api.models.CreatedChecklists
        fields = ('checklist', 'seen')
