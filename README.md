# CubbyHole
CubbyHole is a file storage platform made during a student project at Supinfo 

MewPipe was built as a final year student project (3rd year) at Supinfo Lyon, France. The subject was to design and build a file storage platform following the concept of Dropbox (Software and Architecture).

Here is the list of the group members:

- Yilmaz Fatma
- Huynh Eddy
- Evieux Jean-Baptiste
- Cholin Théodore
- Chevalier Alexis

**This project is now somewhat old, and is not expected (nor tested) to work anymore on the current versions of Node.JS and Android, it has been open sourced to show the work done by our team and can potentially help someone wishing to build something similar.**

### Installation guide for the web system

**Be careful : Do not try to upgrade node packages since some of them have been modified manually, this is a bad practice but the deadline left us no choice.**

- Install the following softwares and start them:
            - Node.js, npm, grunt and grunt-cli
            - A MySQL Server
            - MongoDB
- Create a SQL DB 'CubbyHole' and import the CubbyHole.sql dump file present in the repository
- Copy the file CubbyHole.Web/globalConf.json.default to CubbyHole.Web/globalConf.json and update the values accordingly to your configuration
- Start the applications
            - Open three command line interfaces
            - In the first one, move into the folder CubbyHole.Web/Api/ and type 'grunt'
            - In the second one, move into the folder CubbyHole.Web/Website/ and type 'grunt'
            - In the third one, move into the folder CubbyHole.Web/Dev/ and type 'grunt'

- Open https://localhost:8443, (Will trigger a certificate error), the website should work.
- If you want an admin user, change the column isAdmin to 1 in the database.


### Different sites :
- https://localhost:8443 : Main website, includes dynamic file browser
- https://localhost:8444 : Api and OAuth2.0 endpoints, handles authentication and REST API calls
- https://localhost:8445 : Developer center, allows an external developer to register an application with CubbyHole's OAuth2.0 provider.


**This project is not maintained anymore by our team, but you can open issues, if we have the time we will reply !**
