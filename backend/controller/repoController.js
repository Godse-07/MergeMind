const Repo = require("../model/Repo");

const repoController = async (req, res) => {
    try {
        const userId = req.user.id;
        const repos = await Repo.find({ user: userId });
        res.status(200).json({ success: true, repos });
    }catch (error){
        console.log("Error in repoController", error);
        res.status(500).json({ message: "Facing issue while collecting repo" });
    }
}

module.exports = {
    repoController
}