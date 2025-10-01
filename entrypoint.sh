#!/usr/bin/env bash
set -e

python manage.py migrate
python manage.py loaddata fixtures/sneakers.json
python manage.py collectstatic --noinput

python manage.py runserver 0.0.0.0:8000
