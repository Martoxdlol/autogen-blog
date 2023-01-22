import { runCached } from "./cache";
import { openai } from "./openai";

const titleGenerator = runCached('generate-title', async (text) => {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Generate a short title for a post with this content:\n----\n${text}\n----\nTitle:`,
        temperature: 0.7,
        max_tokens: Math.floor(text.length / 2),
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    return (response.data.choices[0].text || '').trim()
})

export function generateTitle(text: string) {
    return titleGenerator(text)
}

