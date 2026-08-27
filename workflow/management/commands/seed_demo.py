from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from workflow.models import Account, Profile


USERS = [
    ("schooladmin", "admin@greenfield.example", "Meera Sharma", "SCHOOL_ADMIN", "Delhi", ""),
    ("businessmanager", "bm@souvenir.example", "Business Manager", "BUSINESS_MANAGER", "Delhi", ""),
    ("distributor", "admin@northstar.example", "Arjun Mehta", "DISTRIBUTOR_ADMIN", "Delhi", ""),
    ("coordinator", "coordinator@souvenir.example", "Regional Coordinator", "COORDINATOR", "Delhi", ""),
    ("coordinatorhead", "coordinatorhead@souvenir.example", "Coordinator Head", "COORDINATOR_HEAD", "Delhi", ""),
    ("inventory", "inventory@souvenir.example", "Inventory User", "INVENTORY", "", "WH-NOI"),
    ("inventorysupervisor", "inventorysupervisor@souvenir.example", "Inventory Supervisor", "INVENTORY_SUPERVISOR", "", "WH-NOI"),
    ("dispatch", "dispatch@souvenir.example", "Dispatch User", "DISPATCH", "", "WH-NOI"),
    ("auditor", "auditor@souvenir.example", "Auditor", "AUDITOR", "", ""),
    ("superadmin", "superadmin@souvenir.example", "Super Administrator", "SUPER_ADMIN", "", ""),
]


class Command(BaseCommand):
    help = "Create the connected workflow demo users and assignments."

    def handle(self, *args, **options):
        created = {}
        for username, email, full_name, role, state, warehouse in USERS:
            first, _, last = full_name.partition(" ")
            user, _ = User.objects.update_or_create(username=username, defaults={"email": email, "first_name": first, "last_name": last})
            user.set_password("123456")
            user.save()
            Profile.objects.update_or_create(user=user, defaults={"role": role, "state": state, "warehouse_id": warehouse})
            created[role] = user

        school, _ = Account.objects.update_or_create(
            partner_key="SPK-SC-DL-00001",
            defaults={"name": "Greenfield Academy", "account_type": "SCHOOL", "state": "Delhi", "active": True,
                      "business_manager": created["BUSINESS_MANAGER"], "coordinator": created["COORDINATOR"]},
        )
        distributor, _ = Account.objects.update_or_create(
            partner_key="SPK-DS-DL-00002",
            defaults={"name": "North Star Educational Distributors", "account_type": "DISTRIBUTOR", "state": "Delhi", "active": True,
                      "business_manager": created["BUSINESS_MANAGER"], "coordinator": created["COORDINATOR"]},
        )
        Profile.objects.filter(user=created["SCHOOL_ADMIN"]).update(account=school)
        Profile.objects.filter(user=created["DISTRIBUTOR_ADMIN"]).update(account=distributor)
        self.stdout.write(self.style.SUCCESS("Demo workflow users seeded; password is 123456."))
