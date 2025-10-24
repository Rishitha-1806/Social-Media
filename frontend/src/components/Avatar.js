import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Avatar = () => {
  const { user, setUser } = useAuth();
  const [image, setImage] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image) return alert("Select an image first");

    try {
      const formData = new FormData();
      formData.append("avatar", image);

      const res = await axios.put(
        `http://localhost:5000/api/auth/upload-avatar/${user.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setUser(res.data);
      setImage(null);
      alert("Avatar updated!");
    } catch (err) {
      console.error(err);
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



