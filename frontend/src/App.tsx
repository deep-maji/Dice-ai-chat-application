import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import PageNotFound from './pages/PageNotFound'
import Auth from './pages/Auth'
import Home from './pages/Home'
// import Chat from './pages/Chat'
// import Test from './pages/test/ChatTest'
import ChatDashBoard from './pages/ChatDashBoard'
import './App.css'
import LayOut from './pages/LayOut'
import ProtectedRoute from './utils/ProtectedRoute'
import IsVerify from './utils/IsVerify'
import Verify from "../src/pages/Verify"
import PersistentLogin from './utils/PersistentLogin'
import IsAuthRequired from './utils/IsAuthRequired'
import { useContext, useEffect } from 'react'
import ThemeContext from './contexts/ThemeContext'

const router = createBrowserRouter([
  {
    path: "/",
    element: <LayOut />,
    children: [
      {
        element: <PersistentLogin />,
        children: [
          { path: "/", index: true, element: <Home /> }
        ]
      },

      // Protected routes group
      {
        element: <PersistentLogin />,
        children: [
          {
            element: <ProtectedRoute />,
            children: [
              { path: "c/", element: <ChatDashBoard /> },
              { path: "c/:id", element: <ChatDashBoard /> },
            ]
          },
          {
            element: <IsAuthRequired />,
            children: [{ path: "auth", element: <Auth /> }]
          },
        ]
      },
      {
        element: <IsVerify />,
        children: [
          { path: "verify", element: <Verify /> }
        ]
      },
      { path: "*", element: <PageNotFound /> }
    ]
  },
  // {
  //   path: "/test",
  //   element: <Test />
  // }
]);

function App() {

  const themeContext = useContext(ThemeContext);

  useEffect(() => {
    const htmlTag = window.document.querySelector("[data-theme]");

    if (themeContext) {
      htmlTag?.setAttribute("data-theme", themeContext?.theme);
    }
  }, [themeContext?.theme])

  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  )
}

export default App
