from django.shortcuts import render
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from django.http import HttpResponse, HttpResponseServerError, Http404
from rest_framework import generics, status, viewsets, mixins
from rest_api.mixins import *
from rest_api.serializers import *
from rest_api.models import *
from rest_framework.views import APIView
from rest_framework.generics import GenericAPIView
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.conf import settings
from django.contrib.auth.views import password_reset, password_reset_confirm
from django.core.exceptions import ObjectDoesNotExist

##############################
# --------- Users! --------- #
##############################

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

class DeleteUser(ManagerSecurityMixin, generics.CreateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if('deletionID' in request.DATA.keys()):
            user = LSCSUser.objects.get(pk=request.DATA['deletionID'])
            user.delete()
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status.HTTP_400_BAD_REQUEST)


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
            if('username' in request.DATA.keys()):
                user.username = serializer.init_data['username']
            user.save()

            serializer = LSCSUserSerializer(user)
            return Response(data=serializer.data, status=status.HTTP_201_CREATED);
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
            return Response(headers=header, status=status.HTTP_400_BAD_REQUEST)

class ListSurveyors(ManagerSecurityMixin, generics.ListAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = LSCSUserSerializer

    def get_queryset(self):
        return LSCSUser.objects.filter(userType=LSCSUser.SURVEYOR)

# Password reset code taken from https://github.com/Tivix/django-rest-auth/blob/master/rest_auth/views.py
# since our group wanted to use the password reset endpoints, but not the entire API.

class LoggedOutRESTAPIView(APIView):
    permission_classes = (AllowAny,)

class PasswordReset(LoggedOutRESTAPIView, GenericAPIView):
    permission_classes = (AllowAny,)

    """
    Calls Django Auth PasswordResetForm save method.

    Accepts the following POST parameters: email
    Returns the success/fail message.
    """

    serializer_class = PasswordResetSerializer

    def post(self, request):
        # Create a serializer with request.DATA
        serializer = self.serializer_class(data=request.DATA)

        try:
            user = LSCSUser.objects.get(email=request.DATA['email']);
        except ObjectDoesNotExist:
            header = {"Access-Control-Expose-Headers": "Error-Message, Error-Type"}
            header["Error-Type"] = "email"
            header["Error-Message"] = "No user with this email exists in the system."
            return Response(headers=header, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            # Create PasswordResetForm with the serializer
            reset_form = PasswordResetForm(data=serializer.data)

            if reset_form.is_valid():
                # Sett some values to trigger the send_email method.
                opts = {
                    'use_https': request.is_secure(),
                    'from_email': getattr(settings, 'DEFAULT_FROM_EMAIL'),
                    'request': request,
                }

                reset_form.save(**opts)

                # Return the success message with OK HTTP status
                return Response(
                    {"success": "Password reset e-mail has been sent."},
                    status=status.HTTP_200_OK)

            else:
                    return Response(reset_form._errors,
                                    status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

def reset_confirm(request, uidb64=None, token=None):
    return password_reset_confirm(request, uidb64=uidb64, token=token)

###################################
# --------- Checklists! --------- #
###################################

class CreateChecklistType(ManagerSecurityMixin, generics.CreateAPIView, generics.UpdateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ChecklistTypeSerializerLight(data=request.DATA)
        if serializer.is_valid():
            serializer.save()

            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        checklistType = ChecklistType.objects.get(pk=request.DATA['id'])
        serializer = ChecklistTypeSerializerLight(checklistType, data=request.DATA, partial=True)
        if(serializer.is_valid()):
            serializer.save()

            return Response(data="{'id': " + str(checklistType.id) + "}", status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST);

class DeleteChecklistType(ManagerSecurityMixin, generics.CreateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if('deletionID' in request.DATA.keys()):
            questionType = ChecklistType.objects.get(pk=request.DATA['deletionID'])
            if questionType != None:
                questionType.delete()

                return Response(data="{'id': " + str(request.DATA['deletionID']) + "}", status=status.HTTP_202_ACCEPTED)
        return Response(data='{"error":"Question Type does not exist"}', status=status.HTTP_400_BAD_REQUEST);

class ListChecklistTypes(ManagerSecurityMixin, generics.ListAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = ChecklistTypeSerializerLight

    def get_queryset(self):
        return ChecklistType.objects.all()

class CreateChecklistQuestion(ManagerSecurityMixin, generics.CreateAPIView, generics.UpdateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ChecklistQuestionCreateSerializer(data=request.DATA)
        if serializer.is_valid():
            serializer.save()

            serializer.object
            checklists = Checklist.objects.filter(checklistTypes__pk=serializer.object.checklistType.id)
            for checklist in checklists:
                answer = ChecklistAnswer(checklist=checklist, question=serializer.object)
                answer.save()

            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        question = ChecklistQuestion.objects.get(pk=request.DATA['id'])
        serializer = ChecklistQuestionSerializer(question, data=request.DATA, partial=True)
        if(serializer.is_valid()):
            serializer.save()

            return Response(data="{'id': " + str(question.id) + "}", status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST);

class DeleteChecklistQuestion(ManagerSecurityMixin, generics.CreateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if('deletionID' in request.DATA.keys()):
            question = ChecklistQuestion.objects.get(pk=request.DATA['deletionID'])
            if(question != None):
                question.delete()

                return Response(data="{'id': " + str(request.DATA['deletionID']) + "}", status=status.HTTP_202_ACCEPTED)
        return Response(data='{"error":"Question does not exist"}', status=status.HTTP_400_BAD_REQUEST);

class ViewChecklistType(ManagerSecurityMixin, generics.RetrieveAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = ChecklistTypeSerializer
    model = ChecklistType

class CreateChecklist(ManagerSecurityMixin, generics.CreateAPIView, generics.UpdateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        checklist = Checklist(manager=request.user, dateCreated=datetime.now(), dateLastModified=datetime.now())
        serializer = ChecklistCreateSerializer(checklist, data=request.DATA, partial=True)
        if serializer.is_valid():
            if(checklist.surveyors == []):
                checklist.state = Checklist.UNASSIGNED
            else:
                checklist.state = Checklist.INPROGRESS

            serializer.save()

            checklist_questions = []
            for checklistType in checklist.checklistTypes.all():
                checklist_questions.extend(ChecklistQuestion.objects.filter(checklistType__pk=checklistType.id))
            ChecklistAnswer.objects.bulk_create([ChecklistAnswer(checklist=checklist, question=question) for question in checklist_questions])

            return Response(data="{'id': " + str(checklist.id) + "}", status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST);

    def put(self, request):
        checklist = Checklist.objects.get(pk=request.DATA['id'])
        checklist.dateLastModified = datetime.now()
        currentTypeIds = [checklistType.id for checklistType in checklist.checklistTypes.all()]
        serializer = ChecklistCreateSerializer(checklist, data=request.DATA, partial=True)
        if(serializer.is_valid()):
            if(checklist.surveyors == []):
                checklist.state = Checklist.UNASSIGNED
            else:
                checklist.state = Checklist.INPROGRESS

            serializer.save()
            newTypeIds = [checklistType.id for checklistType in checklist.checklistTypes.all()]
            for id in currentTypeIds:
                if id not in newTypeIds:
                    for question in ChecklistQuestion.objects.filter(checklistType__pk=id):
                        ChecklistAnswer.objects.filter(checklist__pk=checklist.id, question__pk=question.id).delete()

            for id in newTypeIds:
                if id not in currentTypeIds:
                    for question in ChecklistQuestion.objects.filter(checklistType__pk=id):
                        answer = ChecklistAnswer(checklist=checklist, question=question)
                        answer.save()
            return Response(data="{'id': " + str(checklist.id) + "}", status=status.HTTP_201_CREATED)
        return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST);

class DeleteChecklist(ManagerSecurityMixin, generics.CreateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if('deletionID' in request.DATA.keys()):
            checklist = Checklist.objects.get(pk=request.DATA['deletionID'])
            if checklist != None:
                checklist.delete()

                return Response(data="{'id': " + str(request.DATA['deletionID']) + "}", status=status.HTTP_202_ACCEPTED)
        return Response(data='{"error":"Checklist does not exist"}', status=status.HTTP_400_BAD_REQUEST);

class AssignSurveyors(ManagerSecurityMixin, generics.CreateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if "checklist" in request.DATA and "surveyors" in request.DATA:
            checklist = Checklist.objects.get(id=request.DATA['checklist'])
            if checklist != None:
                for userId in request.DATA['surveyors']:
                    surveyor = LSCSUser.objects.get(id=userId)
                    if surveyor != None:
                        if surveyor.userType == LSCSUser.SURVEYOR:
                            checklist.surveyors.add(surveyor)

                serializer = ChecklistSerializer(checklist)
                return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)

class ListManagerChecklists(ManagerSecurityMixin, generics.ListAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = ChecklistManagerSerializer

    def get_queryset(self):
        c = Checklist.objects.select_related('manager', 'checklistType')
        c = c.prefetch_related('surveyors')
        return c.filter(manager__pk=self.request.user.id)

class ViewManagerChecklist(ManagerSecurityMixin, generics.RetrieveAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = ChecklistSerializer
    model = Checklist

class ListSurveyorChecklists(SurveyorSecurityMixin, generics.ListAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = ChecklistSurveyorSerializer

    def get_queryset(self):
        c = Checklist.objects.select_related('manager', 'checklistType')
        c = c.prefetch_related('surveyors')
        return c.filter(surveyors__pk=self.request.user.id)

class ViewSurveyorChecklist(SurveyorSecurityMixin, generics.RetrieveAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = ChecklistSerializer
    model = Checklist

class AnswerSurveyQuestion(SurveyorSecurityMixin, generics.CreateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        error = '{"error":"Required attributes not provided"}'
        if "id" in request.DATA and "answer" in request.DATA:
            answer = ChecklistAnswer.objects.get(id=request.DATA['id'])
            error = '{"error":"Provided data is invalid"}'
            if answer != None:
                error = '{"error":"User is not assigned to checklist"}'
                if request.user in answer.checklist.surveyors.all():
                    if request.DATA["answer"] == "Completed":
                        answer.answer = ChecklistAnswer.COMPLETED
                    else:
                        answer.answer = ChecklistAnswer.INCOMPLETE

                    answer.checklist.dateLastModified = datetime.now()
                    answer.checklist.save()
                    answer.save()

                    serializer = ChecklistAnswerSerializer(answer)
                    return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        return Response(data=error, status=status.HTTP_400_BAD_REQUEST)

class SubmitChecklist(SurveyorSecurityMixin, generics.CreateAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        error = '{"error":"Required attributes not provided"}'
        if "id" in request.DATA:
            checklist = Checklist.objects.get(id=request.DATA['id'])
            error = '{"error":"Provided data is invalid"}'
            if checklist != None:
                error = '{"error":"User is not assigned to checklist"}'
                if request.user in checklist.surveyors.all():
                    error = '{"error":"A checklist question is not answered"}'
                    if checklist.answers.filter(answer=ChecklistAnswer.UNANSWERED).count() == 0:
                        checklist.state = Checklist.SUBMITTED
                        checklist.save()

                        return Response(data={'id':checklist.id, 'status':checklist.get_state_display()}, status=status.HTTP_200_OK)
        return Response(data=error, status=status.HTTP_400_BAD_REQUEST)


#############################
# --------- Data! --------- #
#############################
class GetChecklistStatusDistribution(ManagerSecurityMixin, generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    renderer_classes = (JSONRenderer, JSONRenderer)

    def get(self, request):
        data = {"total":0, "count":{}}
        for choice in Checklist.STATE_CHOICES:
            data["count"][choice[1]] = Checklist.objects.filter(state=choice[0]).count()
            data["total"] += data["count"][choice[1]]
        return Response(data=data, status=status.HTTP_200_OK)

class GetChecklistStatusRecentlyUpdated(ManagerSecurityMixin, generics.ListAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    renderer_classes = (JSONRenderer, JSONRenderer)
    serializer_class = ChecklistIDSerializer

    def get_queryset(self):
      return Checklist.objects.order_by('dateLastModified')[:5]

class GetSurveyerChecklistStatusDistribution(SurveyorSecurityMixin, generics.GenericAPIView):
    authentication_classes = (TokenAuthentication,)
    permission_classes = (IsAuthenticated,)
    renderer_classes = (JSONRenderer, JSONRenderer)

    def get(self, request):
      temp = {}
      data = []
      for choice in Checklist.STATE_CHOICES:
        temp = dict(label=choice[1],value=Checklist.objects.filter(state=choice[0]).count())
        data.append(temp)
        temp = {}
      return Response(data=data, status=status.HTTP_200_OK)

obtain_auth_token_user_type = ObtainAuthTokenAndUserType.as_view()

create_user = CreateUser.as_view()
delete_user = DeleteUser.as_view()
update_surveyor = UpdateSurveyor.as_view()
list_surveyors = ListSurveyors.as_view()

manager_create_checklist_type = CreateChecklistType.as_view()
manager_delete_checklist_type = DeleteChecklistType.as_view()
manager_list_checklist_types = ListChecklistTypes.as_view()
manager_view_checklist_type = ViewChecklistType.as_view()
manager_create_checklist_question = CreateChecklistQuestion.as_view()
manager_delete_checklist_question = DeleteChecklistQuestion.as_view()

manager_create_checklist = CreateChecklist.as_view()
manager_assign_surveyors = AssignSurveyors.as_view()
manager_delete_checklist = DeleteChecklist.as_view()
manager_checklists = ListManagerChecklists.as_view()
manager_checklist = ViewManagerChecklist.as_view()

manager_checklist_distribution = GetChecklistStatusDistribution.as_view()
manager_checklist_recently_updated = GetChecklistStatusRecentlyUpdated.as_view()

surveyor_checklists = ListSurveyorChecklists.as_view()
surveyor_checklist = ViewSurveyorChecklist.as_view()
surveyor_answer = AnswerSurveyQuestion.as_view()
surveyor_submit = SubmitChecklist.as_view()
surveyor_checklist_distribution = GetSurveyerChecklistStatusDistribution.as_view()

