
"use client"

import {
  ArrowUpIcon,
  GlobeIcon,
  MessageCircleDashedIcon,
  PaperclipIcon,
  PencilSparkles,
  PlusIcon,
  TelescopeIcon,

} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Message, MessageContent } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
  MessageScrollerProvider,
} from "@/components/ui/message-scroller"
import { Bubble, BubbleContent } from "@/components/ui/bubble"

import type { ChatMessage, ChatsHistroy } from "../types/types";
import Markdown from "react-markdown"
import { SidebarTrigger } from "./ui/sidebar"

interface ChatProps {
  threadMessages: ChatMessage[];
  chatHistroy: ChatsHistroy[];
  isLoading: boolean;
  threadError: boolean;
  title: string | null;
  setTitle: (title: string | null) => void;
  handleNavigateToNewThread: () => void;
  submitCreatNewThread: (e: React.SubmitEvent<HTMLFormElement>) => void;
  handleThreadConSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  userMessage: string;
  setUserMessage: (message: string) => void;
  messageLoading: boolean;
}



export function Chat({ threadMessages, isLoading, threadError, title, handleNavigateToNewThread, submitCreatNewThread, handleThreadConSubmit, userMessage, setUserMessage, messageLoading }: ChatProps) {

  return (
    <div className="relative flex w-full h-screen flex-col gap-4 [[data-slot=preview]:has(&)]:bg-background [[data-slot=preview]:has(&)>div]:p-0!">
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-4 pb-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="" />

            <div className="flex flex-col">
              <div className="font-medium">
                {title ? title : "New Thread"}
              </div>
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={handleNavigateToNewThread}
                  variant="outline"
                  size="icon"
                  aria-label="New Thread"
                >
                  <PencilSparkles />
                </Button>
              }
            />
            <TooltipContent>
              <p>New Thread</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Empty Chat */}
        {/* Messages */}
        <div className="min-h-0 flex-1">
          {threadMessages.length === 0 && !isLoading && !threadError ? (
            <div className="flex h-full items-center justify-center">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageCircleDashedIcon />
                  </EmptyMedia>

                  <EmptyTitle>What should we build?</EmptyTitle>

                  <EmptyDescription>
                    The agent can read your code, run commands and make changes.
                    Press send to start.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <MessageScrollerProvider>
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent className="gap-6 px-8 py-0">
                    {threadMessages.map((message) => (
                      <MessageScrollerItem
                        key={message._id}
                        messageId={message._id}
                      >
                        <Message align={message.role === "user" ? "end" : "start"}>
                          <MessageContent>
                            {message.role === "user" ? (
                              <Bubble align="end" variant="muted">
                                <BubbleContent>
                                  {message.content}
                                </BubbleContent>
                              </Bubble>
                            ) : (
                              <>
                                <Markdown>{message.content}</Markdown>
                                <div className="h-5"></div>
                              </>
                            )}
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    ))}
                  </MessageScrollerContent>
                </MessageScrollerViewport>

                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-8 pt-0">
          {threadMessages.length === 0 ? (<form onSubmit={(e) => submitCreatNewThread(e)} className="w-full">
            <InputGroup>
              <InputGroupTextarea
                onChange={(e) => setUserMessage(e.target.value)}
                value={userMessage}
                placeholder="Ask the agent..."
                aria-label="Message"
                className="min-h-14"
              />

              <InputGroupAddon align="block-end" className="pt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <InputGroupButton
                        aria-label="Add context"
                        type="button"
                        size="icon-sm"
                        variant="outline"
                      >
                        <PlusIcon />
                      </InputGroupButton>
                    }
                  />

                  <DropdownMenuContent
                    align="start"
                    side="top"
                    className="w-44"
                  >
                    <DropdownMenuItem>
                      <PaperclipIcon />
                      Add Photos & Files
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem>
                      <TelescopeIcon />
                      Deep Research
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <GlobeIcon />
                      Web Search
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="icon-sm"
                  className="ml-auto"
                >
                  <ArrowUpIcon />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>) : (<form onSubmit={(e) => handleThreadConSubmit(e)} className="w-full">
            <InputGroup>
              <InputGroupTextarea
                onChange={(e) => setUserMessage(e.target.value)}
                value={userMessage}
                placeholder="Ask the agent..."
                aria-label="Message"
                className="min-h-14"
              />

              <InputGroupAddon align="block-end" className="pt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <InputGroupButton
                        aria-label="Add context"
                        type="button"
                        size="icon-sm"
                        variant="outline"
                      >
                        <PlusIcon />
                      </InputGroupButton>
                    }
                  />

                  <DropdownMenuContent
                    align="start"
                    side="top"
                    className="w-44"
                  >
                    <DropdownMenuItem>
                      <PaperclipIcon />
                      Add Photos & Files
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem>
                      <TelescopeIcon />
                      Deep Research
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <GlobeIcon />
                      Web Search
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="icon-sm"
                  className="ml-auto"
                >
                  <ArrowUpIcon />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>)}
        </div>

      </div>
    </div>
  )
}
