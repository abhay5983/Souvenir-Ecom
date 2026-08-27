import json

from django.contrib.auth.models import User
from django.test import Client, TestCase

from .models import Account, Profile


class WorkflowApiTests(TestCase):
    def make_user(self, username, role, state="Delhi", account=None):
        user = User.objects.create_user(username, f"{username}@example.com", "pass12345")
        Profile.objects.create(user=user, role=role, state=state, account=account)
        return user

    def post(self, client, path, body):
        return client.post(path, json.dumps(body), content_type="application/json")

    def test_sample_flows_from_school_to_dispatch(self):
        bm = self.make_user("bm", "BUSINESS_MANAGER")
        coordinator = self.make_user("coordinator", "COORDINATOR")
        head = self.make_user("head", "COORDINATOR_HEAD")
        inventory = self.make_user("inventory", "INVENTORY")
        supervisor = self.make_user("supervisor", "INVENTORY_SUPERVISOR")
        dispatch = self.make_user("dispatch", "DISPATCH")
        account = Account.objects.create(name="School", account_type="SCHOOL", partner_key="KEY-1", state="Delhi", business_manager=bm, coordinator=coordinator)
        school = self.make_user("school", "SCHOOL_ADMIN", account=account)

        client = Client()
        client.force_login(school)
        response = self.post(client, "/api/requests", {"requestType": "SAMPLE", "partnerKey": "KEY-1", "lines": [{"productId": "BOOK-1", "quantity": 1}]})
        self.assertEqual(response.status_code, 201)
        item_id = response.json()["value"]["id"]

        steps = [
            (bm, "bm_forward"), (coordinator, "coordinator_forward"), (head, "head_approve"),
            (inventory, "inventory_start"), (inventory, "inventory_complete"),
            (supervisor, "supervisor_release"),
        ]
        for actor, action in steps:
            client.force_login(actor)
            response = self.post(client, f"/api/requests/{item_id}/action", {"action": action})
            self.assertEqual(response.status_code, 200, response.content)

        client.force_login(dispatch)
        response = self.post(client, f"/api/requests/{item_id}/action", {"action": "dispatch", "transporter": "Demo Transport", "consignmentNumber": "CN-1"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["value"]["status"], "DISPATCHED")

        detail = client.get(f"/api/requests/{item_id}")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(len(detail.json()["value"]["events"]), 8)

    def test_roles_cannot_see_requests_outside_assigned_state(self):
        bm = self.make_user("bm2", "BUSINESS_MANAGER", "Delhi")
        delhi_coordinator = self.make_user("delhi", "COORDINATOR", "Delhi")
        other_coordinator = self.make_user("other", "COORDINATOR", "Haryana")
        account = Account.objects.create(name="Delhi School", account_type="SCHOOL", partner_key="KEY-2", state="Delhi", business_manager=bm, coordinator=delhi_coordinator)
        school = self.make_user("school2", "SCHOOL_ADMIN", account=account)
        client = Client()
        client.force_login(school)
        created = self.post(client, "/api/requests", {"requestType": "SAMPLE", "lines": [{"productId": "BOOK-1", "quantity": 1}]})
        item_id = created.json()["value"]["id"]
        client.force_login(other_coordinator)
        self.assertEqual(client.get(f"/api/requests/{item_id}").status_code, 404)
