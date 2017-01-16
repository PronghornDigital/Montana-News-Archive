---
layout: docs
title: Storage Device Setup
permalink: /docs/nas-setup/
---

# Setting up the Storage Device

![NAS](/images/qnap.jpg)

You will need a storage device that will house all of the data for your station. We recommend a device with multiple hard drives, put into a RAID configuration so the data can withstand at least one hard drive failure.

For the pilot program, we used a QNAP device, which seemed to fit the bill well. 

Once you have the connected to the network, you'll need to:

* Configure the device with a **static ip** on your network, and take note of the IP address.
* Create a shared folder on the device called `ArchiveData`
* Make a user called `nasuser` with the password, `naspass`, and ensure that this user has read and write access to the `ArchiveData` folder.

**Next:** [Preparing the Server](/docs/server-setup/)
