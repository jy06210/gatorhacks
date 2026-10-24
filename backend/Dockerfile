FROM mcr.microsoft.com/playwright/python:v1.58.0-noble

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends git bash \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    "git+https://github.com/microsoft/CUAWright.git"

COPY . /app

CMD ["bash"]