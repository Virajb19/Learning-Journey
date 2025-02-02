import { Chapter, Unit } from "@prisma/client"

type Props = { unit: Unit, chapter: Chapter, unitIdx: number, chapterIdx: number}

export default function VideoSummary({ unit, chapter, unitIdx, chapterIdx}: Props) {
  return <div className="flex flex-col gap-3 w-1/2">
        <div className="flex flex-col gap-2">
           <h4 className="uppercase text-lg font-semibold text-secondary-foreground/60 flex items-center">
             unit {unitIdx + 1} 
             <div className="size-2 bg-gray-400 rounded-full mx-1"/>
             chapter {chapterIdx + 1}
             </h4>
           <h1 className="font-bold text-5xl truncate">{chapter.name}</h1>
           <iframe className="aspect-video max-h-[24rem] rounded-xl" allowFullScreen title="chapter video" src={`https://www.youtube.com/embed/${chapter.videoId}`}/>
           <h3 className="font-bold">Summary</h3>
           <p className="text-secondary-foreground/80 text-base">{chapter.summary}</p>
        </div>
  </div>
}