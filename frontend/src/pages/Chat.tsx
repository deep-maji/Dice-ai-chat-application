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


export default function Chat() {

  // React Router Dom
  const navigate = useNavigate();
  const location = useLocation();
  const param = useParams();

  // Custom Hooks
  const { setAuth } = useAuth();
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

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [deleteThreadTitle, setDeleteThreadTitle] = useState<string | null>(null);
  const [settingsModal, setStettingModal] = useState<boolean>(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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
          console.log(respone.data);
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
          console.log(respone.data);
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

  const handleNagivateToNewThread = () => {
    setThreadMessages([]);
    setCurrentThreadId(null);
    setUserMessage("");
    setNewThreadId(null);
    navigate("/c");
  }

  useEffect(() => {
    const closeMenu = () => {
      setOpenMenuId(null);
    };

    window.addEventListener("click", closeMenu);

    return () => window.removeEventListener("click", closeMenu);
  }, []);

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
      setOpenModal(null);
      setDeleteThreadTitle(null);
      navigate('/c');

    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      console.log("delete thread error : ", error);
    }
  }

  return (
    <div className="relative text-on-surface flex">

      {/* Settings Modal */}
      <div className={`absolute z-60 ${settingsModal ? "visible" : "invisible"}`}>
        {/* Back Drop */}
        <div onClick={() => setStettingModal(false)} className="bg-black/20 w-screen h-screen inset-0 flex justify-center items-center">

          {/* Modal */}
          <div onClick={(e) => e.stopPropagation()} className="w-150 h-130 bg-surface rounded-2xl flex border">
            {/* Left */}
            <div className="w-1/2 h-full rounded-l-2xl border-r">
              {/* Heading */}
              <div className="pl-3 pt-4 h-[46.4px]">
                <span onClick={() => setStettingModal(false)} className="material-symbols-outlined cursor-pointer">
                  close
                </span>
              </div>

              <div className="flex justify-center flex-col w-full p-2 gap-1">
                <div className="flex rounded-[12px] hover:bg-on-hover cursor-pointer">
                  <span className="material-symbols-outlined p-1 items-start">
                    settings_night_sight
                  </span>
                  <div className="w-full flex items-center"><h2>General</h2></div>
                </div>
                <div className="flex rounded-[12px] hover:bg-on-hover cursor-pointer">
                  <span className="material-symbols-outlined p-1 items-start">
                    account_circle
                  </span>
                  <div className="w-full flex items-center">Account</div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="w-full h-full rounded-r-2xl">
              {/* Heading */}
              <div className="p-3 border-b text-2xl font-semibold">General</div>

              <div className="w-full flex justify-between p-4 border-b">
                <div><h2>Apperence</h2></div>
                <div className="bg-surface rounded-[12px] cursor-pointer">
                  <select className="bg-surface hover:bg-on-hover p-1 rounded-[12px] focus:outline-0" name="theme" id="theme" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleTheme(e.target.value as "system" | "dark" | "light")}>
                    <option value="system">System</option>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {
        openModal !== null && (<div className="fixed inset-0 z-99 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="w-full max-w-140 rounded-3xl bg-surface-bright px-6 py-5 shadow-2xl">
            <h2 className="text-[20px] font-medium text-on-surface">
              Delete chat?
            </h2>

            <p className="mt-7 text-[1rem] leading-relaxed text-on-surface">
              This will delete{" "}
              <span className="font-semibold text-on-surface">
                {deleteThreadTitle !== null && deleteThreadTitle}
              </span>
            </p>

            {/* <p className="mt-4 text-[15px] text-on-surface">
              Visit{" "}
              <button
                type="button"
                className="underline underline-offset-2 hover:text-gray-700"
              >
                settings
              </button>{" "}
              to delete any memories saved during this chat.
            </p> */}

            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => setOpenModal(null)}
                className="rounded-2xl border px-2 py-1 h-min border-on-secondary-container bg-white text-[1rem] font-medium text-black transition hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => handleThreadDelete(openModal)}
                className="rounded-2xl h-min px-2 py-1 border border-red-500 bg-red-500 text-[1rem] font-medium text-white transition hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>)
      }

      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${mobileMenuOpen
          ? "opacity-100 visible"
          : "opacity-0 invisible"
          }`}
      />

      <aside className={`
      fixed top-0 left-0 z-50
      w-64 h-screen shrink-0
      bg-surface-container-low
      p-3 flex flex-col
      transform transition-transform duration-300 ease-in-out

      ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}

      md:translate-x-0
      md:static
      md:flex
    `}>
        {/* <div className="absolute -right-5 top-1/2 -translate-y-1/2 bg-surface-container px-1 py-4 rounded-r-lg cursor-pointer">
          <span className="material-symbols-outlined text-primary-dim text-xs" data-icon="chevron_right">chevron_right</span>
        </div> */}
        <div className="mb-5 px-2 flex items-center">
          <h1 className="text-lg font-semibold text-on-surface tracking-tight">
            <Link to={"/"}><i className="fa-solid fa-book-open"></i></Link>
          </h1>
        </div>
        <nav className="flex flex-col gap-1 flex-1 min-h-0" onClick={() => setMobileMenuOpen(false)}>
          {/* <!-- Active State: New Chat --> */}
          <button onClick={handleNagivateToNewThread} className="flex items-center gap-3 py-1 px-2 text-on-surface/50 hover:bg-surface-container hover:text-on-surface rounded-lg transition-all">
            <span className="material-symbols-outlined" data-icon="add_circle">add_circle</span>
            <span>New Chat</span>
          </button>

          {/* <!-- Recent Conversations List (History Expansion) --> */}
          <div className="mt-8 px-2 flex flex-col flex-1 min-h-0">
            <span
              className="text-[10px] uppercase tracking-widest text-on-surface-variant/90 font-bold mb-4 block">Recent Threads</span>
            <div className="flex flex-col gap-1 py-1 overflow-y-auto min-h-0">
              {
                chatHistroy.length !== 0 ? chatHistroy.map((ele) => {
                  return (<div onClick={() => (handleThreadNavigate(ele.threadId))} key={ele._id} className="relative cursor-default flex items-center justify-between p-1 text-xs text-on-surface-variant hover:text-background hover:bg-gray-400 rounded-[10px] transition-colors">
                    <p>{ele.title}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(
                          openMenuId === ele._id ? null : ele._id
                        );
                      }}
                      className="flex items-center justify-center rounded-full hover:bg-gray-300"
                    >
                      <i className="fa-solid fa-ellipsis"></i>
                    </button>

                    {/* Dropdown Menu  */}
                    {/* Delete Button */}
                    {openMenuId === ele._id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-5 z-99 w-46 p-3 bg-surface-container shadow-lg rounded-xl"
                      >
                        <div className="flex flex-col text-sm text-gray-700">
                          <button onClick={() => {
                            setOpenModal(ele._id);
                            setOpenMenuId(null);
                            setDeleteThreadTitle(ele.title);
                          }} className="flex items-center text-red-600 rounded-[10px] hover:bg-amber-950 p-1">
                            <i className="fa-solid fa-trash-can text-xs"></i>
                            <p className="px-2">Delete</p>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>)
                }) : <></>
              }
            </div>
          </div>
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex flex-col gap-1 mt-4">
            <button onClick={() => setStettingModal(true)} className="flex items-center gap-3 px-4 py-2 text-on-surface/50 hover:text-on-surface transition-all text-xs">
              <span className="material-symbols-outlined">
                settings
              </span> Settings
            </button>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-on-surface/50 hover:text-on-surface transition-all text-xs">
              <span className="material-symbols-outlined text-sm" data-icon="logout">logout</span>Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="relative w-full h-screen bg-surface text-on-background overflow-auto flex flex-col">

        {threadError
          ?
          <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 text-sm text-fg-danger-strong rounded-base bg-on-error-container text-on-error transition-all rounded-2xl" role="alert">
            <span className="font-medium"><i className="m-1 fa-solid fa-triangle-exclamation" style={{ color: "rgb(203, 11, 11)" }}></i>Unable </span>to load conversation
          </div>
          :
          <></>}

        <header className="w-full px-5 h-16 flex flex-nowrap justify-between items-center overflow-y-auto">
          <div className="font-manrope tracking-widest text-xl font-bold text-on-background whitespace-nowrap">
            <span id="menu-btn" className="inline md:hidden" onClick={() => setMobileMenuOpen(true)}><i className="fa-solid fa-bars-staggered"></i></span>
            <span className="ml-2">Dice AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-manrope">

            {/* <a className="text-[#e6e4ec]/60 hover:text-[#c0c1ff] transition-colors duration-300" href="#">Settings</a> */}
            <div className="ml-4 h-8 w-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant/15">
              <span className="material-symbols-outlined" data-icon="account_circle">account_circle</span>
            </div>
          </div>
        </header>



        {
          isLoading ? <div className="flex items-center justify-center h-screen"><TailSpin
            visible={true}
            height="50"
            width="50"
            color="var(--loader-color)"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
          /></div> : <section className="flex-1 px-5 lg:px-20 xl:px-40 pt-8 flex flex-col gap-12 mx-auto w-full overflow-y-auto">
            {
              threadMessages.map((ele, idx) => {
                return (<div key={idx}>
                  {
                    ele.role === "user" ?
                      <div className="flex justify-end w-full">
                        <div
                          className="max-w-[80%] bg-secondary-container text-on-background px-6 py-4 rounded-xl shadow-sm"
                        >
                          <div className="leading-relaxed text-body">
                            <Markdown remarkPlugins={[remarkGfm]}>{ele.content}</Markdown>
                          </div>
                        </div>
                      </div> : <div className="flex flex-col gap-6 w-full items-start markdown-body">
                        <Markdown remarkPlugins={[remarkGfm]}>{ele.content}</Markdown>
                        {/* <!-- Action Bar for Response --> */}
                        {/* <div
                          className="flex gap-4 ml-0 opacity-40 hover:opacity-100 transition-opacity"
                        >
                          <button className="hover:text-primary transition-colors">
                            <span
                              className="material-symbols-outlined text-sm"
                              data-icon="content_copy"
                            >content_copy</span>
                          </button>
                          <button className="hover:text-primary transition-colors">
                            <span
                              className="material-symbols-outlined text-sm"
                              data-icon="thumb_up"
                            >thumb_up</span>
                          </button>
                          <button className="hover:text-primary transition-colors">
                            <span
                              className="material-symbols-outlined text-sm"
                              data-icon="refresh"
                            >refresh</span>
                          </button>
                        </div> */}
                      </div>
                  }
                </div>)
              })
            }

            {
              messageLoading ? <div className="flex items-center justify-center"><TailSpin
                visible={true}
                height="50"
                width="50"
                color="var(--loader-color)"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{}}
                wrapperClass=""
              /></div> : <></>
            }
          </section>
        }

        {/* <!-- Fixed Input Area --> */}
        {
          threadMessages.length === 0 ? <div className="flex flex-col justify-center w-full h-screen max-w-4xl mx-auto my-auto px-6 pb-2 pt-4 ">
            <div className="flex items-center justify-center mb-10">
              <p className="text-3xl">Ready when you are.</p>
            </div>
            <form onSubmit={submitCreatNewThread} className="input-inside-container overflow-y-auto relative flex items-center bg-surface-container-high rounded-full px-6 py-3 border border-outline-variant/15 focus-within:border-primary/40 focus-within:shadow-[0_0_25px_rgba(192,193,255,0.1)] transition-all">
              <input
                required
                onChange={(e) => setUserMessage(e.target.value)}
                value={userMessage}
                className="w-full flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 px-4 py-2 font-inter text-sm"
                placeholder="Whisper to the Void..."
                type="text"
                style={{ "outline": "none" }}
              />
              <div className="flex items-center gap-4">
                <button
                  disabled={userMessage.length === 0}
                  className="disabled:scale-[1.0] disabled:opacity-50 h-10 w-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  <span className="material-symbols-outlined" data-icon="arrow_upward"
                  >arrow_upward</span>
                </button>
              </div>
            </form>

            <div className="w-full h-32"></div>
          </div> : < div className="w-full max-w-4xl mx-auto px-6 pb-2 pt-4 " >
            <form onSubmit={handleThreadConSubmit} className="input-inside-container overflow-y-auto relative flex items-center bg-surface-container-high rounded-full px-6 py-3 border border-outline-variant/15 focus-within:border-primary/40 focus-within:shadow-[0_0_25px_rgba(192,193,255,0.1)] transition-all">
              <input
                disabled={isLoading || messageLoading ? true : false}
                required
                onChange={(e) => setUserMessage(e.target.value)}
                value={userMessage}
                className="w-full flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 px-4 py-2 font-inter text-sm"
                placeholder="Whisper to the Void..."
                type="text"
                style={{ "outline": "none" }}
              />
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isLoading || messageLoading || userMessage.length === 0 ? true : false}
                  className="disabled:scale-[1.0] disabled:opacity-50 h-10 w-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  {
                    messageLoading ? <i className="fa-solid fa-square"></i> : <span className="material-symbols-outlined" data-icon="arrow_upward"
                    >arrow_upward</span>
                  }
                </button>
              </div>
            </form>
            <p
              className="text-[10px] text-center mt-3 text-on-surface-variant/30 tracking-widest uppercase"
            >
              Dice Intelligence can hallucinate. Cross-reference for critical
              thought.
            </p>
          </div>
        }
      </main>
    </div>
  )
}