---
name: pterodactyl-specialist
description: >-
    Pterodactyl Specialist, providing detailed, step-by-step instructions on server management, consoles, files, databases, bots, and APIs.
---

# 🦅 Pterodactyl Panel: The Ultimate Specialist Guide

**Pterodactyl** is the most widely used server management panel in the market (used by approximately 95% of hosting companies). This guide consolidates all the knowledge required to operate everything from game servers to Bot and API instances.

---

## 📊 1. Overview and Monitoring (Dashboard)

The home screen (**Console/Home**) is your "instrument panel." Here, you monitor your machine's health in real-time:

| Element | Description |
| :--- | :--- |
| **Server Status** | Name, Icon, and your machine's static IP. |
| **CPU (Processing)** | Real-time usage and total limit (e.g., 100% = 1 core). |
| **Memory (RAM)** | Current consumption vs. total allocated. |
| **Disk (Storage)** | Space occupied by your project's files. |
| **Network** | Data upload and download speeds. |
| **Uptime** | Total time the server has been running without interruption. |

---

## 🎮 2. Basic Controls and Console (CMD)

### Command Buttons
*   **Start:** Initiates the container boot process.
*   **Restart:** Forces a shutdown and starts again (ideal for applying changes).
*   **Stop:** Gracefully terminates all processes.

### Command Console
The **Console** is the heart of interaction. It shows real-time logs and allows execution of commands (functions like CMD or Terminal on your PC).
*   **Interactivity:** Type commands directly into the bottom bar to perform actions on the server.
*   **Feedback:** Script errors, connection logs, and initialization status appear here.

---

## 📁 3. File Management (Files/SFTP)

The **Files** tab contains your server's entire structure.

### Internal Operations
*   **Upload:** Send files directly through the browser (recommended for small/medium files).
*   **Unarchive:** Extract `.zip`, `.tar.gz`, or `.rar` files directly on the server.
*   **Management:** Create new files (**New File**) or folders (**Create Directory**) to organize your project.

### SFTP Access (FileZilla/WinSCP)
For large transfers, use the SFTP address provided in settings:
*   **Credentials:** Host, Port (usually `2022`), Username, and the same panel password.
*   **Security:** Prefer the internal manager to avoid vulnerabilities from third-party software.

---

## 💾 4. Database (Databases)

Used to store persistent data (such as rank systems, economy, or logs).
1.  **Creation:** In **Databases**, click `New Database`.
2.  **Configuration:** The panel will provide credentials (Host, Port, User, Password). 
3.  **Access:** Use this information in your `config.js` or `.env` to connect your bot to the database.

---

## 🛡️ 5. Backup and Security

### Backup System
*   **Create:** Set a name and choose whether to ignore heavy files (like `node_modules`).
*   **Lock:** The "lock" feature prevents an important backup from being accidentally deleted.
*   **Restore:** Reverts all files to the exact state they were in when the backup was created.

### Activity
An audit log that records **who** did **what** and **when**. Essential for monitoring changes made by sub-users.

---

## 👥 6. Sub-Users (Users)

Allows granting access to collaborators without sharing your main password.
*   **Permissions:** You can be granular, granting access only to the "Console" or only to "Files."
*   **Invitation:** Simply enter the collaborator's email and select the privileges.

---

## 🚀 7. Hosting Bots and APIs (Node.js/Python)

Pterodactyl is excellent for running modern applications using this workflow:

### 7.1 Preparation and Upload
1.  **Cleanup:** Delete the local `node_modules` folder before compressing into `.zip` (for faster upload).
2.  **Upload:** Send the `.zip` via the **Files** tab.
3.  **Extraction:** Use `Unarchive` and move files to the root if they are inside a subfolder.

### 7.2 Startup Configuration
*   **Docker Image:** Ensure the image matches your language version (e.g., Node.js 22).
*   **Start Command:** Usually `npm start` or `node index.js`.
*   **Variables:** Configure API tokens and ports here to keep your code clean.

### 7.3 Network Port (Port Mapping)
If it is a Web API, your application must listen on the exact port provided by the host (displayed in the Console). Example: `app.listen(process.env.PORT || 4000)`.

---

## 🤖 8. Using Pre-Installed Bots (Library)

Some hosts offer "One-Click Install" for popular bots (Baileys, Web JS).
1.  **Startup:** Select the desired bot from the dropdown list.
2.  **Pairing:** In the Console, the bot will generate a **QR Code** or **Pairing Code**.
3.  **Connection:** In WhatsApp, go to `Linked Devices > Link with phone number` and enter the code displayed in the panel.

---

## ⏲️ 9. Automation (Schedules)

Keep your server light by configuring daily restarts:
1.  In **Schedules**, create a schedule (e.g., `0 0 * * *` for midnight).
2.  Add a **Task** of type `Send Power Action`.
3.  Select `Restart Server`. This clears the cache and prevents slowdowns.

---

## 💡 Cockpit Analogy
Think of Pterodactyl as an **Airplane Cockpit**:
*   **Dashboard:** Vital indicators (Fuel/RAM, Altitude/CPU).
*   **Controls:** Takeoff and Landing (Start/Stop).
*   **Console:** Direct radio communication with the tower.
*   **Files:** The luggage compartment where everything necessary is stored.
