import { LocalStorage } from "node-localstorage";
import sha1 from 'sha1'

function hash(text: string) {
    return sha1(text).toString()
}

const localStorage = new LocalStorage('./.aicache')


interface CacheStoredItem {
    query: string
    output: string
    timestamp: number
}

export function runCached(name: string, action: (...input: string[]) => Promise<string>): (...input: string[]) => Promise<string> {
    return async function (...input: string[]) {
        const query = name + ':' + input.map(encodeURIComponent).join('-')
        const hashed = hash(query)

        const loaded = localStorage.getItem(hashed)
        let result: CacheStoredItem | null = null
        if(loaded != null) {
            result = JSON.parse(loaded) as CacheStoredItem
        } 

        if(!result) {
            console.log("NOCACHE", name, JSON.stringify(input))
            const output = await action(...input)
            result = {
                output,
                query,
                timestamp: Date.now()
            }
            localStorage.setItem(hashed, JSON.stringify(result))
        }

        return result.output;
    }
}