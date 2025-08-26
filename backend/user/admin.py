from django.contrib import admin
from user.models import CustomUser, Session
# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'password', 'name', 'type', 'birth', 'phone', 'crp')
    search_fields = ('username', 'email', 'name')

class SessionAdmin(admin.ModelAdmin):
    list_display = ('date', 'start_time', 'end_time', 'psychologist', 'user')
    search_fields = ('psychologist__username', 'user__username', 'date')    


admin.site.register(CustomUser)
admin.site.register(Session, SessionAdmin)
