# Service-Project-Repo

This is a repository for my project on service providers

#STRUCTURE :

 #views folder contain all the frontend files and folders
 
 #app.js is the main backend file
 
 #the webpage is running at localhost:8080

#INSTRUCTIONS :
 - cd version1
 - npm install (all the dependencies in package.json)
 - install mongodb server and start the server
 - node app.js

#installing mongodb server :

#follow the steps in the link to install
  https://docs.mongodb.com/manual/administration/install-community/

  #sudo systemctl start mongod (command to start the server)

  #sudo systemctl status mongod (to check the status of mongodb server)

    #if Active: failed --- in mongodb status(it will change the owner of mongodb user) :
        #chown -R mongodb:mongodb /var/lib/mongodb
        #chown mongodb:mongodb /tmp/mongodb-27017.sock

  #sudo systemctl stop mongod (to stop the server)

#FOR VSCODE (ADD MONGODB EXTENSION):
- install azure cosmos DB
- click "attached database accounts" in azure section of vscode
- click "attach database account" and select "mongodb api"
- write "mongodb://127.0.0.1:27017"
