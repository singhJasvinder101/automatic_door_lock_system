import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaTimes, FaUserPlus, FaDownload } from "react-icons/fa"
import toast from "react-hot-toast"
import { downloadLogs, register_new_user } from "../api"


export function Dialog({ isOpen, onClose, type, lastFrame  }) {
  const [username, setUsername] = useState("")

  const handleRegister = async () => {
    if (!username) {
      toast.error("Please enter a username")
      return
    }
    const result = await register_new_user(username,lastFrame )
    if (result.registration_status === 200) {
      toast.success("User registered successfully!")
      onClose()
    } else {
      toast.error("Registration failed. Please try again.")
    }
  }

  const handleDownloadLogs = async () => {
    try {
      await downloadLogs()
      toast.success("Logs downloaded successfully!")
    } catch (error) {
      toast.error("Failed to download logs. Please try again.")
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                {type === "register" ? "Register New User" : "Admin Panel"}
              </motion.h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                onClick={onClose}
              >
                <FaTimes className="w-6 h-6" />
              </motion.button>
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {type === "register" ? (
                <>
                  <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center"
                    onClick={handleRegister}
                  >
                    <FaUserPlus className="mr-2" />
                    Register User
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center"
                  onClick={handleDownloadLogs}
                >
                  <FaDownload className="mr-2" />
                  Download Logs
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
