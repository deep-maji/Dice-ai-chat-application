import React, { useEffect, useRef, useState } from "react";
import { getVerified, reSendOTP } from "../apis/Auth";
import { TailSpin } from 'react-loader-spinner';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/Verify.css"
import axios from "axios";


export default function Verify() {

  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);

  const OTPRef = useRef<HTMLInputElement | null>(null);
  const errorRef = useRef<HTMLParagraphElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [OTP, setOTP] = useState<string>("");
  const [vaildOTP, setVaildOTP] = useState<boolean>(false);

  const [seconds, setSeconds] = useState<number>(300);

  useEffect(() => {
    // If seconds reaches 0, stop the timer
    if (seconds <= 0) return;

    // Set up an interval to decrement every 1000ms (1 second)
    const timerId = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    // CRITICAL: Clean up the interval on unmount or before the next effect run
    return () => clearInterval(timerId);
  }, [seconds]); // Re-run effect when 'seconds' changes

  useEffect(() => {
    OTPRef.current?.focus();
  }, []);

  useEffect(() => {
    console.log(OTP);

    if (OTP.length < 4) {
      return setVaildOTP(false);
    }
    setVaildOTP(true);
  }, [OTP])


  const handelResendOTP = async () => {
    setLoading(true);

    try {
      const respone = await reSendOTP({ email: auth?.user.email });
      setErrorMsg(respone.data.message);
      setSeconds(300);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMsg(error.response?.data.message);
      }
    }
    finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (vaildOTP) {

      setLoading(true);

      try {
        const respone = await getVerified({ otp: OTP, email: auth?.user.email });

        if (respone.status === 200) {
          setAuth(respone.data);
          return navigate("/");
        }

      } catch (error) {
        if (axios.isAxiosError(error)) {
          const data = error.response?.data;
          if (error.response?.status === 400 || error.response?.status === 404) {
            return setErrorMsg(data.message);
          }
          else {
            return setErrorMsg("Server is not response.");
          }
        }
      }
      finally {
        setLoading(false);
      }
    }
  }

  return (<div className="bg-surface relative text-on-surface h-full">

    {/* <!-- Container: Fixed at the bottom center --> */}
    <p ref={errorRef} className={`${errorMsg?.length === 0 ? 'offScreen ' : 'onScreen '}` + "fixed bottom-20 right-10 items-center gap-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg z-50"}>
      <span className="text-sm grow" aria-live="assertive">{errorMsg}</span>
      <button onClick={() => setErrorMsg("")} className="ml-2 text-gray-400 hover:text-white">&times;</button>
    </p>

    {/* <p className={`${successMsg?.length === 0 ? 'offScreen ' : 'onScreen '}` + "fixed bottom-20 right-10 items-center gap-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg z-50"}>
      <span className="text-sm grow" aria-live="assertive">{successMsg}</span>
      <button onClick={() => setErrorMsg("")} className="ml-2 text-gray-400 hover:text-white">&times;</button>
    </p> */}

    {/* Background Articulations */}
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute top-[-10%] right-[-5%] w-200 h-200 ethereal-blur"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-100 h-100 ethereal-blur" style={{ "background": "radial-gradient(circle, #2f2ebe 0%, transparent 70%)" }}></div>
    </div>

    {/* Content Wrapper*/}
    <div className="relative z-10 flex flex-col min-h-screen overflow-hidden">
      <header className="flex justify-between text-surface-tint font-headline text-sm uppercase w-full p-8">
        <div className="text-lg text-on-background tracking-tight">Etheric AI</div>
        <div className="w-2 h-2"></div>
      </header>

      {/* main content */}
      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">


          {/* Central Auth Card */}
          <div className="bg-surface-container-low ghost-border rounded-xl p-8 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            {/* Barnding */}
            <div className="text-center my-5">
              <h1 className="font-headline text-on-surface tracking-tight text-4xl">Verify your email</h1>
              <p className="text-on-surface-variant font-light tracking-wide text-sm pt-2">OTP is send to your register email address.</p>
              <p className="text-on-surface-variant font-light tracking-wide text-sm">This code will expire in 5 minutes.</p>
            </div>

            {/* Input from */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">OTP</label>
                  <span>{seconds}s</span>
                  <button disabled={seconds !== 0} onClick={handelResendOTP} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-dim transition-colors disabled:opacity-50">Resend</button>
                </div>
                <div className="relative group/input">
                  <input disabled={loading} required ref={OTPRef} type="number" id="password" placeholder="4 Digit OTP" onChange={(e) => setOTP(e.target.value)} value={OTP} className="otp-input w-full bg-surface-container-high border-none ghost-border rounded-md px-6 py-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 transition-all text-sm outline-none" />
                </div>
              </div>
              {/* <!-- CTA Button --> */}
              <button type="submit" disabled={!vaildOTP} className=" w-full py-4 rounded-full bg-blue-400 from-primary to-primary-container text-on-background font-bold tracking-tight hover:scale-[1.01] disabled:scale-[1.0] disabled:opacity-50 active:scale-95 transition-all duration-300 shadow-xl shadow-primary/10">
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
                  /></div> : "Verify"
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
  </div>)
}