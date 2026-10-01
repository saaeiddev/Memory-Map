import type { Memory, MemoryMedia, Person } from '../types'
import { supabase } from './supabase'

type CloudMemory = {
  id:string; user_id:string; title:string; description:string|null; memory_date:string; date_precision:Memory['datePrecision'];
  latitude:number; longitude:number; city:string; country:string; emotion:Memory['emotion']; people:Person[]|null; tags:string[]|null;
  media:Array<Omit<MemoryMedia,'url'>&{url?:string;storagePath?:string}>|null; is_favorite:boolean; created_at:string; updated_at:string
}

function requireClient(){if(!supabase)throw new Error('Supabase is not configured.');return supabase}

async function signedMedia(media:CloudMemory['media']):Promise<MemoryMedia[]> {
  const client=requireClient()
  return Promise.all((media??[]).map(async item=>{
    if(item.storagePath){
      const {data}=await client.storage.from('memory-media').createSignedUrl(item.storagePath,60*60)
      return {...item,url:data?.signedUrl??''} as MemoryMedia
    }
    return {...item,url:item.url??''} as MemoryMedia
  }))
}

function extFor(item:MemoryMedia){const mime=item.mime??'';if(mime.includes('png'))return'png';if(mime.includes('jpeg')||mime.includes('jpg'))return'jpg';if(mime.includes('mp4'))return'mp4';if(mime.includes('webm'))return'webm';if(mime.includes('mpeg'))return'mp3';return item.type==='image'?'jpg':item.type==='video'?'mp4':'webm'}

async function uploadMedia(userId:string,memoryId:string,media:MemoryMedia[]) {
  const client=requireClient()
  const result:Array<Omit<MemoryMedia,'url'>&{url?:string;storagePath?:string}>=[]
  for(const item of media){
    if(item.storagePath){result.push({...item,url:undefined});continue}
    if(item.url.startsWith('data:')){
      const blob=await fetch(item.url).then(r=>r.blob())
      const path=`${userId}/${memoryId}/${item.id}.${extFor(item)}`
      const {error}=await client.storage.from('memory-media').upload(path,blob,{upsert:true,contentType:item.mime||blob.type})
      if(error)throw error
      result.push({id:item.id,type:item.type,name:item.name,mime:item.mime,storagePath:path})
    }else result.push({...item})
  }
  return result
}

export async function fetchCloudMemories(userId:string):Promise<Memory[]> {
  const client=requireClient()
  const {data,error}=await client.from('memories').select('*').eq('user_id',userId).order('memory_date',{ascending:false})
  if(error)throw error
  return Promise.all((data as CloudMemory[]).map(async row=>({
    id:row.id,title:row.title,description:row.description??'',memoryDate:row.memory_date,datePrecision:row.date_precision,
    latitude:Number(row.latitude),longitude:Number(row.longitude),city:row.city,country:row.country,emotion:row.emotion,
    people:row.people??[],tags:row.tags??[],media:await signedMedia(row.media),isFavorite:row.is_favorite,createdAt:row.created_at,updatedAt:row.updated_at
  })))
}

export async function saveCloudMemory(userId:string,memory:Memory):Promise<Memory> {
  const client=requireClient()
  const media=await uploadMedia(userId,memory.id,memory.media)
  const payload={id:memory.id,user_id:userId,title:memory.title,description:memory.description,memory_date:memory.memoryDate,date_precision:memory.datePrecision,latitude:memory.latitude,longitude:memory.longitude,city:memory.city,country:memory.country,emotion:memory.emotion,people:memory.people,tags:memory.tags,media,is_favorite:memory.isFavorite,created_at:memory.createdAt,updated_at:new Date().toISOString()}
  const {data,error}=await client.from('memories').upsert(payload).select('*').single()
  if(error)throw error
  const row=data as CloudMemory
  return {...memory,media:await signedMedia(row.media),updatedAt:row.updated_at,demo:false}
}

export async function deleteCloudMemory(userId:string,memory:Memory){
  const client=requireClient()
  const paths=memory.media.map(m=>m.storagePath).filter(Boolean) as string[]
  if(paths.length)await client.storage.from('memory-media').remove(paths)
  const {error}=await client.from('memories').delete().eq('id',memory.id).eq('user_id',userId)
  if(error)throw error
}
