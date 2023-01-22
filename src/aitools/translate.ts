import { runCached } from "./cache";
import { openai } from "./openai";

function isValidLang(lang: string) {
    return /[A-Za-z]+/.test(lang)
}

const translator = runCached('translate', async (text, lang) => {
    if (!isValidLang(lang)) return text

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Translate to ${lang} maintaining format:\n----\n\n${text}\n----\n`,
        temperature: 0.7,
        max_tokens: text.length,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    return response.data.choices[0].text || '' 
})

export function translate(text: string, lang: string) {
    return translator(text, lang)
}

