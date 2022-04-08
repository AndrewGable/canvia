## 🎨 Canvia Image Uploader 🖼

Upload images to [Canvia](https://canvia.art/) Smart Art Frame via NodeJS

### To run
1. Install node packages (`npm install`)
2. Create an `.env` file with the contents of `.example.env` (`cp .example.env .env`)
3. Fill out the `.env` file with the following variables:
   1. `USERNAME` is your https://my.canvia.art username
   2. `PASSWORD` is your https://my.canvia.art password
   3. `PLAYLIST` is your https://my.canvia.art playlist ID
4. Run the program with file paths in a comma seperated string of the images to upload as the only parameter (`node index.js path/one.jpg,path/two.jpg`)

### How do you use this?
I use an [`Automator Folder Action`](http://macosxautomation.com/automator/folder-action/index.html) to listen for new pictures added to a specific folder.
Once an image is added, it calls this node script to upload, then removes the images when it's done.

![Automator 1](https://i.imgur.com/1XreL6k.png)
![Automator 2](https://i.imgur.com/pciiOpb.png)

### Known errors
1. You cannot upload duplicate artwork names (e.g. `italy.jpg` twice), if you do the API will throw a `409` error.
