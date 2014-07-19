from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_api.views import PasswordReset
from django.views.generic.base import RedirectView
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'lscs_server.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),  
	url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
	url(r'^users/verify_credentials/$', 'rest_api.views.obtain_auth_token_user_type'),
	url(r'^users/create/$', 'rest_api.views.create_user'),
    url(r'^users/delete/$', 'rest_api.views.delete_user'),    
	url(r'^users/update/$', 'rest_api.views.update_surveyor'),
	url(r'^users/password/reset/$', PasswordReset.as_view(), name='password_reset'),
    url(r'^users/password/reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$', 'rest_api.views.reset_confirm', name='password_reset_confirm'),
	url(r'^manager/surveyors/$', 'rest_api.views.list_surveyors'),
	url(r'^manager/create_checklist_type/$', 'rest_api.views.manager_create_checklist_type'),
	url(r'^manager/delete_checklist_type/$', 'rest_api.views.manager_delete_checklist_type'),
	url(r'^manager/checklist_types/$', 'rest_api.views.manager_list_checklist_types'),
	url(r'^manager/checklist_type/(?P<pk>[\d]+)/$', 'rest_api.views.manager_view_checklist_type'),
	url(r'^manager/create_checklist_question/$', 'rest_api.views.manager_create_checklist_question'),
	url(r'^manager/delete_checklist_question/$', 'rest_api.views.manager_delete_checklist_question'),
	url(r'^manager/create_checklist/$', 'rest_api.views.manager_create_checklist'),
	url(r'^manager/assign_surveyors/$', 'rest_api.views.manager_assign_surveyors'),
	url(r'^manager/delete_checklist/$', 'rest_api.views.manager_delete_checklist'),
	url(r'^manager/checklists/$', 'rest_api.views.manager_checklists'),
	url(r'^manager/checklist/(?P<pk>[\d]+)/$', 'rest_api.views.manager_checklist'),
	url(r'^surveyor/checklists/$', 'rest_api.views.surveyor_checklists'),
	url(r'^surveyor/checklist/(?P<pk>[\d]+)/$', 'rest_api.views.surveyor_checklist'),
	url(r'^surveyor/answer/$', 'rest_api.views.surveyor_answer'),
    url(r'^redirect_to_login/$', RedirectView.as_view(url='http://127.0.0.1:9000'), name='password_reset_complete'),    
)
