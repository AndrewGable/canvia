import axios from 'axios';
import {v4 as uuid} from 'uuid';
import {default as FormData} from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const API_URL = "https://prod.palacio.life/backend/api/v1";
const ONE_HUNDRED_MEGABYTES = 100000000;

/**
 * Uses username and password to authenticate against API to get a token
 *
 * @param {String} username - https://my.canvia.art username
 * @param {String} password - https://my.canvia.art password
 *
 * @returns {Promise<*>}
 */
const authenticate = async (username, password) => {
    return axios.post(`${API_URL}/authenticate`, {email: username, password: password})
        .then((response) => {
            console.log(`✅  Authenticated`);
            return response.data.token;
        })
        .catch((error) => {
            console.log(`❌  Error: Unknown error authenticating ${error}`);
        })
}

/**
 * Takes a token and image and returns an artwork ID to store the image under
 *
 * @param {String} token - Authentication token provided by Canvia API
 * @param {String} imagePath - Image path provided by user to upload, stores the name of the file to the API. Note:
 * the image name must be unique or the Canvia API will throw an error
 *
 * @returns {Promise<*>}
 */
const createArtworkID = (token, imagePath) => {
    let body = {
        imageid: uuid(),
        title: path.parse(imagePath).name,
        details: "",
        mediums: [],
        subjects: []
    }

    return axios.post(`${API_URL}/artworks`, body, {headers: {"x-access-token": token}})
        .then((response) => {
            console.log(`✅  Created Artwork ID: ${response.data.id}`);
            return {token: token, artworkID: response.data.id};
        })
        .catch((error) => {
            if (error.response && error.response.status === 409) {
                console.log(`❌  Error: Couldn't create artwork, please provide a unique file name.`)
                return;
            }

            console.log(`❌  Error: Unknown error creating artwork ID ${error}`);
        })
}

/**
 * Upload an image path to the Canvia API using the username, token, and artworkID
 *
 * @param {String} username - https://my.canvia.art username
 * @param {String} token - Authentication token provided by Canvia API
 * @param {String} artworkID - ID created from the `createArtworkID` function provided by the Canvia API
 * @param {String} imagePath - Local image path provided by the user to upload to the Canvia API
 *
 * @returns {Promise<*>}
 */
const upload = (username, token, artworkID, imagePath) => {
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    form.append('artwork', artworkID);

    const formHeaders = form.getHeaders();

    return axios.post(`${API_URL}/uploads/upload_artwork_image`, form, {
        maxContentLength: ONE_HUNDRED_MEGABYTES,
        maxBodyLength: ONE_HUNDRED_MEGABYTES,
        headers: {
            "x-access-token": token,
            "x-user-id": username,
            ...formHeaders
        }
    })
        .then((response) => {
            console.log(`✅  Uploaded image: ${response.data.artwork} ${imagePath}`)
            return {token: token, artworkID: artworkID}
        })
        .catch((error) => {
            console.log(`❌  Error: Unknown error uploading photo ${error}`);
        })
}

/**
 * Adds the provided artworkID to the provided playlistID
 *
 * @param {String} username - https://my.canvia.art username
 * @param {String} token - Authentication token provided by Canvia API
 * @param {String} artworkID - ID created from the `createArtworkID` function provided by the Canvia API
 * @param {String} playlistID - Playlist to upload image to in Canvia
 *
 * @returns {Promise<*>}
 */
const addToPlaylist = (username, token, artworkID, playlistID) => {
    let body = {
        artworks: [artworkID],
        playlist: playlistID
    };

    return axios.post(`${API_URL}/playlists/add_artwork`, body, {
        headers: {
            "x-access-token": token,
            "x-user-id": username,
        }
    })
        .then((response) => {
            console.log(`✅  Added to playlist`);
        })
        .catch((error) => {
            console.log(`❌  Error: Unknown error adding to playlist ${error}`);
        })
}

// Check that correct number of parameters were provided
if (process.argv.length !== 3) {
    console.log(`Provide three arguments: node index.js /full/path/to/image.jpg`);
    process.exit(1);
}

// Check that the .env file is filled out correctly
if (!process.env.USERNAME || !process.env.PASSWORD || !process.env.PLAYLIST) {
    console.log(`Please create an .env file with USERNAME, PASSWORD, and PLAYLIST. See README.md for more details.`);
    process.exit(1);
}

// Image Paths are provided in a comma seperated string
// e.g. "path/one.jpg,path/two.jpg"
const imagePaths = process.argv[2];

// For each image path and upload them to the API
imagePaths.split(/\s*,\s*/).forEach(function(imagePath) {
    /**
     * Order of operations:
     * 1. Authenticate via Canvia API to get `token`
     * 2. Create an `artworkID`s
     * 3. Use the `artworkID` to upload local image
     * 4. Add the `artworkID` to a playlist
     */
    return authenticate(process.env.USERNAME, process.env.PASSWORD)
        .then(token => createArtworkID(token, imagePath))
        .then(({token, artworkID}) => upload(process.env.USERNAME, token, artworkID, imagePath))
        .then(({token, artworkID}) => addToPlaylist(process.env.USERNAME, token, artworkID, process.env.PLAYLIST))
        .catch(() => console.log(`❗ ️Unable to upload image, please see errors above.`));
});
