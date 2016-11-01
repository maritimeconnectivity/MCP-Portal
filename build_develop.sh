#!/bin/bash
docker build --tag "mc-p:devel"  --no-cache=true -f ./Develop_Dockerfile .
