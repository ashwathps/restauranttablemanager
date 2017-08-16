FROM node:6

RUN DEBIAN_FRONTEND=noninteractive apt-get update -y && \
    DEBIAN_FRONTEND=noninteractive apt-get  -yy -q --no-install-recommends install \
        ssh \
        curl \
        gettext \
    && DEBIAN_FRONTEND=noninteractive apt-get autoremove -y \
    && DEBIAN_FRONTEND=noninteractive apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ADD https://storage.googleapis.com/kubernetes-release/release/v1.3.6/bin/linux/amd64/kubectl /bin/kubectl
RUN chmod +x /bin/kubectl

RUN npm install -g grunt-cli

CMD [ "kubectl" ]