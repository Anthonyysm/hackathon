from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('user', 'Usuário'),
        ('psychologist', 'Psicólogo'),
    )

    type = models.CharField(max_length=15, choices=USER_TYPE_CHOICES)
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    birth = models.DateField(verbose_name='Data de Nascimento')
    phone = models.CharField(max_length=12)
    crp = models.CharField(max_length=12, blank=True, null=True)

    def __str__(self):
        return f'{self.name} ({self.get_type_display()})'

    def is_psychologist(self):
        return self.type == 'psychologist'

    def is_user(self):
        return self.type == 'user'
