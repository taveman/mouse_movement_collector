FROM python:3.7-alpine
MAINTAINER Yuiry

ENV PYTHONUNBUFFERED 1

COPY /requirements.txt /requirements.txt

RUN apk add \
    musl-dev \
    postgresql-libs \
    libc-dev

RUN apk add --update --no-cache --virtual .build-deps \
    gcc \
    python3-dev \
    postgresql-dev \
    linux-headers

RUN pip install -r /requirements.txt
RUN pip install --no-binary :all: psycopg2

RUN apk del --no-cache .build-deps

RUN mkdir /statistics
WORKDIR /statistics

COPY ["/", "/statistics"]

RUN adduser -D statistics_user
USER statistics_user