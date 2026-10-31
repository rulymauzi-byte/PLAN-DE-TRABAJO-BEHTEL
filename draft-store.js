const KEY='bethel-new-year-drafts-v3';
export function readDrafts(storage){for(const key of [KEY,KEY+'-backup']){try{const value=JSON.parse(storage.getItem(key)||'null');if(value&&value.version===3&&value.drafts&&typeof value.drafts==='object')return value;}catch{}}return{version:3,drafts:{},activeYear:null};}
export function saveDrafts(storage,value){const text=JSON.stringify(value),previous=storage.getItem(KEY);if(previous)storage.setItem(KEY+'-backup',previous);storage.setItem(KEY,text);if(storage.getItem(KEY)!==text)throw Error('No se pudo comprobar el guardado local.');}
