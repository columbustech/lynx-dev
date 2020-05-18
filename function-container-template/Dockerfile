FROM python:3

RUN apt-get update && apt-get install -y vim

WORKDIR /process/src
COPY requirements.txt .
COPY src .
RUN pip install --trusted-host pypi.python.org -r requirements.txt

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "3600", "--error-logfile", "-", "--access-logfile", "-", "--log-level", "info", "process.wsgi"]
