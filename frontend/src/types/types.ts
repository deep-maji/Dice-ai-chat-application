// Auth state type

/*

Register response

{
    "message": "User registered successfully!",
    "user": {
        "fullname": "Deep Maji",
        "email": "majideep179@gmail.com",
        "verified": false
    }
}

*/

export type RegisterResponse = {
  "message": string,
  "user": {
    "fullname": string,
    "email": string,
    "verified": boolean
  }
  "accessToken"?: string
}

export type LoginResponse = {
  "message": string,
  "user": {
    "fullname": string,
    "email": string,
    "verified": boolean
  },
  "accessToken"?: string
}


export type AuthState = {
  accessToken?: string;
  user: any;
} | null | RegisterResponse | LoginResponse;

// Context type
export type AuthContextType = {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
};

// Api request Types

export type RegisterUser = {
  fullname: string,
  email: string,
  password: string
}

export type LoginUser = {
  email: string,
  password: string
}

export type VerifyUser = {
  otp: string,
  email: string
}

export type ChatsHistroy = {
  _id: string,
  title: string,
  threadId: string
}

export type ChatMessage = {
  content: string
  createdAt?: string
  role: "user" | "model"
  updatedAt?: string
  _id: string,
  title?: string
}


/*

// Model response
content : "2 + 2 = 4\n"
id : "69f846d1856f020a5aee3afb"
role : "model"
title : "**Two plus two equals four.**

*/


