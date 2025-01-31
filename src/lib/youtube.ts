import { TRPCError } from "@trpc/server";
import axios from "axios";
import { YoutubeTranscript } from 'youtube-transcript'

export async function searchYoutube(searchQuery: string) {
   try {
      searchQuery = encodeURIComponent(searchQuery)
      const { data } = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
      )
      if(!data || data.items[0] === undefined) throw new Error('youtube search failed')
      return data.items[0].id.videoId
   } catch(err) {
       console.error(err)
       throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error getting video for the chapter'})
   }
}

export async function getTranscript(videoId: string) {
     try {
         let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en'})
         let transcript = ""
         for(let t of transcript_arr) {
            transcript += t.text + " "
         }
         return transcript.replaceAll('\n', '')
     } catch(err) {
        console.error(err)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error getting transcript for the video'})
     }
}