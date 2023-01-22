import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
    apiKey: import.meta.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);