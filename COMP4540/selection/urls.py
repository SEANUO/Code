from django.conf.urls import url
from . import views

urlpatterns = [
        url(r'^$', views.start_question, name='start_question'),
        url(r'^sendquestionresult$', views.send_question_result, name='send_question_result'),
        url(r'^initialtest$', views.start_initial_test, name='start_initial_test'),
        url(r'^saveinitial$', views.send_initial, name='send_initial')

]
