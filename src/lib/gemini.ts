import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai'
import { TRPCError } from '@trpc/server';
import { z } from 'zod'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
})

const outputUnit = z.object({
    title: z.string(),
    chapters: z.array(z.object({
        name: z.string(),
        youtube_search_query: z.string()
    }))
})

export async function generateChapters(title: string, units: string[]) {
    try {
        const { response } = await model.generateContent([`
            You are an AI that generates structured JSON output for a course syllabus. 

            Given a course title: **"${title}"**, and the following units:
            ${units.map((unit, index) => `- ${index + 1}. ${unit}`).join("\n")}

            ### **Task**:
            For each unit, generate an object with:
            - **title**: (string) The unit's name.
            - **chapters**: (array) A list of chapters, where each chapter contains:
            - **name**: (string) A descriptive title for the chapter.
            - **youtube_search_query**: (string) A query to search for educational YouTube videos on the topic.

            ### **Example Output Format**:
            \`\`\`json
            [
            {
                "title": "Unit 1 Title",
                "chapters": [
                {
                    "name": "Chapter 1 Title",
                    "youtube_search_query": "Best tutorial for Chapter 1 topic"
                },
                {
                    "name": "Chapter 2 Title",
                    "youtube_search_query": "Detailed guide on Chapter 2 topic"
                }
                ]
            }
            ]
            \`\`\`

            Now, generate the JSON output for the given course.`
        ])

        const text = response.text()
        const cleanData = text.replace(/```json\s*|\s*```/g, '').trim()
        const outputUnits = JSON.parse(cleanData)
        const result = outputUnit.array().safeParse(outputUnits)
        if(!result.success) throw new Error(`Invalid output units: ${result.error.flatten().fieldErrors}`)
        return result.data
    } catch(err) {
        console.error('Error generating chapters', err)
        if(err instanceof TRPCError) throw err
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error generating chapters'})
    }
    
}

export async function getImageSearchTerm(prompt: string) {
    try {
        const { text } = await generateText({
            temperature: 1,
            model: google('gemini-1.5-flash'),
            prompt
        })

        const cleanData = text.replace(/```json\s*|\s*```/g, '').trim()
        return cleanData.trim()
    } catch(err) {
        console.error('Error getting response: ', err)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get image search term'})
    }
}