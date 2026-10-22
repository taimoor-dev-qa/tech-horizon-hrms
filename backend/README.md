# Tech Horizon HRMS backend

## Start and configuration

Install the dependencies listed in `package.json` before starting the server. Set `MONGO_URI` and `JWT_SECRET` for the API. `PORT` defaults to 5000, `JWT_EXPIRES_IN` defaults to `7d`, and `FRONTEND_URL` defaults to `http://localhost:5173`. The backend uses MongoDB transactions for employee creation and other workflows, so those operations require a replica set or mongos.

From `backend/`, use `npm.cmd run dev` for development or `npm.cmd start` to start the server. Run `npm.cmd run indexes` during database setup to create the declared indexes, including the unique user-email index. These commands are shown with `npm.cmd` for PowerShell environments that block `npm.ps1`.

## Initialize the first Super Admin

Run the bootstrap command only when the target database has **no users**. Supply `BOOTSTRAP_MONGO_URI`, `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, and `BOOTSTRAP_ADMIN_PASSWORD` to the command through your deployment secret manager or a private process environment. The command does not read the backend `.env` file and does not accept a password on the command line. Do not commit or print these values.

From `backend/`, run:

```powershell
npm.cmd run bootstrap:admin
```

The command creates one `super_admin` account. It refuses to run if any user exists, including when the existing users have no Super Admin. It also handles a concurrent bootstrap attempt as a conflict. The reserved-ID guarantee applies to an unsharded MongoDB collection; the command rejects a mongos connection. It prints only a success or generic failure message. If the database already contains users but has no usable Super Admin, stop and use a separately reviewed recovery procedure; this command never promotes an existing account.

## Login and account creation

`POST /api/auth/login` accepts JSON `{ "email": "...", "password": "..." }` and returns the existing `{ success, message, token, user }` shape. Send the token as `Authorization: Bearer <token>` to `GET /api/auth/me` and protected endpoints. Existing accounts and tokens are unchanged.

`POST /api/auth/register` is retired and returns HTTP 410. There is no public account-creation endpoint.

`POST /api/employees` creates staff accounts together with their Employee records. It requires a Super Admin or HR Admin token and the fields validated by `createEmployeeSchema` (including name, email, password, department, designation, joining date, and employment type). The optional role is limited to `employee`, `team_lead`, or `manager`. Candidate hiring uses the existing protected hiring workflow and the same employee-creation service.

`POST /api/admin/users` creates privileged accounts. It requires a **Super Admin** token and JSON with `name`, `email`, `password`, and an explicit `role` of `super_admin`, `hr_admin`, or `finance`. The response is HTTP 201 with a user summary and no password or token. HR Admins cannot use this endpoint. Privileged accounts are User records; they do not receive Employee records through this endpoint.

`npm.cmd test` runs the focused Node test suite. Its database behavior is mocked, so it does not connect to a development or production database.

## Isolated MongoDB integration tests

The replica-set integration suite exercises real transactions, bootstrap concurrency, last-active-Super-Admin protection, employee creation, candidate hiring, MongoDB unique indexes, and reference-safe deletion. It uses a disposable database with a randomized `hrms_it_...` name and drops only that database at the end. The suite refuses non-loopback hosts and ports other than `27019`, and it is skipped unless both explicit opt-in variables are set.

Docker and Docker Compose are required. The provided service has no host data volume and binds only to loopback. From `backend/`, start the isolated replica set:

```powershell
$composeProject = "hrms-it-$PID"
$composeFile = "tests/integration/docker-compose.yml"

try {
  docker compose -p $composeProject -f $composeFile up -d --wait
  if ($LASTEXITCODE -ne 0) { throw "Disposable MongoDB did not become healthy" }

  $env:HRMS_MONGO_INTEGRATION_URI = "mongodb://127.0.0.1:27019/admin?replicaSet=rs0"
  $env:HRMS_RUN_MONGO_INTEGRATION = "1"
  $env:HRMS_CONFIRM_DISPOSABLE_MONGO = "disposable-local-replica-set"
  npm.cmd run test:integration
  if ($LASTEXITCODE -ne 0) { throw "MongoDB integration tests failed" }
}
finally {
  Remove-Item Env:HRMS_MONGO_INTEGRATION_URI -ErrorAction SilentlyContinue
  Remove-Item Env:HRMS_RUN_MONGO_INTEGRATION -ErrorAction SilentlyContinue
  Remove-Item Env:HRMS_CONFIRM_DISPOSABLE_MONGO -ErrorAction SilentlyContinue
  docker compose -p $composeProject -f $composeFile down --remove-orphans
}
```

The integration command connects only after both opt-in variables match, requires the local replica set handshake to report `rs0`, creates indexes from the actual Mongoose schemas, and cleans up its uniquely named test database. Do not point the URI at any other MongoDB service. The ordinary `npm.cmd test` command never connects to MongoDB; it reports the integration tests as skipped unless explicitly opted in.
