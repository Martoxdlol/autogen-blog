import { openai } from "../aitools/openai";
import type { Author, Category, Post } from "./data";

async function autocomplete(prompt: string, maxTokens: number) {
    await delay(2000)
    console.log("AUTOCOMPLETE REQUEST")
    let response
    try {
        response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        })
    } catch (error) {
        console.log((error as any).response.data)
        throw new Error("Api error: " + (error as any).response.data.error.message)
    }


    const result = (response.data.choices[0].text || '').trim()
    console.log("\x1b[35m" + prompt + "\x1b[36m" + response.data.choices[0].text + "\x1b[0m")
    console.log("AUTOCOMPLETE ENDED")

    return result
}

function separateList(text: string) {
    let lines = text.split('\n')
    lines = lines.map(line => line.replace(/^(([0-9]+\. *)|([0-9]+ *\- *)|( *\- *))/gi, ''))
    lines = lines.map(line => {
        if (/^(".*")|('.*')$/.test(line)) return line.substring(1, line.length - 1)
        return line
    })
    return lines
}

export async function generateCategoriesTitles(initialCategories: Category[], maxAmount: number) {
    const newCategoriesAmount = maxAmount - initialCategories.length

    let prompt = 'This is a list of topics:\n'

    const topics = await generateTopics(Math.floor(maxAmount * 2.5))

    for (const topic of topics) {
        prompt += '\n-' + topic
    }

    prompt += `\n\nGenerate ${maxAmount} blog categories based on the topics:\n`
    for (const category of initialCategories) {
        console.log(category)
        prompt += '\n-' + category.name
    }

    // Generate categories
    const result = await autocomplete(prompt, 40 * newCategoriesAmount)

    return separateList(result)
}

export function generateCategoryDescription(title: string) {
    const prompt = "part of my general knowledge blog.\n"
        + 'Category: "' + title + '"\n'
        + "Description for SEO (250 characters long):"
    return autocomplete(prompt, 300)
}

export function generateSlugFromTitle(title: string) {
    return generateSlug(title)
    /// FUCK AI
    // const prompt = "Task: create slug for this title: \n" + title
    //     + '\n---\n'
    //     + "slug:"
    // return autocomplete(prompt, 100)
}

export async function generateAuthorsNamesAndLangs(initialAuthors: Author[], maxAmount: number) {
    const newAuthorsAmount = maxAmount - initialAuthors.length

    let prompt = `Task: list ${maxAmount} names from different nationalities and say the native speaking language\n`
    prompt += 'Format: [language code]: [First Name] [Last Name]\n---'
    for (const author of initialAuthors) {
        prompt += `\n${author.lang}:${author.name}`
    }

    // Generate categories
    const result = await autocomplete(prompt, 40 * newAuthorsAmount)

    return result.split('\n').map(r => {
        const arr = r.split(':')
        return {
            name: arr[1]!,
            lang: arr[0]
        }
    })
}

let topics: string[] | null = null

export async function generateTopics(limit: number = 30) {
    if (topics) return topics
    const generated = separateList(await autocomplete(`List ${limit} general topics of blogs and news:`, limit * 40))
    topics = generated
    return topics
}

export async function matchTitleToAuthor(authors: Author[], title: string) {
    let prompt = `These are authors from my blog and the topics each one writes about
    Format: [language code]: [First Name] [Last Name] - [Topics of the author]`
    let i = 1
    for (const author of authors) {
        prompt += `\n${i}. ${author.lang}:${author.name} - ${author.topics.join(',')}`
        i++
    }
    prompt += `\n\nMatch one of above with this blog post title "${title}" considering the correct topic:\nNumber: `
    const result = await autocomplete(prompt, 10)
    return authors[parseInt(result) - 1]
}

export async function generateAuthorSelfDescription(name: string, lang: string) {
    const prompt = `Task: make a 300 characters self description
    Name: ${name}
    Output language: ${lang}
    ---`
    return await autocomplete(prompt, 400)
}

export async function generatePostsTitlesFromCategory(initialPosts: Post[], categoryName: string, maxAmount: number) {
    let prompt = `These are 10 titles of my general knowledge blog posts in the category named "${categoryName}"
    Be interesting
    Do not repeat "${categoryName}" 
    ---`
    for (const post of initialPosts) {
        prompt += `\n- ${post.title}`
    }
    return separateList(await autocomplete(prompt, maxAmount * 40))
}

export async function generatePostContent(author: Author, title: string, categoryName: string, minLength: number, maxLength: number) {
    return await autocomplete(`Generate a blog post content in markdown and informal language considering:
    Post title: "${title}"
    Author name: "${author.lang}"
    Language: "${author.lang}"
    Blog category: "${categoryName}"
    Min length: ${minLength} characters
    Max length: ${maxLength} characters
    
    Include a conclusión and add sources
    ---`, maxLength + 100)
}

export async function generateSummary(title: string, text: string) {
    return await autocomplete(`Title: "${title}"
    
    ${text}

    Summary optimized for SEO (300 characters):`, 400)
}

export async function generateSlug(title: string) {
    return (await autocomplete(`Title: "${title}"
slug:`, 400)).split('\n').filter(l => l.trim() != '')[0].trim()
}

async function delay(ms: number) {
    return new Promise((res, rej) => setTimeout(res, ms))
}