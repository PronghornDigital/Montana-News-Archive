#!/bin/bash

echo "Adding the PronghornDigital/mtna repository to your RPM configuration..."
curl -s https://packagecloud.io/install/repositories/PronghornDigital/mtna/script.rpm.sh | sudo bash

echo "Installing mtna via dnf..."
dnf install -y mtna
