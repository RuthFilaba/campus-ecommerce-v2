import os

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.users.models import User


DEMO_USERS = [
    {
        "email": "buyer1@campusmarket.com",
        "first_name": "Chanda",
        "last_name": "Banda",
        "phone": "0971111101",
        "student_id": "DEMO-B001",
        "campus": "Great East Road Campus",
        "department": "Business Studies",
        "year_of_study": 2,
        "role": "buyer",
        "is_verified": True,
        "is_campus_verified": True,
        "is_phone_verified": True,
    },
    {
        "email": "buyer2@campusmarket.com",
        "first_name": "Leya",
        "last_name": "Phiri",
        "phone": "0971111102",
        "student_id": "DEMO-B002",
        "campus": "Ridgeway Campus",
        "department": "Education",
        "year_of_study": 1,
        "role": "buyer",
        "is_verified": True,
        "is_campus_verified": True,
        "is_phone_verified": True,
    },
    {
        "email": "buyer3@campusmarket.com",
        "first_name": "Mwamba",
        "last_name": "Zulu",
        "phone": "0971111103",
        "student_id": "DEMO-B003",
        "campus": "Mulungushi Campus",
        "department": "Information Technology",
        "year_of_study": 3,
        "role": "buyer",
        "is_verified": True,
        "is_campus_verified": True,
        "is_phone_verified": True,
    },
    {
        "email": "seller1@campusmarket.com",
        "first_name": "Mila",
        "last_name": "Chanda",
        "phone": "0971111201",
        "student_id": "DEMO-S001",
        "campus": "Great East Road Campus",
        "department": "Computer Science",
        "year_of_study": 3,
        "role": "seller",
        "is_verified": True,
        "is_campus_verified": True,
        "is_phone_verified": True,
        "bio": "Demo seller for technology and study accessories.",
    },
    {
        "email": "seller2@campusmarket.com",
        "first_name": "Lukundo",
        "last_name": "Banda",
        "phone": "0971111202",
        "student_id": "DEMO-S002",
        "campus": "Ridgeway Campus",
        "department": "Business Studies",
        "year_of_study": 4,
        "role": "seller",
        "is_verified": True,
        "is_campus_verified": True,
        "is_phone_verified": True,
        "bio": "Demo seller for fashion and campus essentials.",
    },
    {
        "email": "seller3@campusmarket.com",
        "first_name": "Nawa",
        "last_name": "Sakala",
        "phone": "0971111203",
        "student_id": "DEMO-S003",
        "campus": "Mulungushi Campus",
        "department": "Electrical Engineering",
        "year_of_study": 2,
        "role": "seller",
        "is_verified": True,
        "is_campus_verified": True,
        "is_phone_verified": True,
        "bio": "Demo seller for electronics and practical tools.",
    },
    {
        "email": "admin@campusmarket.com",
        "first_name": "Campus",
        "last_name": "Administrator",
        "role": "admin",
        "is_verified": True,
        "is_active": True,
        "is_staff": True,
        "is_superuser": True,
    },
]


class Command(BaseCommand):
    help = "Create development demo buyers, approved sellers, and an admin account."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset-password",
            action="store_true",
            help="Reset passwords on existing demo accounts as well as new accounts.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("Demo users may only be seeded when DEBUG=True.")

        password = os.environ.get("DEMO_USER_PASSWORD", "CampusDemo2026!")
        created_count = 0
        updated_count = 0

        for user_data in DEMO_USERS:
            user, created = User.objects.get_or_create(
                email=user_data["email"],
                defaults=user_data,
            )
            if created:
                user.set_password(password)
                user.save(update_fields=["password"])
                created_count += 1
            else:
                for field, value in user_data.items():
                    if field != "email":
                        setattr(user, field, value)
                if options["reset_password"]:
                    user.set_password(password)
                user.save()
                updated_count += 1

            self.stdout.write(f"{user.role}: {user.email}")

        self.stdout.write(self.style.SUCCESS(
            f"Created {created_count} demo users; refreshed {updated_count}."
        ))
        self.stdout.write(f"Shared demo password: {password}")