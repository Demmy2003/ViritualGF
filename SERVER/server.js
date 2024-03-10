// console.log(process.env.AZURE_OPENAI_API_KEY)
// console.log("hello world")

import express from "express";
import { ChatOpenAI } from "@langchain/openai";
import {HumanMessage, AIMessage, SystemMessage} from "@langchain/core/messages"
import cors from "cors";
import Typo from "typo-js";
import SpotifyWebApi from "spotify-web-api-node";

const app = express();
const port = process.env.PORT || 3000;
const dictionary = new Typo('en_US');


app.use(cors());
app.use(express.json());

// const chatHistory = []

const createChatModel = () => {
    return new ChatOpenAI({
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
        azureOpenAIApiVersion: process.env.OPENAI_API_VERSION,
        azureOpenAIApiInstanceName: process.env.INSTANCE_NAME,
        azureOpenAIApiDeploymentName: process.env.ENGINE_NAME,
        temperature: 1,
        maxTokens: 200,

    });
};

const spotifyApi = new SpotifyWebApi({
    clientId: 'd0767228d3064a1fae33a09aebf86d92',
    clientSecret: '47a6535be84d42a59fbb0df7de0acea6',
    redirectUri: 'https://viritualgirlfriend.netlify.app/client/?_ijt=cllf1t9u0uii3aji4id2ve8vdi&_ij_reload=RELOAD_ON_SAVE',
});
// Function to authenticate with Spotify and set access token
async function authenticateWithSpotify() {
    try {
        const data = await spotifyApi.clientCredentialsGrant();
        const accessToken = data.body['access_token'];
        spotifyApi.setAccessToken(accessToken);
        console.log('Successfully authenticated with Spotify');
    } catch (error) {
        console.error('Error authenticating with Spotify:', error);
    }
}

// Call the authentication function on startup
authenticateWithSpotify();



function correctTypos(userInput) {
    // Split the input into words
    const words = userInput.split(' ');

    // Correct typos in each word
    const correctedWords = words.map(word => {
        const suggestions = dictionary.suggest(word);
        return suggestions.length > 0 ? suggestions[0] : word;
    });

    // Join the corrected words back into a sentence
    return correctedWords.join(' ');
}

const main = async () => {
    try {
        const model = createChatModel();


        app.get("https://viritualgirlfriend.netlify.app/joke", async (req, res) => {
            try {

                const joke = await model.invoke("tell me a joke");
                res.json({ content: joke.content });
            } catch (error) {
                console.error("Error:", error.message);
                res.status(500).json({ error: "ERROR 500: Internal Server Error" });
            }
        });

        app.post("https://viritualgirlfriend.netlify.app/chat", async (req, res) => {
            try {

                const userQuery = req.body.query;
                const correctedQuery = correctTypos(userQuery)

                const chatHistory = req.body.chatHistory || [];
                chatHistory.push(new HumanMessage(correctedQuery));
                if (userQuery.toLowerCase().includes('music')) {
                    // Use Spotify API to search for a track
                    const spotifySearchResult = await spotifyApi.searchTracks(userQuery);

                    // Extract relevant information from the search result
                    const track = spotifySearchResult.body.tracks.items[0];
                    const trackName = track.name;
                    const artistName = track.artists[0].name;
                    const albumName = track.album.name;

                    // Play the track (you may need to adapt this based on your application's requirements)
                    // Note: Directly playing music within a chat application may involve additional considerations
                    // and is subject to Spotify's policies.
                    // You might consider providing a link for the user to listen on Spotify.

                    // Display information about the track
                    const response = `Do you mean ${trackName} by ${artistName} from the album ${albumName}.`;
                    chatHistory.push(new AIMessage(response));

                    res.json({
                        content: response,
                        chatHistory: chatHistory.map(item => ({
                            role: item instanceof HumanMessage ? 'user' : 'ai',
                            content: item.content
                        }))
                    });
                } else {
                    const messages = chatHistory.map(item => {
                        if (item.role === 'user') {
                            return new HumanMessage(item.content);
                        } else if (item.role === 'ai') {
                            return new AIMessage(item.content);
                        }
                        // Handle other roles if needed
                        return null;
                    });
                    const content = messages.join(' ');
                    const prompt = [
                        new SystemMessage("You are the users girlfriend."),
                        new SystemMessage("React as sweetly as you can. I want your response to be feminine."),
                        new SystemMessage("Avoid mentioning any information about being an AI."),
                        new SystemMessage("You are not an AI"),
                        content,
                        new HumanMessage(userQuery)
                    ];

                    const chatResult = await model.invoke(prompt);

                    chatHistory.push(new AIMessage(chatResult.content));
                    console.log(chatHistory)

                    res.json({
                        content: chatResult.content,
                        chatHistory: chatHistory.map(item => ({
                            role: item instanceof HumanMessage ? 'user' : 'ai',
                            content: item.content
                        }))
                    });

                }

            } catch (error) {
                console.error("Error:", error.message);
                res.status(500).json({ error: "ERROR 500: Internal Server Error" });
            }
        });
        app.listen(port, '0.0.0.0', () => {
            console.log(`Server is running on port ${port}`);
        });
        const joke = await model.invoke("what is 9+10?");
        console.log(joke.content);
    } catch (error) {
        console.error("Error:", error.message);
    }
};

// Roep de hoofdfunctie aan
main();













