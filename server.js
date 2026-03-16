const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/api/tiktok/:username", async (req, res) => {
  try {
    const username = String(req.params.username || "").replace(/^@+/, "").trim();

    if (!username) {
      return res.json({ found: false, error: "missing username" });
    }

    const url = `https://www.tiktok.com/@${username}`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      },
      timeout: 15000
    });

    const html = response.data;

    const nicknameMatch = html.match(/"nickname":"(.*?)"/);
    const avatarMatch = html.match(/"avatarLarger":"(.*?)"/);
    const followerMatch = html.match(/"followerCount":(\d+)/);

    if (!nicknameMatch) {
      return res.json({ found: false, error: "profile data not found" });
    }

    const pfp = avatarMatch
      ? avatarMatch[1].replace(/\\u002F/g, "/").replace(/\u002F/g, "/")
      : "";

    return res.json({
      found: true,
      username,
      name: nicknameMatch[1],
      followers: followerMatch ? followerMatch[1] : "0",
      pfp
    });
  } catch (error) {
    return res.json({
      found: false,
      error: "user not found or tiktok blocked the request"
    });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
