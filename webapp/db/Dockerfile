FROM postgres:latest

ARG UID=1000
ARG GID=1000

RUN groupadd -g ${GID} pggroup
RUN useradd -g ${GID} -u ${UID}  pguser

USER pguser
