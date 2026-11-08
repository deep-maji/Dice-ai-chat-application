import type { AuthState } from "../types/types";
import type { AxiosResponse } from "axios";
import { refreshToken } from "../apis/Auth";
import { useAuth } from "./useAuth";

export function useRefreshToken() {
  const { auth, setAuth } = useAuth();

  const refresh = async () => {
    let data: any;
    try {
      const respone: AxiosResponse | null = await refreshToken();

      if (respone !== null) {
        data = respone.data;
        if (auth === null) {
          return setAuth(data);
        }
        return setAuth((prev: AuthState | null) => {
          if (prev !== null) {
            console.log(prev);
            console.log(data.accessToken);

            return { ...prev, accessToken: data.accessToken }
          }
          return null;
        })
      }
    } catch (error) {
      console.error("use refresh hook error - ", error);
    }

    return data ? data.accessToken : null;
  }

  return refresh;
}

export default useRefreshToken;