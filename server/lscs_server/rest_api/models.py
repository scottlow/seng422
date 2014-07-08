from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AbstractUser
from datetime import datetime

class LSCSUser(AbstractUser):
    SURVEYOR = 'SUR'
    MANAGER = 'MAN'
    USER_TYPES = (
        (SURVEYOR, 'Surveyor'),
        (MANAGER, 'Manager'),
    )

    userType = models.CharField(max_length=3, choices=USER_TYPES, default=SURVEYOR)

class ChecklistType(models.Model):
    name = models.CharField(max_length=256)

    def __unicode__(self):
        return '%s' % (self.name)

class Checklist(models.Model):
    DRAFT = 'DR'
    UNASSIGNED = 'UA'
    ASSIGNED = 'AS'
    INPROGRESS = 'IP'
    SUBMITTED = 'SM'
    REVIEWING = 'RG'
    REVIEWED = 'RD'
    REASSIGNED = 'RA'
    COMPLETED = 'CM'
    STATE_CHOICES = (
        (DRAFT, 'Draft'),
        (UNASSIGNED, 'Unassigned'),
        (ASSIGNED, 'Assigned'),
        (INPROGRESS, 'In Progress'),
        (SUBMITTED, 'Submitted'),
        (REVIEWING, 'In Review'),
        (REVIEWED, 'Reviewed'),
        (REASSIGNED, 'Re-assigned'),
        (COMPLETED, 'Completed')
    )

    manager = models.ForeignKey(LSCSUser, related_name='managers')
    surveyors = models.ManyToManyField(LSCSUser, related_name='surveyors')
    checklistType = models.ForeignKey(ChecklistType)
    fileNumber = models.IntegerField(null=True)
    title = models.CharField(max_length=256)
    description = models.CharField(max_length=256, null=True)
    landDistrict = models.CharField(max_length=256, null=True)
    address = models.CharField(max_length=256)
    dateCreated = models.DateTimeField(default=datetime.now())
    dateLastModified = models.DateTimeField(default=datetime.now())
    state = models.CharField(max_length=2, choices=STATE_CHOICES, default=DRAFT)

@receiver(post_save, sender=LSCSUser)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
