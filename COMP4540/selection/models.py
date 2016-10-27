from django.db import models
from django.utils import timezone

class ExpResult(models.Model):
    # author = models.ForeignKey('auth.User');
    title = models.CharField(max_length=200);
    result = models.TextField();

    def __str__(self):
        return self.title;
