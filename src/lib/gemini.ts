import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai'
import { TRPCError } from '@trpc/server';
import { z } from 'zod'
import { Level } from '@prisma/client';

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
            - **chapters**: (array) A list of chapters (not more than *5* chapters), where each chapter contains:
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
        if(!result.success) {
          console.error('Validation errors:', result.error.format());
          throw new Error(`Invalid output units: ${result.error.flatten().fieldErrors}`)
        }
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
        return cleanData
    } catch(err) {
        console.error('Error getting response: ', err)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get image search term'})
    }
}

export async function getVideoSummary(transcript: string) {
     try {
        const { text } = await generateText({
            temperature: 1,
            model: google('gemini-1.5-flash'),
            prompt: `
              You are an AI capable of summarising a youtube transcript.
              summarise in 250 words or less and do not talk of the sponsors or anything unrelated to the main topic, also do not introduce what the summary is about.
              Do not explicitly state that this is a summary.
              --
              Transcript: ${transcript}
              --
              `
        })
         const cleanData = text.replace(/```json\s*|\s*```/g, '').trim()
         return cleanData
     } catch(err) {
         console.error('Error generating video summary',err)
         throw new Error('Error generating summary')
     }
}

const questionSchema = z.object({
    question: z.string(),
    answer: z.string(),
    options: z.array(z.string()).length(4)
})

export async function getQuestions(chapter_name: string, transcript: string, level: Level) {
    try {
      const { response } = await model.generateContent([
        `You are a helpful AI that is able to generate mcq questions and answers, the length of each answer should not be more than 15 words
         ### **Task**:
         Generate **5 ${level} level MCQ questions** related to **"${chapter_name}"** using the context from the provided transcript 

         --
         Transcript: ${transcript}
         --

        ### **Question Format**:
        - **question**: (string) The MCQ question.
        - **answer**: (string) The correct answer (max 15 words).
        - **options**: (array of strings) A list of **4 options**, including the correct answer and 3 incorrect answers (max 15 words).

         ### **Output Format** (JSON array):
          [
            {
                "question": "Your MCQ question here?",
                "answer": "Correct answer (max 15 words)",
               "options": [
                    "Correct answer (max 15 words)",
                    "Incorrect option 1 (max 15 words)",
                    "Incorrect option 2 (max 15 words)",
                    "Incorrect option 3 (max 15 words)"
                  ]
               }
          ]
          Now, generate **5 such MCQs** (JSON array of **5** questions) based on the transcript.
        `
      ])

      const text = response.text()
      const cleanData = text.replace(/```json\s*|\s*```/g, '').trim()
      const questions = JSON.parse(cleanData)
      const result = questionSchema.array().safeParse(questions)
      if(!result.success) {
        console.error('Validation errors:', result.error.format());
        throw new Error(`Invalid output units: ${result.error.flatten().fieldErrors}`)
      }
      return result.data
    
    } catch(err) {
        console.error('Error generating questions',err)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error generating questions'})
    }
}

// export async function getChaptersSummaries() {

// }

const chapterContentSchema = z.object({
    summary: z.string(),
    questions: z.array(questionSchema)
})

type chapterContentType = z.infer<typeof chapterContentSchema>

// chapter_name will be unique or use chapter_id instead to avoid any bug
export async function getChapterContents(chapters: {name: string, transcript: string} [], level: Level): Promise<Record<string, chapterContentType>> {
    console.log('Generating chapters content')
    try {
         const prompt = `
            You are an AI assistant that generates comprehensive learning materials for course chapters.

            ### Task:
            For each chapter, generate:
            1. A concise summary (250 words or less) of the transcript
            2. 5 ${level}-level MCQ questions with answers and options

            ### Input Chapters:
            ${chapters.map((chapter,i) => `
               Chapter ${i + 1}: "${chapter.name}"  
               Transcript: ${chapter.transcript} 
            `).join('\n')}

              ### Output Format (JSON):
            {
                "Chapter 1 Name": {
                    "summary": "Concise summary of the chapter content...",
                    "questions": [
                        {
                            "question": "MCQ question text?",
                            "answer": "Correct answer (max 15 words)",
                            "options": [
                                "Correct answer",
                                "Incorrect option 1",
                                "Incorrect option 2",
                                "Incorrect option 3"
                            ]
                        },
                        // ...4 more questions
                    ]
                },
                // ...other chapters
            }

                  Important Rules:
            1. Use EXACTLY these chapter names as keys: ${chapters.map(c => `"${c.name}"`).join(', ')}
            2. Each chapter must have exactly 5 questions
            3. Summary must be under 250 words
            4. Respond ONLY with valid JSON, no other text or markdown
            5.Options in the question should be 4 only

             Now generate the output for all ${chapters.length} chapters.

         `
         const { response } = await model.generateContent([prompt])
         const text = response.text()
         const cleanData = text.replace(/```json\s*|\s*```/g, '').trim()
         const output = JSON.parse(cleanData)
        //  console.log(output)
         const result = z.record(z.string(), chapterContentSchema).safeParse(output)
         if(!result.success) {
            console.error('Validation errors:', result.error.format());
            throw new Error(`Invalid output format: ${JSON.stringify(result.error.flatten())}`);
         }
         const missingChapters = chapters.filter(c => !result.data[c.name])
         if(missingChapters.length > 0) {
            throw new Error(`Missing chapters in response: ${missingChapters.map(c => c.name).join(', ')}`)
         }
         return result.data
    } catch(err) {
        console.error('Error generating chapter contents', err)
        throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', message: 'Error generating chapter contents'})
    }
}