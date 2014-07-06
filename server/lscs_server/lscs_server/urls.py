from django.conf.urls import patterns, include, url
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'lscs_server.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),  
	url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
	url(r'^users/verify_credentials/?', 'rest_api.views.obtain_auth_token_user_type'),
	url(r'^users/create/?', 'rest_api.views.create_user'),
	url(r'^users/list_surveyors/', 'rest_api.views.list_surveyors'),
)
