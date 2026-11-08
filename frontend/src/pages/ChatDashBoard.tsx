import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { creatNewMessage, deleteThread, getAllThreadHistroy, getChatById } from "../apis/Chat.api";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import type { ChatMessage, ChatsHistroy } from "../types/types";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { TailSpin } from "react-loader-spinner";
import { useContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { AxiosResponse } from "axios";
import { logoutUser } from "../apis/Auth";
import Markdown from 'react-markdown';
import { v4 as uuidv4 } from "uuid";
import remarkGfm from 'remark-gfm';
import axios from "axios";
import "../styles/Chat.css";
import ThemeContext from "../contexts/ThemeContext";




import { Chat } from "@/components/chat"


export default function Page() {

  // React Router Dom
  const navigate = useNavigate();
  const location = useLocation();
  const param = useParams();

  // Custom Hooks
  const { setAuth, auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  // Sattes
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatHistroy, setChatHistroy] = useState<ChatsHistroy[]>([]);
  const [userMessage, setUserMessage] = useState<string>("");
  const [threadMessages, setThreadMessages] = useState<ChatMessage[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [newThreadId, setNewThreadId] = useState<string | null>(null);
  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const [threadError, setThreadError] = useState<boolean>(false);
  // const [themeSetting, setThemeSettings] = useState<"system" | "dark" | "light">("system");

  // ThemeContext
  const themeContext = useContext(ThemeContext);

  const handleTheme = (themeSettings: "system" | "dark" | "light") => {
    if (themeSettings === "system") {
      themeContext?.setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      return;
    }
    themeContext?.setTheme(themeSettings);
  }

  // useEffect and functions
  const handleLogout = async () => {
    try {
      const respone: AxiosResponse | null = await logoutUser();
      if (respone !== null) {
        if (respone.status === 200) {
          return setAuth(null);
        }
      }
      else {
        console.log("Server is not responed.");
      }
    } catch (error) {
      console.error("Logout error : ", error);

    }
  }

  useEffect(() => {
    let isMounted: boolean = true;
    const { controller, getThreadshistroyRequest } = getAllThreadHistroy(axiosPrivate);

    const handleChatsHistroy = async () => {
      try {
        const respone: AxiosResponse | null = await getThreadshistroyRequest();

        if (respone !== null) {
          isMounted && setChatHistroy(respone.data.threadHistroy);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          return; // Ignore expected cancellation
        }
        setAuth(null);
        navigate("/auth", { state: { from: location }, replace: true });
      }
    }

    handleChatsHistroy();

    return () => {
      isMounted = false;
      controller.abort();
    }
  }, []);




  useEffect(() => {
    let isMounted: boolean = true;
    const { controller: getChatByIdController, getChatByIdReq } = getChatById(axiosPrivate, param?.id || currentThreadId || "");
    setCurrentThreadId(param?.id || null);

    const handleChatById = async () => {
      setIsLoading(true);
      try {
        const respone: AxiosResponse | null = await getChatByIdReq();

        if (respone !== null) {
          isMounted && setThreadMessages(respone.data.response.messages);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        console.log("handle chat by id error - ", error);
        setThreadError(true);
        setTimeout(() => {
          setThreadError(false);
        }, 5000);
      }
      finally {
        setIsLoading(false);
      }
    }

    if (param.id !== undefined && newThreadId === null) {
      handleChatById();
    }

    return () => {
      isMounted = false;
      getChatByIdController.abort();
    }
  }, [param.id])


  useEffect(() => {
    const threadIdNew = param.id || currentThreadId || "";
    const { threadController, creatNewMessageReq } = creatNewMessage(axiosPrivate, threadIdNew, userMessage);

    const handleNewThreadMessage = async () => {
      setMessageLoading(true);
      try {
        const response = await creatNewMessageReq();

        if (response !== null) {
          console.log(response.data.response);
          const data = response.data.response;
          setThreadMessages((prev) => ([...prev, data]));
          setChatHistroy((prev) => ([{ title: data.title, threadId: threadIdNew, _id: data._id }, ...prev]));
        }

      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        console.log("Handle new thread message error : ", error);
      }
      finally {
        setMessageLoading(false);
      }
    }

    if (newThreadId !== null) {
      setUserMessage("");
      handleNewThreadMessage();
    }

    return () => {
      threadController.abort();
    }
  }, [newThreadId])

  const handleThreadCon = async () => {
    const threadId = param.id || currentThreadId || "";
    const { threadController, creatNewMessageReq } = creatNewMessage(axiosPrivate, threadId, userMessage);

    const handleNewThreadMessage = async () => {
      setMessageLoading(true);
      try {
        const response = await creatNewMessageReq();

        if (response !== null) {
          console.log(response.data.response);
          setThreadMessages((prev) => ([...prev, response?.data.response]));
          const currentThread = chatHistroy.find((ele) => (ele.threadId === threadId));

          if (currentThread) {
            setChatHistroy(chatHistroy.filter((ele) => ele.threadId !== threadId))
          }

          if (currentThread) {
            setChatHistroy((prev) => ([currentThread, ...prev]));
          }
        }

      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        console.log("Handle new thread message error : ", error);
      }
      finally {
        setMessageLoading(false);
      }
    }

    if (currentThreadId !== null) {
      handleNewThreadMessage();
    }

    return threadController;
  }

  const handleThreadConSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setThreadMessages((prev) => ([...prev, {
      content: userMessage,
      role: "user",
      _id: uuidv4()
    }]));
    handleThreadCon();
    setUserMessage("");
  }


  const handleThreadNavigate = (id: string) => {
    setCurrentThreadId(id);
    setNewThreadId(null);
    navigate(`/c/${id}`);
  }

  const submitCreatNewThread = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newthreadId: string = uuidv4();
    setCurrentThreadId(newthreadId);
    setNewThreadId(newthreadId);
    setThreadMessages([{
      content: userMessage,
      role: "user",
      _id: uuidv4()
    }])
    navigate(`/c/${newthreadId}`);
  }

  const handleNavigateToNewThread = () => {
    setThreadMessages([]);
    setCurrentThreadId(null);
    setUserMessage("");
    setNewThreadId(null);
    navigate("/c");
  }

  const handleThreadDelete = async (mongoThreadId: string) => {
    const { deleteThreadReq } = deleteThread(axiosPrivate, mongoThreadId);

    try {
      const respone = await deleteThreadReq();
      if (respone !== null) {
        setChatHistroy((prev) => {
          return prev.filter((ele) => {
            if (ele._id !== mongoThreadId) {
              return true;
            }
            return false;
          })
        })
      }
      setThreadMessages([]);
      navigate('/c');

    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      console.log("delete thread error : ", error);
    }
  }

  // Which Chat is opened ?
  const params = useParams();
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) {
      setTitle(null);
      return;
    }

    const thread = chatHistroy.find(
      (item) => item.threadId === params.id
    );

    setTitle(thread?.title ?? null);

  }, [params.id]);


  const chatProps = {
    chatHistroy,
    threadMessages,
    isLoading,
    threadError,
    handleNavigateToNewThread,
    submitCreatNewThread,
    handleThreadConSubmit,
    userMessage,
    setUserMessage,
    messageLoading,
    title,
    setTitle
  }

  const chatHistroyProps = {
    chatHistroy,
    handleThreadNavigate,
    auth,
    handleLogout,
    handleThreadDelete
  }

  return (
    <SidebarProvider>
      <AppSidebar {...chatHistroyProps} />
      <SidebarInset>
        <Chat {...chatProps} />
      </SidebarInset>
    </SidebarProvider>
  )
}
