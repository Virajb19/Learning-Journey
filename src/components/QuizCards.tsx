'use client'

import { Chapter, Question } from "@prisma/client"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { ChevronRight } from 'lucide-react'
import { Button } from "./ui/button";
import { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import { api } from "~/trpc/react";

type Props = { chapter : Chapter & { questions: Question[]}}

export default function QuizCards({ chapter }: Props) {

    // const { data: Questions, isLoading, } = api.chapters.getQuestions.useQuery({ chapterId: chapter.id})

    const [answers, setAnswers] = useState<Record<string,string>>({})
    const [questionState, setQuestionState] = useState<Record<string, boolean | null>>({})

    const questions = chapter.questions

    const CheckAnswer = useCallback(() => {
        const newQuestionState = {...questionState}
       questions.forEach(question => {
          const user_answer = answers[question.id]
          if(!user_answer) return
          if(question.answer === user_answer) {
             newQuestionState[question.id] = true
          } else {
            newQuestionState[question.id] = false
          }
       })
       setQuestionState(newQuestionState)
    }, [questions,answers,questionState])

  return <div className="flex-[2] p-2">
         <h1 className="text-2xl uppercase underline font-semibold">Concept Check</h1>
         <div className="flex flex-col gap-2 h-[calc(90vh-10rem)] overflow-y-scroll">
             {questions.map(question => {
                const options = question.options
                return <div key={question.id} className={twMerge("border border-secondary-foreground/20 p-2 rounded-lg text-wrap flex flex-col gap-2",
                    questionState[question.id] === true && 'bg-red-700',
                    questionState[question.id] === false && 'bg-green-700',
                    questionState[question.id] === null && 'bg-secondary'
                )}>
                      <h4 className="font-semibold text-lg">{question.question} ?</h4>
                      <RadioGroup onValueChange={val => {
                          setAnswers(prev => ({
                            ...prev,
                            [question.id]: val
                          }))
                      }}>
                          {options.map((option,i)=> {
                             return <div key={i} className="flex items-center gap-2">
                                 <RadioGroupItem value={option} id={question.id + i.toString()}/>
                                 <Label htmlFor={question.id + i.toString()}>{option}</Label>
                             </div>
                          })}
                      </RadioGroup>
                </div>
             })}
         </div>
        <Button onClick={CheckAnswer} className="w-full mt-4 font-bold group">
             CheckAnswer <ChevronRight className="group-hover:translate-x-1 duration-200"/>
        </Button>
  </div>
}