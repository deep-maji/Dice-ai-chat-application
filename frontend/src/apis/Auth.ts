import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type { LoginUser, RegisterUser, VerifyUser } from "../types/types";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL
})

export const axiosPrivate: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})


export async function getRegister({ fullname, email, password }: RegisterUser) {
  try {
    const respone: AxiosResponse = await client.post("/api/v1/user/register", {
      fullname,
      email,
      password
    }, { withCredentials: true })

    if (respone.status === 201) {
      return respone;
    }

    //temp
    return respone
  } catch (error) {
    throw error;
  }
}

export async function getLogin({ email, password }: LoginUser) {
  try {
    const respone: AxiosResponse = await client.post("/api/v1/user/login", {
      email,
      password
    }, { withCredentials: true })

    if (respone.status === 200) {
      return respone;
    }

    // temp
    return respone;
  } catch (error) {
    throw error;
  }
}

export async function getVerified({ otp, email }: VerifyUser) {
  try {
    const response: AxiosResponse = await client.post("/api/v1/user/verify-email", {
      otp,
      email
    }, { withCredentials: true });

    if (response.status === 200) {
      return response;
    }

    return response;
  } catch (error) {
    throw error;
  }
}

export async function reSendOTP({ email }: { email: string }) {
  try {
    const response: AxiosResponse = await client.post("/api/v1/user/resend-otp", {
      email
    }, { withCredentials: true });

    if (response.status === 200) {
      return response;
    }

    return response;
  } catch (error) {
    throw error;
  }
}

export async function logoutUser() {
  try {
    const respone: AxiosResponse = await client.post("/api/v1/user/logout",
      {},
      {
        withCredentials: true
      })

    if (respone.status === 200) {
      return respone;
    }

    return null;
  } catch (error) {
    throw error;
  }
}

export async function refreshToken() {
  try {
    const respone: AxiosResponse = await client.post("/api/v1/user/refresh-token",
      {},
      { withCredentials: true }
    );
    if (respone.status === 200) {
      return respone;
    }
    return null;
  } catch (error) {
    throw error;
  }
}


