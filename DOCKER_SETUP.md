# MediTrack Docker Setup on Ubuntu

This guide runs the React frontend, Express API, and MySQL database as three containers. The application opens at `http://localhost:8080`.

## 1 Install Git and Docker on the lab computer

Open Terminal on Ubuntu and run:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

Add Docker's official package repository:

```bash
echo "Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc" | sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null
```

Install and test Docker:

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker run hello-world
docker compose version
```

If `docker` gives a permission error, use `sudo docker ...` for the lab or ask the lab administrator to add your account to the Docker group.

## 2 Download MediTrack

```bash
git clone https://github.com/DileepaNayanajith/Meditrack.git
cd Meditrack
git pull origin main
```

## 3 Create the Docker settings file

```bash
cp .env.docker.example .env.docker
nano .env.docker
```

Replace the three example secrets with your own values:

```env
MYSQL_ROOT_PASSWORD=a_strong_root_password
MYSQL_PASSWORD=a_different_app_password
JWT_SECRET=a_long_random_login_secret
```

Email fields are optional. For Gmail, use a Google App Password instead of the normal Gmail password.

Save Nano with `Ctrl+O`, press `Enter`, and exit with `Ctrl+X`.

## 4 Validate and build

```bash
docker compose --env-file .env.docker config
docker compose --env-file .env.docker build
```

The first build downloads Node, Nginx, and MySQL images, so it may take several minutes on the lab network.

## 5 Start the system

```bash
docker compose --env-file .env.docker up -d
docker compose --env-file .env.docker ps
```

Wait until all three services show `healthy`, then open:

```text
http://localhost:8080
```

Create a MediTrack account, sign in, and test the inventory and Point of Sale screens.

## 6 Check that the API and database work

```bash
curl http://localhost:8080/api/health
docker compose --env-file .env.docker logs --tail=100 backend
docker compose --env-file .env.docker logs --tail=100 mysql
```

The health response should show `"database":"connected"`.

## Everyday commands

Stop containers without deleting data:

```bash
docker compose --env-file .env.docker stop
```

Start them again:

```bash
docker compose --env-file .env.docker start
```

Apply new GitHub code:

```bash
git pull origin main
docker compose --env-file .env.docker up -d --build
```

View live logs:

```bash
docker compose --env-file .env.docker logs -f
```

Remove containers while keeping the MySQL data volume:

```bash
docker compose --env-file .env.docker down
```

## Reset the lab database only when required

This command permanently removes the Docker MySQL data and rebuilds the sample database:

```bash
docker compose --env-file .env.docker down -v
docker compose --env-file .env.docker up -d --build
```

Do not use `down -v` when you need to keep real sales or inventory records.

## Ports

- `8080` — MediTrack website and proxied API
- `5001` — direct Express API for debugging
- `3307` — Docker MySQL access from MySQL Workbench on the Ubuntu host

To connect Workbench, use host `127.0.0.1`, port `3307`, user `meditrack`, and the `MYSQL_PASSWORD` from `.env.docker`.
