from django.conf.urls import patterns, include, url
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'lscs_server.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),  
	url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
	url(r'^verify_credentials/?', 'rest_api.views.obtain_auth_token_user_type'),
)
