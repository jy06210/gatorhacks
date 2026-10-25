FROM mcr.microsoft.com/playwright/python:v1.58.0-noble

WORKDIR /app

# Keep the browser image and Python package versions aligned for research scraping.
COPY research/requirements.txt /tmp/research-requirements.txt
RUN pip install --no-cache-dir -r /tmp/research-requirements.txt

COPY research /app/research

CMD ["bash"]
