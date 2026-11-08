import React, { createContext, useState } from "react";
import type { AuthContextType, AuthState } from "../types/types";


// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export function AuthProvider({ children }: React.PropsWithChildren) {
  const [auth, setAuth] = useState<AuthState>(null);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}



export default AuthContext;