import { languages } from "./internationalization";

export interface DocData {
    id: string // Firebae generated id
    _created: number // Internal use
    _updated?: number // Internal use
}

export function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function defaultLangSingleRoutePaths() {
    return [{ params: { lang: languages.default } }]
}

export function multiLangSingleRoutePaths(langs: string[]) {
    return () => {
        return langs.map(lang => { return { params: { lang } } })
    }
}


export function supportAllLanguagesRoutePaths() {
    return languages.list.map(lang => { params: { lang: lang.code } })
}

export function docsOf<T extends DocData>(queryResult: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>) {
    return queryResult.docs.map(doc => docOf<T>(doc)!)
}


export function docOf<T extends DocData>(docResult: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>) {
    if (!docResult.exists) return null
    const doc: any = docResult.data()
    doc._created = docResult.createTime
    doc._updated = docResult.updateTime
    doc.id = docResult.id
    return doc as T
}