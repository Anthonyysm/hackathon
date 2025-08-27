from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('user', 'Usuário'),
        ('psychologist', 'Psicólogo'),
    )

    type = models.CharField(max_length=15, choices=USER_TYPE_CHOICES)
    name = models.CharField(max_length=120)
    photo = models.ImageField(upload_to='profile/', blank=True, null=True)
    email = models.EmailField(unique=True)
    birth = models.DateField(verbose_name='Data de Nascimento', null=True)
    phone = models.CharField(max_length=12)
    crp = models.CharField(max_length=12, blank=True, null=True)

    def __str__(self):
        return f'{self.first_name + " " + self.last_name} id = {self.id} ({self.get_type_display()})'

    def is_psychologist(self):
        return self.type == 'psychologist'

    def is_user(self):
        return self.type == 'user'


class Session(models.Model):
    date = models.DateField(verbose_name='Data da Sessão', null=True)
    start_time = models.TimeField(verbose_name='Hora de Início', null=True)
    end_time = models.TimeField(verbose_name='Hora de Término', null=True)
    id = (models.AutoField(primary_key=True),)
    psychologist = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='psychologist_sessions',
        null=True,
    )
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='user_sessions',
        null=True,
    )

    def __str__(self):
        return f'Sessão {self.id} - Psicólogo: {self.psychologist}, Usuário: {self.user} em {self.date}'
