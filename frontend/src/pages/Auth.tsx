import type { RegisterResponse, LoginResponse } from "../types/types";
import React, { useState, useRef, useEffect } from "react";
import { getRegister, getLogin } from "../apis/Auth";
import { Link, useNavigate } from "react-router-dom";
import { TailSpin } from 'react-loader-spinner';
import { useAuth } from "../hooks/useAuth";
import "../styles/Auth.css";
import axios from "axios";


// const passwordRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,8}$/;
const fullNameRegex: RegExp = /^[A-Za-z]+(?: [A-Za-z]+)+$/;
const passwordRegex = /^[A-Za-z\d]{6,20}$/;
const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Auth: React.FC = () => {

  const { setAuth } = useAuth();

  const navigate = useNavigate();

  const [signOrCreateAccount, setSignOrCreateAccount] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  // HTML Node Refrence
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const errorRef = useRef<HTMLParagraphElement | null>(null);

  const [fullname, setFullName] = useState<string>("");
  const [vaildName, setVaildName] = useState<boolean>(false);
  // const [fullNameFoucs, setFullNameFoucs] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [vaildEmail, setVaildEmail] = useState<boolean>(false);
  // const [emailFoucs, setEmailFoucs] = useState<boolean>(false);

  const [password, setPassword] = useState<string>("");
  const [vaildPass, setVaildPass] = useState<boolean>(false);
  // const [passFoucs, setPassFoucs] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  useEffect(() => {
    signOrCreateAccount ? fullNameRef.current?.focus() : emailRef.current?.focus();
  }, [signOrCreateAccount])

  useEffect(() => {
    const result: boolean = fullNameRegex.test(fullname);
    setVaildName(result);
  }, [fullname]);

  useEffect(() => {
    const result: boolean = emailRegex.test(email);
    setVaildEmail(result);
  }, [email]);

  useEffect(() => {
    const result: boolean = passwordRegex.test(password);
    setVaildPass(result);
  }, [password]);


  useEffect(() => {
    setTimeout(() => {
      setErrorMsg("");
      setSuccessMsg("");
    }, 10000)
  }, [errorMsg, successMsg])

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Try to submit the from");


    if (!vaildName && signOrCreateAccount || !vaildEmail || !vaildPass) {
      setErrorMsg("Invalid entery");
      return;
    }

    setLoading(true);

    if (signOrCreateAccount === true) {
      try {
        const respone = await getRegister({ fullname, email, password });
        const data: RegisterResponse = respone?.data;

        setAuth(data);

        if (!data.user.verified) {
          navigate("/verify");
        }

      } catch (error) {
        if (axios.isAxiosError(error)) {
          const data: LoginResponse = error.response?.data;
          if (error.response?.status === 302 || error.response?.status === 401) {
            return setErrorMsg(data.message);
          }
          else {
            return setErrorMsg("Server is not response");
          }
        }
      }
      finally {
        setLoading(false);
      }
    }
    else {
      try {
        const response = await getLogin({ email, password });
        const data: LoginResponse = response?.data;

        setAuth(data);

        if (!data.user.verified) {
          return navigate("/verify");
        }

        navigate("/");

      } catch (error) {
        if (axios.isAxiosError(error)) {
          const data: LoginResponse = error.response?.data;
          if (error.response?.status === 403) {
            setAuth(data);
            return navigate("/verify");
          }
          else if (error.response?.status === 404 || error.response?.status === 401) {
            return setErrorMsg(data.message);
          }
          else {
            return setErrorMsg("Server is not response");
          }
        }
      }
      finally {
        setLoading(false);
      }
    }



  }


  return (
    <div className="bg-surface relative text-on-surface h-full">


      {/* <!-- Container: Fixed at the bottom center --> */}
      <p ref={errorRef} className={`${errorMsg?.length === 0 ? 'offScreen ' : 'onScreen '}` + "fixed bottom-20 right-10 items-center gap-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg z-50"}>
        <span className="text-sm grow" aria-live="assertive">{errorMsg}</span>
        <button onClick={() => setErrorMsg("")} className="ml-2 text-gray-400 hover:text-white">&times;</button>
      </p>

      <p className={`${successMsg?.length === 0 ? 'offScreen ' : 'onScreen '}` + "fixed bottom-20 right-10 items-center gap-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg z-50"}>
        <span className="text-sm grow" aria-live="assertive">{successMsg}</span>
        <button onClick={() => setErrorMsg("")} className="ml-2 text-gray-400 hover:text-white">&times;</button>
      </p>

      {/* Background Articulations */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-200 h-200 ethereal-blur"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-100 h-100 ethereal-blur" style={{ "background": "radial-gradient(circle, #2f2ebe 0%, transparent 70%)" }}></div>
      </div>

      {/* Content Wrapper*/}
      <div className="relative z-10 flex flex-col min-h-screen overflow-hidden">
        <header className="flex justify-between text-surface-tint font-headline text-sm uppercase w-full p-8">
          <Link to="/"><div className="text-lg text-on-background tracking-tight">Etheric AI</div></Link>
          <div className="w-2 h-2"></div>
        </header>

        {/* main content */}
        <main className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-8">
            {/* Barnding */}
            <div className="text-center my-5">
              <h1 className="font-headline text-on-surface tracking-tight text-4xl">{signOrCreateAccount ? "Start Your Journey" : "Welcome Back"}</h1>
              <p className="text-on-surface-variant font-light tracking-wide text-sm">Enter the sanctuary of autonomous thought.</p>
            </div>

            {/* Central Auth Card */}
            <div className="bg-surface-container-low ghost-border rounded-xl p-8 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              {/* <!-- Auth Toggle --> */}
              <div className="flex items-center p-1 bg-surface-container-high rounded-full mb-8 relative">
                <button className={`flex-1 py-2 text-sm font-medium z-10 ${signOrCreateAccount ? "text-on-surface-variant" : "text-on-primary"}`} onClick={() => setSignOrCreateAccount(false)}>Sign In</button>
                <button className={`flex-1 py-2 text-sm font-medium z-10 ${!signOrCreateAccount ? "text-on-surface-variant" : "text-on-primary"}`} onClick={() => setSignOrCreateAccount(true)}>Create Account</button>
                <div
                  className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-primary rounded-full transition-all duration-300 transform ${signOrCreateAccount ? "translate-x-full" : "translate-x-0"
                    }`}
                ></div>
              </div>

              {/* <!-- Social Logins --> */}
              {/* <div className="grid grid-cols-2 gap-3 mb-8">
                <button className="flex items-center justify-center gap-2 py-3 bg-surface-container-high hover:bg-surface-container-highest ghost-border rounded-full transition-all duration-200">
                  <span className="text-xs font-semibold tracking-wider uppercase">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-surface-container-high hover:bg-surface-container-highest ghost-border rounded-full transition-all duration-200">
                  <span className="text-xs font-semibold tracking-wider uppercase">GitHub</span>
                </button>
              </div> */}

              {/* Separation */}
              {/* <div className="relative flex items-center justify-center mb-8">
                <div className="w-full border-t border-outline-variant/20"></div>
                <span className="absolute px-4 bg-surface-container-low text-[10px] uppercase tracking-widest text-on-surface-variant">or use email</span>
              </div> */}

              {/* Input from */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {
                  signOrCreateAccount ?
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label htmlFor="fullname" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Full Name</label>
                        <a className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-dim transition-colors w-2"></a>
                      </div>
                      <div className="relative group/input">
                        <input disabled={loading} type="text" value={fullname} required ref={fullNameRef} id="fullname" onChange={(e) => setFullName(e.target.value)} placeholder="Jone Doe" className="w-full bg-surface-container-high border-none ghost-border rounded-md px-6 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all text-sm outline-none" />
                      </div>
                    </div> : <></>
                }
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Email</label>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-dim transition-colors w-2"></span>
                  </div>
                  <div className="relative group/input">
                    <input type="email" disabled={loading} required id="email" value={email} ref={emailRef} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="email@ethereal.ai" className="w-full bg-surface-container-high border-none ghost-border rounded-md  px-6 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all text-sm outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                    <a className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-dim transition-colors" href="#">Forgot?</a>
                  </div>
                  <div className="relative group/input">
                    <input required type="password" disabled={loading} id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" className="w-full bg-surface-container-high border-none ghost-border rounded-md px-6 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all text-sm outline-none" />
                  </div>
                </div>
                {/* <!-- CTA Button --> */}
                <button disabled={!vaildName && signOrCreateAccount || !vaildEmail || !vaildPass || loading ? true : false} className=" w-full py-4 rounded-full bg-blue-400 from-primary to-primary-container text-on-background font-bold tracking-tight hover:scale-[1.01] disabled:scale-[1.0] disabled:opacity-50 active:scale-95 transition-all duration-300 shadow-xl shadow-primary/10" type="submit">
                  {
                    loading ? <div className="flex items-center justify-center"><TailSpin
                      visible={true}
                      height="30"
                      width="30"
                      color="var(--loader-color)"
                      ariaLabel="tail-spin-loading"
                      radius="1"
                      wrapperStyle={{}}
                      wrapperClass=""
                    /></div> : "Sign in"
                  }
                </button>
              </form>
            </div>

            {/* <!-- Legal/Helper --> */}
            <p className="text-center text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em]">
              By continuing, you agree to our <a className="text-on-surface hover:text-primary transition-colors" href="#">Digital Manifesto</a>
            </p>

          </div>
        </main>

        {/* <!-- Footer (Shared Component Structure) --> */}
        <footer className="text-center bg-transparent text-[#c0c1ff] font-['Inter'] text-[12px] tracking-widest uppercase flex flex-col md:flex-row justify-between items-center w-full px-12 py-10 gap-4 mt-auto">
          <div className="opacity-80 ">© 2024 Etheric AI. Designed for thought.</div>
          <div className="flex gap-8">
            <a className="text-on-background/30 hover:text-on-background transition-all opacity-80 hover:opacity-100" href="#">Privacy</a>
            <a className="text-on-background/30 hover:text-on-background transition-all opacity-80 hover:opacity-100" href="#">Terms</a>
            <a className="text-on-background/30 hover:text-on-background transition-all opacity-80 hover:opacity-100" href="#">Void</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Auth;