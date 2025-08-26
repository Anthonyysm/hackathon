from django.db import models
from django.conf import settings


class Post(models.Model):
    MOOD_CHOICES = [
        ('alegre', 'Alegre'),
        ('triste', 'Triste'),
        ('ansioso', 'Ansioso'),
        ('neutro', 'Neutro'),
        ('assustado', 'Assustado'),
        ('raivoso', 'Raivoso'),
        ('deprimido', 'Deprimido'),
        ('entusiasmado', 'Entusiasmado'),
    ]

    FEELING_CHOICES = [
        ('raiva', 'Raiva'),
        ('alegria', 'Alegria'),
        ('medo', 'Medo'),
        ('angustia', 'Angustia'),
        ('neutro', 'Neutro'),
        ('segurança', 'Segurança'),
        ('insegurança', 'Insegurança'),
    ]

    MOTIVE_CHOICES = [
        ('luto', 'Luto'),
        ('cansaço', 'Cansaço'),
        ('estresse', 'Estresse'),
        ('sono', 'Sono'),
        ('saudade', 'Saudade'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES)
    feeling = models.CharField(max_length=20, choices=FEELING_CHOICES)
    motive = models.CharField(max_length=20, choices=MOTIVE_CHOICES)
    text = models.TextField(blank=True)
    create_in = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} - {self.mood} - {self.motive}'
