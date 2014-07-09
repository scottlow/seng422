from rest_framework import serializers
from django.core.exceptions import ValidationError
import rest_api.models

class LSCSUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = rest_api.models.LSCSUser
        fields = ('id', 'first_name', 'last_name', 'username', 'email', 'userType')

class LSCSUserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = rest_api.models.LSCSUser

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super(serializers.ModelSerializer, self).__init__(*args, **kwargs)

        if fields:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields.keys())
            for field_name in existing - allowed:
                self.fields.pop(field_name)        

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

class ChecklistCreateSerializer(serializers.ModelSerializer):
    manager = serializers.PrimaryKeyRelatedField()
    checklistType = serializers.PrimaryKeyRelatedField()
    class Meta:
        model = rest_api.models.Checklist
        fields = ('id', 'manager', 'checklistType', 'title', 'address')

class ChecklistManagerSerializer(serializers.ModelSerializer):
    checklistType = ChecklistTypeSerializer()
    surveyors = LSCSUserSerializer(required=False, many=True)
    class Meta:
        model = rest_api.models.Checklist
        depth = 1
        fields = ('id', 'surveyors', 'checklistType', 'fileNumber', 'title', 'description', 'landDistrict', 'address', 'dateCreated', 'dateLastModified', 'state')

class ChecklistSerializer(serializers.ModelSerializer):
    checklistType = ChecklistTypeSerializer()
    manager = LSCSUserSerializer()
    surveyors = LSCSUserSerializer(required=False, many=True)
    class Meta:
        model = rest_api.models.Checklist
        depth = 1        

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class SetPasswordSerializer(serializers.Serializer):
    new_password1 = serializers.CharField(max_length=128)
    new_password2 = serializers.CharField(max_length=128)

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        return super(SetPasswordSerializer, self).__init__(*args, **kwargs)
