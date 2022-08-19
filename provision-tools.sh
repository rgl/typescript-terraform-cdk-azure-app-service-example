#!/bin/bash
set -euxo pipefail

# install dependencies.
sudo apt-get install -y apt-transport-https make zip unzip jq

# install the dotnet core sdk.
# see https://docs.microsoft.com/en-us/dotnet/core/install/linux-ubuntu
echo 'export DOTNET_CLI_TELEMETRY_OPTOUT=1' | sudo tee /etc/profile.d/opt-out-dotnet-cli-telemetry.sh
source /etc/profile.d/opt-out-dotnet-cli-telemetry.sh
wget -qO packages-microsoft-prod.deb "https://packages.microsoft.com/config/ubuntu/$(lsb_release -s -r)/packages-microsoft-prod.deb"
sudo dpkg -i packages-microsoft-prod.deb && sudo rm packages-microsoft-prod.deb
sudo apt-get install -y apt-transport-https
sudo apt-get update
sudo apt-get install -y dotnet-sdk-6.0
dotnet --info

# install node LTS.
# see https://github.com/nodesource/distributions#debinstall
sudo apt-get install -y curl
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash
sudo apt-get install -y nodejs
node --version
npm --version

# install terraform.
# see https://www.terraform.io/downloads.html
artifact_url=https://releases.hashicorp.com/terraform/1.2.7/terraform_1.2.7_linux_amd64.zip
artifact_sha=3866eb55549514ffa73b6d460807ab8172e1a063f8dc21ab9044c45668e4dce9
artifact_path="/tmp/$(basename $artifact_url)"
wget -qO $artifact_path $artifact_url
if [ "$(sha256sum $artifact_path | awk '{print $1}')" != "$artifact_sha" ]; then
    echo "downloaded $artifact_url failed the checksum verification"
    exit 1
fi
sudo unzip -o $artifact_path -d /usr/local/bin
rm $artifact_path
CHECKPOINT_DISABLE=1 terraform version

# install azure-cli.
# see https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-apt?view=azure-cli-latest
echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $(lsb_release -cs) main" \
    | sudo tee /etc/apt/sources.list.d/azure-cli.list
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y azure-cli='2.39.0-*'
az version
