# Collaborative Workspace

The SBOM Workbench includes support for a collaborative workspace, a feature designed to enhance teamwork. 
This functionality allows multiple users to work on and review projects within the same workspace, 
eliminating the need for manual copying and transferring of workspace data among team members.

## How does it Works
The collaborative workspace in SBOM Workbench is achieved through a shared folder that is accessible to all team members. 
This setup allows one user to actively work on a project, while others can review the changes in READ_ONLY mode.

## Requirements
* A shared folder that is set up and accessible to all intended users.
* All users must have the same version of SBOM Workbench installed.

## Default Workspace
By default, SBOM Workbench uses a private workspace located at $HOME/scanoss-workspace. 
When setting up a collaborative workspace, you must switch from this default private workspace to your newly created shared workspace

## Preparing the Collaborative Workspace
To utilize the collaborative workspace in SBOM Workbench, each team member needs to create a folder on their local machine and then mount 
the collaborative workspace residing on a Samba server in their local network.

### Initial Steps
* Local Folder Creation: Each user should create a folder on their local system where the shared workspace will be mounted. This folder will act as the access point to the collaborative workspace.
* Workspace Mounting: Once the local folder is created, the next step is to mount the collaborative workspace located on the Samba server into this folder. Details for mounting this workspace on Linux and Windows systems are provided below.

#### On Linux

Ensure the `cifs-utils` package is installed on your machine. On Debian-based distributions, run `sudo apt install cifs-utils`.

```bash
  sudo mount -t cifs -o \
  noperm,iocharset=utf8,uid=1000,gid=1000,file_mode=0775,dir_mode=0775,nobrl,\
  username=<samba_username>,\
  password=<samba_password> \
  //<server_samba>/<remote_workspace_folder> \
  ~/<local_workspace_folder>
```


#### On Windows
```bash
mklink /D %userprofile%\<local_workspace_folder> \\<samba_server_IP>\<remote_workspace_folder> 
```

## Changing the Workspace
Once the collaborative workspace is mounted, change the default workspace in SBOM Workbench as follows:


* Open SBOM Workbench.
* Navigate to Home and look for the scanoss-workspace option in the top left corner.
* Click on it and add a new workspace. Select the mounted shared folder as the new workspace.

#### See picture:

![change_workspace.png](/assets/imgs/change_workspace.svg)
