import { Configuration, OpenAIApi } from 'openai'
import * as dotenv from 'dotenv'
dotenv.config()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

openai.createCompletion({
    model: "text-davinci-003",
    prompt: "repeat 'test':",
    temperature: 0.7,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
}).then(response => {
    console.log(response.data)
}).catch(error => console.log(error.response.data.error))