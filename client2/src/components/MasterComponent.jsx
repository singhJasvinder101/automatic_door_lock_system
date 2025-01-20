import React, { useEffect, useState } from "react"
import { Webcam } from "./Webcam"
import { Button } from "./Button"
import { Dialog } from "./Dialog"
import toast, { Toaster } from "react-hot-toast"

export function MasterComponent() {
  const [lastFrame, setLastFrame] = useState(null)
  const [showWebcam, setShowWebcam] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState("register")


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Face Authentication System</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              {showWebcam ? (
                <Webcam lastFrame={lastFrame} setLastFrame={setLastFrame} />
              ) : (
                <img className="rounded-lg shadow-md" src={lastFrame || ""} alt="Captured frame" />
              )}
              <Button
                lastFrame={lastFrame}
                setLastFrame={setLastFrame}
                setShowWebcam={setShowWebcam}
                showWebcam={showWebcam}
                setIsDialogOpen={setIsDialogOpen}
                setDialogType={setDialogType}
              />
            </div>
          </div>
        </div>
      </main>

      <Dialog lastFrame ={lastFrame} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} type={dialogType} />

      <footer className="bg-white dark:bg-gray-800 shadow mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © 2023 Face Authentication System. All rights reserved.
          </p>
        </div>
      </footer>

      <Toaster position="bottom-right" />
    </div>
  )
}

