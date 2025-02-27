// @/app/page.tsx
"use client";

import Typing from "@/components/ui/typed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button"
import { Textarea } from "@/components/ui/textarea";
import { Moon, Sparkles, Sun, ArrowUpRight } from "lucide-react";
import VideoPlayer from "@/components/ui/video";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useCallback } from "react";
import type { BookResult } from "./api/chat/route";
// import { Input } from "postcss";

type ChatReturnType = ReturnType<typeof useChat>;
type Message = ChatReturnType["messages"][number];
type MessagePart = Message["parts"][number];

const BookResult = ({ result }: { result: BookResult }) => {
  return (
    <div className="rounded-lg bg-violet-950 p-4 my-2">
      <img src={result.coverImage} alt="book cover image" />
      <p>Name: {result.name}</p>
      <p>Author: {result.author}</p>
      <p>Description: {result.description}</p>
    </div>
  );
};

const MessagePart = ({ part }: { part: MessagePart }) => {
  if (!part) return null;


  if (part.type === "tool-invocation") {
    // debugger;
    console.log('we\'re in ', part, part.toolInvocation);
    const { toolInvocation } = part;

    if (
      toolInvocation.toolName === "book" &&
      toolInvocation.state === "result"
    ) {
      return (
        <div className="border-l-2 border-violet-400 pl-4 my-2">
          <p className="text-sm text-slate-400">The Singularity Choice</p>
          <BookResult result={toolInvocation.result} />
        </div>
      );
    }

    if (
      toolInvocation.toolName === "bookQuiz" &&
      toolInvocation.state === "result"
    ) {
      return (
        <div className="border-l-2 border-violet-400 pl-4 my-2">
          <p className="text-sm text-slate-400">The Void Quiz Choice</p>
          <BookResult result={toolInvocation.result} />
        </div>
      );
    }
    return null;
  }


  if (part.type === "text") {
    let jsonArr = [];

    if (part.text.includes('```json')) {
      let result = part.text.substring(part.text.indexOf('{'));
      result = result.replaceAll('`', '');
      console.log(result);
      const jsonResult = JSON.parse(result);
      jsonArr = jsonResult.quiz;
      console.log('JSONARR ', jsonArr);
    }
    console.log('we\'re in text', part, part.text);
    return <div className="text-left">
      {/* <Typing copy={landingCopy} /> */}
      {jsonArr.map((item: any) => (
        <div className="border-l-2 border-violet-400 pl-4 my-2">
          <p className="text-sm text-slate-400">{item.question}</p>
          {item.options.map((option: any) => (
            <p className="text-sm text-slate-400">{option}</p>
          ))}
        </div>
      ))}
      {part.text}
    </div>;
  }
  return null;
};

export default function Home() {
  const { messages, input, status, handleInputChange, handleSubmit, setMessages } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReset = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll when messages change

  return (
    <div className="border border-white flex flex-col relative w-full max-w-md py-24 mx-auto stretch gap-6 pb-[200px]">
      <div className="flex w-full flex justify-center">
        <Button
          size="lg"
          variant={"ghost"}
          className="serif font-medium text-3xl text-center mt-4 p-4"
          onClick={handleReset}
        >
          the Bodleian
        </Button>
      </div>
      {messages.length === 0 && (
        <div className="inner serif text-center p-16">
          <p>Ah, a brave soul!</p>
          <p className="mt-2">You've entered the void searching for your next great read...are you?</p>
          <p className="mt-2">I am the keeper of forgotten stories, the curator of literary chaos, the black hole librarian.</p>
          <p className="mt-2">I know what you seek, and this singularity is ready to deliver… if you dare...</p>
        </div>
      )}
      {messages.length > 0 && (
        <div>
          {messages.map((m) => (
            <div key={m.id} className="flex flex-col gap-2 animate-in mt-4">
              {m.role === "user" ? (
                <div className="rounded-md dark:bg-purple-950 p-2 px-4 sans-serif flex gap-2 items-center flex-row-reverse">
                  <p>{m.content}</p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Avatar>
                    <AvatarImage src="bodie.png" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 align-start">
                    {m.parts?.map((part, index) => (
                      <MessagePart key={index} part={part} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div ref={messagesEndRef} />

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 z-10 right-0 mb-8 w-full flex items-center justify-center"
      >
        <div className="relative w-[456px]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center w-full">
              <RainbowButton onClick={() => {
                const event = {
                  target: {
                    value: 'Quiz me',
                  },
                } as React.ChangeEvent<HTMLTextAreaElement>;
                handleInputChange(event);
              }}>
                Answer the Void
                <ArrowUpRight className="w-3.5 h-3.5 text-white/90 ml-2" />
              </RainbowButton>

              <RainbowButton
                className="mt-8 mb-64"
                onClick={() => {
                  const event = {
                    target: {
                      value: 'Give me a book',
                    },
                  } as React.ChangeEvent<HTMLTextAreaElement>;
                  handleInputChange(event);
                }}>
                <Sparkles className="w-3.5 h-3.5 text-white/90 mr-2" />
                Tempt the Singularity
              </RainbowButton>
            </div>
          )}
          {messages.length > 0 && (
            <div className="relative w-full mt-8">
              <Textarea
                className="dark:bg-purple-950 bg-white/50 backdrop-blur-xl rounded-xl w-full pb-[60px] border border-zinc-300 dark:border-zinc-800 shadow-xl sans-serif"
                value={input}
                rows={3}
                placeholder="Choose from above or say something of your own..."
                onChange={handleInputChange}
              />
              <Button
                type="submit"
                disabled={status === "streaming"}
                size="sm"
                variant="outline"
                className="absolute bottom-2 right-2"
              >
                Send
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
