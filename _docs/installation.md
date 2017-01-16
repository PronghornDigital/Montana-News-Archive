---
layout: docs
title: Installation
permalink: /docs/installation/
---

<iframe width="500" height="281" src="https://www.youtube.com/embed/7XZ5YWY5KSM?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>

## Our settings

During this demonstration, we're going to be using the following settings. These settings will most likely be different for your own installation, so be sure to swap them out for your own whenever you see them.

* **Server IP:** 172.16.10.49
* **NAS Device IP:** 172.16.10.13
* **Root password:** toor

## Connect to the web server using ssh

From any other computer on the same network, connect to the web server using ssh. If you're on a Windows machine, you can do this [in Putty](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html). If you're using Mac or Linux, you can do this using the terminal.

On Putty, you'll type in the IP address and log in as root. If you're using terminal, you'll enter in the following command: `ssh root@172.16.10.49` (remember to swap out that IP address for the IP address of the web server you're using).

It will ask you for the root password. Enter it.

## Set up a local user and data folder

Run:

```
adduser mtna
```

and:

```
mkdir /var/archives
```

## Connect the Network-attached-storage (NAS) device

This is assuming you've [set up the NAS as described here](/docs/nas-setup) and that you know its IP address. Now we need to edit a configuration file to tell the web server to mount the NAS when it starts up.

Run:
```
sudo vi /etc/fstab
```
This will open open up the configuration file in the editor known as "vi." You will need to press "i" on the keyboard in order to let you type.

Copy the following line, swapping out the IP address for the IP address of your nas, and then paste it in the folder.

```
//172.16.10.13/ArchiveData      /var/archives   cifs    username=nasuser,password=naspass,uid=mtna,file_mode=0775,dir_mode=0775    0       0
```

Press escape to exit insert mode. Then press ":", then type "wq" to exit.

Run:

```
sudo mount /var/archives
```

If you get an error, run `ls -la /var/archives` to make sure that the /var/archives folder exists, and check the fstab file with `sudo vi /etc/fstab` to make sure you've copied that line correctly. 

Also check to see that you've [set up the NAS](/docs/nas-setup) correctly with the right folder name and the right permissions.

## Install the package

Once we have everything ready to go, let's run the installation command. If you experience issues, email mtnewsarchive@gmail.com with any questions.

To download and install the package, run:

```
curl https://raw.githubusercontent.com/PronghornDigital/mtna-server-cookbook/master/install.sh | bash
```

This could take a while. Be patient and let the script run.

Then navigate to the directory where the app is installed by running:

```
cd /opt/PronghronDigital/mtna-server-cookbook
```

Now, the last step in the magic:

```
./autochef.sh
```

Now check to see if the archive is up and running by opening up a web browser and going to your server's IP address at Port 8080. For our example, this is `http://172.16.10.49:8080`
