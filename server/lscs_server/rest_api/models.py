from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AbstractUser

class LSCSUser(AbstractUser):
    SURVEYOR = 'SUR'
    MANAGER = 'MAN'
    USER_TYPES = (
        (SURVEYOR, 'Surveyor'),
        (MANAGER, 'Manager'),
    )

    userType = models.CharField(max_length=3, choices=USER_TYPES, default=SURVEYOR)

@receiver(post_save, sender=LSCSUser)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)    