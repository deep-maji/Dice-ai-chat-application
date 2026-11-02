import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Outlet } from "react-router-dom";
import useRefreshToken from "../hooks/useRefreshToken";
import axios from "axios";
import { TailSpin } from 'react-loader-spinner';



function PersistentLogin() {

  const [loading, setLoading] = useState<boolean>(true);
  const { auth } = useAuth();
  const refresh = useRefreshToken();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Verify refresh token : ", error);
        }
      }
      finally {
        setLoading(false);
      }
    }

    !auth?.accessToken ? verifyRefreshToken() : setLoading(false);
  }, []);


  return (
    <>
      {
        loading ? <div className="bg-surface relative text-on-surface h-screen w-screen">
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-200 h-200 ethereal-blur"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-100 h-100 ethereal-blur" style={{ "background": "radial-gradient(circle, #2f2ebe 0%, transparent 70%)" }}></div>
          </div>

          <div className="flex items-center justify-center h-screen">
            <TailSpin
              visible={true}
              height="50"
              width="50"
              color="var(--loader-color)"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
            />
          </div>
        </div> : <Outlet></Outlet>
      }
    </>
  )
}

export default PersistentLogin;