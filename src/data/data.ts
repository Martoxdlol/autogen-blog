import { openai } from "../aitools/openai"
import { DocData, docOf, docsOf } from "../util/util"
import { firestore } from "./config"
import { generateAuthorSelfDescription, generateAuthorsNamesAndLangs, generateCategoriesTitles, generateCategoryDescription, generatePostContent, generatePostsTitlesFromCategory, generateSlug, generateSlugFromTitle, generateSummary, generateTopics, matchTitleToAuthor } from "./generators"

export interface Category extends DocData {
    name: string
    description: string
    picture: string
    slug: string
}

export interface Author extends DocData {
    name: string
    picture: string
    lang: string
    topics: string[]
}

export interface Post extends DocData {
    slug: string // Single language
    lang: string // Default language (original), based on author
    picture: string
    title: string
    summary: string
    content: string
    author: string // Ficitcious author
    date: number // Date of the event/new/post
    category: string
}

const MAX_CATEGORIES = parseInt(import.meta.env.MAX_CATEGORIES || 20)
const MAX_AUTHORS = parseInt(import.meta.env.MAX_AUTHORS || 20)
const MAX_POST_PER_CATEGORY = parseInt(import.meta.env.MAX_POST_PER_CATEGORY || 5)
const disableGenEnv = import.meta.env.DISABLE_GENERATION?.trim().toLowerCase()
const DISABLE_GENERATION = disableGenEnv === 'true' || disableGenEnv === 'yes'


if(DISABLE_GENERATION) {
    console.log('\x1b[36m******************************************************************************\x1b[0m')
    console.log("GENERATION DISABLED")
    console.log('\x1b[36m******************************************************************************\x1b[0m')
}

// Authors
export async function getCategories(): Promise<Category[]> {
    const categories = docsOf<Category>(await firestore.collection('categories').get())

    if (categories.length < MAX_CATEGORIES && !DISABLE_GENERATION) {
        const newTitles = await generateCategoriesTitles(categories, MAX_CATEGORIES)
        for (const title of newTitles) {
            const description = await generateCategoryDescription(title)
            const slug = await generateSlugFromTitle(title)
            const result = await firestore.collection("categories").add({ name: title, description, slug })
            categories.push(docOf(await firestore.collection('categories').doc(result.id).get())!)
        }
    }

    return categories
}

export async function getCategory(id: string, lang: string) {
    return docOf<Category>(await firestore.collection('categories').doc(id).get())
}


// Authors
export async function getAuthors(): Promise<Author[]> {
    const authors = docsOf<Author>(await firestore.collection('authors').get())

    if (authors.length < MAX_AUTHORS && !DISABLE_GENERATION) {
        const newAuthors = await generateAuthorsNamesAndLangs(authors, MAX_CATEGORIES)
        for (const author of newAuthors) {
            const description = await generateAuthorSelfDescription(author.name, author.lang)
            const allTopics = await generateTopics()
            const topics = chooseRandoms(allTopics, random(2, 3))
            const result = await firestore.collection("authors").add({ lang: author.lang, name: author.name, description, topics })
            authors.push(docOf(await firestore.collection('authors').doc(result.id).get())!)
        }
    }

    return authors
}

export async function getAuthor(id: string) {
    return docOf<Author>(await firestore.collection('authors').doc(id).get())
}


// Posts
export async function getPosts(category: string): Promise<Post[]> {
    const categoryDoc = docOf<Category>(await firestore.collection('categories').doc(category).get())
    if (!categoryDoc) return []
    const posts = docsOf<Post>(await firestore.collection('posts').where('category', '==', category).get())

    if (posts.length < MAX_POST_PER_CATEGORY && !DISABLE_GENERATION) {
        const newPostsTitles = await generatePostsTitlesFromCategory(posts, categoryDoc.name, MAX_POST_PER_CATEGORY)
        for (const title of newPostsTitles) {
            const author = await matchTitleToAuthor(await getAuthors(), title)
            const content = await generatePostContent(author, title, categoryDoc.name, random(400, 700), random(700, 2300))
            const summary = await generateSummary(title, content)
            const lang = author.lang
            const slug = await generateSlug(title)
            const result = await firestore.collection("posts").add({ title, author: author.id, lang, summary, content, slug, category: categoryDoc.id })
            posts.push(docOf<Post>(await firestore.collection('posts').doc(result.id).get())!)
        }
    }

    return posts
}

export async function getPost(id: string, lang: string) {
    return docOf<Post>(await firestore.collection('posts').doc(id).get())
}



function random(mn: number, mx: number) {
    return Math.random() * (mx - mn) + mn;
}

function chooseRandoms(list: string[], numOfElements: number) {
    let randomIndexes: number[] = []
    let result = [];
    let max = list.length;
    for (var i = 0; i < numOfElements; i++) {
        var randomIndex = Math.floor(Math.random() * max);
        while (randomIndexes.includes(randomIndex)) {
            randomIndex = Math.floor(Math.random() * max);
        }
        randomIndexes.push(randomIndex);
        result.push(list[randomIndex]);
    }
    return result;
}