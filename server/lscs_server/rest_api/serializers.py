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

class ChecklistSerializer(serializers.ModelSerializer):
    checklistType = ChecklistTypeSerializer()
    manager = LSCSUserSerializer()
    surveyors = LSCSUserSerializer(required=False, many=True)
    class Meta:
        model = rest_api.models.Checklist
        depth = 1

    # def validate_manager(self, attrs, source):
    #     user = rest_api.models.LSCSUser.objects.filter(id=attrs[source])
    #     if not user.exists():
    #         raise ValidationError("Creating user does not exist!")
    #     elif not user.userType == LSCSUser.MANAGER:
    #         raise ValidationError("Creating user is not a manager!")
    #     return attrs
