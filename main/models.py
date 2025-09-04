from django.db import models
import uuid


# Create your models here.
class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField()
    brand = models.CharField()
    price = models.IntegerField()
    stock = models.IntegerField()
    sold = models.IntegerField(default=0)
    description = models.TextField()
    thumbnail = models.URLField()
    category = models.CharField()
    is_featured = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def add_stock(self, quantity):
        self.stock += quantity
        self.save()

    def sell(self, quantity):
        if not self.is_in_stock() or quantity > self.stock:
            raise ValueError("Not enough stock available")
        self.stock -= quantity
        self.sold += quantity
        self.save()

    def is_hot_selling(self):
        return self.sold > 100

    def is_in_stock(self):
        return self.stock > 0

    def change_price(self, new_price):
        if new_price <= 0:
            raise ValueError("Price cannot be zero or negative")
        self.price = new_price
        self.save()
