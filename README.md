## 🎨 Canvia Image Uploader 🖼

Upload images to [Canvia](https://canvia.art/) Smart Art Frame via NodeJS

### To run
1. Install node packages (`npm install`)
2. Create an `.env` file with the contents of `.example.env` (`cp .example.env .env`)
3. Fill out the `.env` file with the following variables:
   1. `USERNAME` is your https://my.canvia.art username
   2. `PASSWORD` is your https://my.canvia.art password
   3. `PLAYLIST` is your https://my.canvia.art playlist ID
4. Run the program with the full file path of the image to upload as the only parameter (`node index.js /full/path/to/image.jpg`)

### Known errors
1. You cannot upload duplicate artwork names (e.g. `italy.jpg` twice), if you do the API will throw a `409` error.



