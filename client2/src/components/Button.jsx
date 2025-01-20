import React from "react"
import { FaSignInAlt, FaSignOutAlt, FaUserPlus, FaCog } from "react-icons/fa"
import toast from "react-hot-toast"
import { send_img_login, send_img_logout } from "../api"

export function Button({ lastFrame, setShowWebcam, setIsDialogOpen, setDialogType }) {
  const handleLogin = async () => {
    if (!lastFrame) { 
      toast.error("Please capture a frame first")
      return
    }
    const result = await send_img_login(lastFrame)
    console.log(result)
    if (result.match_status) {
      toast.success(`Welcome back, ${result.user}!`)
    } else {
      toast.error("Unknown user. Please try again or register.")
    }
  }

  const handleLogout = async () => {
    if (!lastFrame) {
      toast.error("Please capture a frame first")
      return
    }
    const result = await send_img_logout(lastFrame)
    if (result.match_status) {
      toast.success(`Goodbye, ${result.user}!`)
    } else {
      toast.error("Unknown user. Please try again or register.")
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      <button
        className="flex items-center btn btn-primary"
        onClick={() => {
          setShowWebcam(true)
          handleLogin()
        }}
      >
        <FaSignInAlt className="mr-2" />
        Login
      </button>
      <button
        className="flex items-center btn btn-secondary"
        onClick={() => {
          setShowWebcam(true)
          handleLogout()
        }}
      >
        <FaSignOutAlt className="mr-2" />
        Logout
      </button>
      <button
        className="flex items-center btn btn-success"
        onClick={() => {
          setIsDialogOpen(true)
          setDialogType("register")
        }}
      >
        <FaUserPlus className="mr-2" />
        Register
      </button>
      <button
        className="flex items-center btn btn-info"
        onClick={() => {
          setIsDialogOpen(true)
          setDialogType("admin")
        }}
      >
        <FaCog className="mr-2" />
        Admin
      </button>
    </div>
  )
}

