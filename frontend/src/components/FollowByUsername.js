import React, { useState } from "react";
import axios from "axios";

const FollowByUsername = () => {
  const [username, setUsername] = useState("");

  const sendFollowRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const userRes = await axios.get(`/api/users/find/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const targetUserId = userRes.data._id;

      const res = await axios.post(
        `/api/follow/request/${targetUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send follow request");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "8px", marginRight: "10px" }}
      />
      <button onClick={sendFollowRequest} style={{ padding: "8px 12px" }}>
        Follow
      </button>
    </div>
  );
};

export default FollowByUsername;
