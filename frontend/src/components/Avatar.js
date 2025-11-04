import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Avatar = () => {
  const { token, updateAvatar } = useAuth();
  const [image, setImage] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return;

    try {
      const formData = new FormData();
      formData.append("avatar", image);

      const res = await axios.put(
        "http://localhost:5000/api/users/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );

      updateAvatar(res.data.avatar);
      setImage(null);
      alert("Avatar updated");
    } catch (err) {
      alert("Failed to upload avatar");
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <button type="submit">Update Avatar</button>
    </form>
  );
};

export default Avatar;
