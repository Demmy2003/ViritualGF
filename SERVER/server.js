// console.log(process.env.AZURE_OPENAI_API_KEY)
// console.log("hello world")

import express from "express";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages"
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const chatHistory = []

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
const main = async () => {
    try {
        const model = createChatModel();


        app.get("/joke", async (req, res) => {
            try {

                const joke = await model.invoke("tell me a joke");
                res.json({ content: joke.content });
            } catch (error) {
                console.error("Error:", error.message);
                res.status(500).json({ error: "ERROR 500: Internal Server Error" });
            }
        });

        app.post("/chat", async (req, res) => {
            try {

                const userQuery = req.body.query;
                chatHistory.push(new HumanMessage(userQuery));

                const messages = chatHistory.map(item => [item.role, item.content]);

                const character = `You are my human girlfriend. please participate in our conversation '${messages}' as sweet as you can. I want your reaction to be feminine.`
                const chatResult = await model.invoke(character);

                chatHistory.push(new AIMessage(chatResult.content));
                console.log(chatHistory)

                res.json({
                    content: chatResult.content,
                    chatHistory: chatHistory.map(item => ({
                        role: item instanceof HumanMessage ? 'user' : 'ai',
                        content: item.content
                    }))
                });

            } catch (error) {
                console.error("Error:", error.message);
                res.status(500).json({ error: "ERROR 500: Internal Server Error" });
            }
        });
        app.listen(port, () => {
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













