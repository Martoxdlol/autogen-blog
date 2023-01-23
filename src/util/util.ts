import { languages } from "./internationalization";

export function getSlug(path: string) {
    const arr = path.split("/").at(-1)!.split(".");
    arr.pop();
    const slug = arr?.join(".");
    return slug.toLocaleLowerCase();
}

export function defaultLangSingleRoutePaths() {
    return [{ params: { lang: languages.default } }]
}

export function supportAllLanguagesRoutePaths() {
    return languages.list.map(lang => { params: { lang: lang.code } })
}

export function sanitizeSlug(slug: string) {
    return slug.trim().replace(/[\/\\\#"']/gi, '_')
}