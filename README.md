
<h1>Pterodactyl Discord Manager</h1>

# What does this Bot do?
This Bot is used to interact with the Pterodactyl Panel API and let the Users create and manage Servers and Accounts on their own. It also includes a Currency System with a Server-Shop, a Minigame System in order to earn Coins, a Server Manager, a Server Runtime System, a Shop Manager for Admins, a Coin-Leaderboard, Voice Channels to earn Coins in. Furthermore the Bot currently supports 3 languages ( german, english, french ) which the user can select via a /language command.

# Where are the Bot Files / Where can I download them?
Pull the Files / Download the Files and go ham.

## Installation

1: Create a file called `config.env` 
2: Fill the file with the following template:
```
BOT_TOKEN=""
BOT_CLIENT_ID=""
#Server ID of the Server this Bot is going to be on. This is in order to prevent People from Collecting Coins on Servers other than yours.
BOT_SINGLE_SERVER_ID=""
PTERODACTYL_API_KEY=""
PTERODACTYL_ACCOUNT_API_KEY=""
#URL OF THE PANEL FA https://panel.test.de
PTERODACTYL_API_URL=""
#Amount of Days the Bot waits before deleting a suspended Server which ran out of runtime
DELETION_OFFSET=2
#Multiplication factor by which the original server price is to be multiplied in the case of a term extension. Can be in the range of 0-1 for a discount or in the range above 1 for an increase at renewal.
PRICE_OFFSET=0.75
#Discord User IDs of everyone who should be able to remove / add Coins to Users; Control the Shop( seperated by "," )
ADMIN_LIST= [  ]
#Default Language - Select from "en-US" "de-DE" "fr-FR"
DEFAULT_LANGUAGE = "en-US"
#Express Port
PORT = "53134"
#OAuth2 Secret
SECRET = ""
#Partner-Stuff und Partner Channel DO NOT FILL OUT THE FOLLOWING 2! THESE ARE ONLY FOR TESTING PURPOSES
PARTNER_CHANNEL = ""
PARTNER_TEXT = ""
```
3: Modify the file accordingly
4: `npm i` -> Install all Dependencies
5: `node bot.js` -> Start the Bot

I cannot guarantee that the Bot will work in any way. Discord.js Updates may break it at any time. Then you will have to wait for me to update it.
For Questions either open a Github Issue or Message me on Discord ```Einkornwolf#1506```

# Copyright

Feel free to use or update the code as you wish. If you want you can text me on Discord if you want to do something with it :) Would be pretty cool.

