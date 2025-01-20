import axios from "axios"
let API_BASE_URL  = "http://127.0.0.1:8000"

const base64ToBlob = (base64Str) => {
    const base64Regex = /^data:image\/(png|jpeg);base64,/;
    const matches = base64Str.match(base64Regex);
  
    if (!matches) {
      throw new Error("Invalid base64 string");
    }
  
    const base64Content = base64Str.replace(base64Regex, "");
    const byteCharacters = atob(base64Content);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const byteArray = new Uint8Array(1024);
      for (let i = 0; i < 1024 && offset + i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters[offset + i].charCodeAt(0);
      }
      byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays, { type: "image/png" });
  }
  

export const send_img_login = async (imageUrl) => {
    try {
        const formData = new FormData();
        formData.append("file", base64ToBlob(imageUrl), "image.png");

        const response = await axios.post(`${API_BASE_URL}/login`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
}

export const send_img_logout = async (imageUrl) => {
try {
    const formData = new FormData();
    formData.append("file", base64ToBlob(imageUrl), "image.png");

    const response = await axios.post(`${API_BASE_URL}/logout`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
} catch (error) {
    console.error("Error during logout:", error);
    throw error;
}
}

export const register_new_user = async (username, imageUrl) => {
    try {
      const formData = new FormData();
      formData.append("text", username);
      formData.append("file", base64ToBlob(imageUrl), "image.png");
  
      const response = await axios.post(`${API_BASE_URL}/register_new_user`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error("Error during user registration:", error);
      throw error;
    }
}  
  

export const downloadLogs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_attendance_logs`, {
      responseType: "blob",
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "logs.zip")
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error("Error downloading logs:", error)
    throw error
  }
}

