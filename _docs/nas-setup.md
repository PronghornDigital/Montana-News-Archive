---
layout: docs
title: Storage Device Setup
permalink: /docs/nas-setup/
---

# Setting up the Storage Device

You will need a storage device that will house all of the data for your station. We recommend a device with multiple hard drives, put into a RAID configuration so the data can withstand at least one hard drive failure.

You will need to:

* Assign the storage device a **static IP** on your internal network
* Create a folder called **ArchiveData** and share it on your network
* Within *ArchiveData,* create these folders:
  * /data/
  * /incoming/
  * /backup/

# The Folders

The **data** folder is where the database will keep all of the information, including data files, images, and videos.

The **incoming** folder is where you will put all of the videos you want to put in the system. Videos should be in the .mp4 format encoded in H264.

The **backup** folder is where the system will place backups of data files.

# Preparing to Add Video

Because the /incoming/ folder is the place where all the videos will be placed, make sure anyone who needs to have access to the folder has easy access.

This may mean making a shortcut to the /incoming/ folder for any staff that will need to drop videos in there after they've been digitized, or making the /incoming/ folder its own shared device on the network.
