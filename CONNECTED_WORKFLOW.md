# Connected Souvenir workflow

Run the Django API:

```powershell
.\ram\Scripts\Activate.ps1
python manage.py runserver
```

In a second terminal, run React:

```powershell
cd souvenir-ecommerce
npm run dev
```

Open `http://127.0.0.1:5173`. Demo users use password `123456`:

- School Admin: `admin@greenfield.example`
- Business Manager: `bm@souvenir.example`
- Distributor Admin: `admin@northstar.example`
- Coordinator: `coordinator@souvenir.example`
- Coordinator Head: `coordinatorhead@souvenir.example`
- Inventory: `inventory@souvenir.example`
- Inventory Supervisor: `inventorysupervisor@souvenir.example`
- Dispatch: `dispatch@souvenir.example`
- Auditor: `auditor@souvenir.example`

The seeded school and distributor are in Delhi and share their assigned Business Manager and Coordinator. To reset or safely refresh the demo identities and assignments, run:

```powershell
python manage.py seed_demo
```

Workflow:

`School sample → BM → Coordinator → Coordinator Head → Inventory → Inventory Supervisor → Dispatch`

BM-created orders/samples and Distributor-created orders start at the Coordinator stage.
