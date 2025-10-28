const jwt = require("jsonwebtoken");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const passwordEncryption = require("../config/passwordEncryption");
const axios = require("axios");
const Repo = require("../model/Repo");
const { registerWebhook } = require("../config/registerWebhook");

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // checking if userName and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // checking if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        githubConnected: user.githubConnected,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const signupController = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // checking if userName and password are provided or not
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please provide all the fields" });
    }

    const isexistingUser = await User.findOne({ email });

    if (isexistingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await passwordEncryption(password);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Facing issue while signup" });
  }
};

const logoutController = (req, res) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Facing issue while logout" });
  }
};

const connectGithubController = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ message: "Code or state not provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(state, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired state token" });
    }

    const userId = decoded.id;
    const currUser = await User.findById(userId);
    if (!currUser) return res.status(404).json({ message: "User not found" });

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken)
      return res
        .status(400)
        .json({ message: "Failed to retrieve GitHub access token" });

    const profileResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });
    const githubProfile = profileResponse.data;

    currUser.githubConnected = true;
    currUser.profilePicture = githubProfile.avatar_url;
    currUser.githubToken = accessToken;
    await currUser.save();

    const reposResponse = await axios.get(
      "https://api.github.com/user/repos?visibility=all&per_page=100",
      { headers: { Authorization: `token ${accessToken}` } }
    );

    const repos = reposResponse.data;

    const repoPromises = repos.map((repo) =>
      Repo.findOneAndUpdate(
        { githubId: repo.id },
        {
          user: currUser._id,
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          htmlUrl: repo.html_url,
          private: repo.private,
          description: repo.description,
          language: repo.language,
          forksCount: repo.forks_count,
          stargazersCount: repo.stargazers_count,
          watchersCount: repo.watchers_count,
          updatedAt: repo.updated_at,
        },
        { upsert: true, new: true }
      )
    );

    await Promise.all(repoPromises);

    for (const repo of repos) {
      try {
        await registerWebhook(repo.full_name, accessToken);
      } catch (err) {
        console.log(`❌ Failed to add webhook`, err.message);
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/`);
  } catch (error) {
    console.log("Error in connectGithub controller", error);
    res
      .status(500)
      .json({ message: "Facing issue while connecting to Github" });
  }
};

const disconnectGithubController = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.githubConnected) {
      return res.status(400).json({ message: "GitHub is not connected" });
    }

    const accessToken = user.githubToken;

    // Remove all webhooks safely
    const repos = await Repo.find({ user: userId });
    for (const repo of repos) {
      try {
        const hooks = await axios.get(
          `https://api.github.com/repos/${repo.fullName}/hooks`,
          {
            headers: { Authorization: `token ${accessToken}` },
          }
        );

        for (const hook of hooks.data) {
          if (hook.config?.url?.includes(process.env.BACKEND_URL)) {
            await axios.delete(
              `https://api.github.com/repos/${repo.fullName}/hooks/${hook.id}`,
              {
                headers: { Authorization: `token ${accessToken}` },
              }
            );
          }
        }
      } catch (err) {
        console.log(
          `❌ Failed to remove webhook for ${repo.fullName}`,
          err.message
        );
      }
    }

    user.githubConnected = false;
    user.githubToken = null;
    await user.save();

  
    res.status(200).json({ message: "GitHub disconnected successfully" });
  } catch (error) {
    console.log("Error in disconnectGithubController", error);
    res.status(500).json({ message: "Error disconnecting GitHub" });
  }
};


module.exports = {
  loginController,
  signupController,
  logoutController,
  connectGithubController,
  disconnectGithubController,
};
