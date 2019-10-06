FROM ubuntu

ENV TZ=Europe/Berlin
ENV DEBIAN_FRONTEND=noninteractive 

RUN apt-get update && \
  apt-get install -y \
  build-essential \
  bluez bluez-tools \
  python-dev python-pip \
  libglib2.0-dev libboost-python-dev libboost-thread-dev libbluetooth-dev && \
  pip install pybluez gattlib

WORKDIR /
COPY . /

# docker run --privileged --net=host --security-opt seccomp=unconfined -i -t bletest /bin/bash
# docker run --privileged --net=host --security-opt seccomp=unconfined --mount type=bind,source=/proc/1/ns/,target=/rootns -i -t bletest /bin/bash
# docker run --mount type=bind,source=/proc/1/ns/,target=/rootns bletest /bin/bash

# service dbus start
# bluetoothd -n

# hciconfig
# bluetoothctl


# ENTRYPOINT ["/usr/sbin/init"]
# docker run bletest /bin/bash
# CMD [ "service", "dbus", "start" ]
# CMD [ "bluetoothctl" ]
# CMD [ "bluetoothd", "-n" ]
# ENTRYPOINT [ "python" ]
# CMD [ "test.py" ]
# docker run -ti --privileged --net=host debian:jessie --name bletest /bin/bash
# docker run --e=container=docker --stop-signal=SIGRTMIN+3 --cap-add=SYS_ADMIN --security-opt=seccomp:unconfined -v /sys/fs/cgroup:/sys/fs/cgroup:ro centos:7 /sbin/init