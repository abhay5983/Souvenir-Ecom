from django.contrib import admin

from .models import Account, Profile, RequestEvent, WorkflowRequest

admin.site.register(Account)
admin.site.register(Profile)
admin.site.register(WorkflowRequest)
admin.site.register(RequestEvent)
