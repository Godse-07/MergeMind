const Rules = require("../model/Rules");

const setRules = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rules } = req.body;

    if (!Array.isArray(rules)) {
      return res.status(400).json({
        success: false,
        message: "Rules must be an array",
      });
    }

    const updatedRules = await Rules.findOneAndUpdate(
      { user_id: userId },
      { rules },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      data: updatedRules.rules,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getRules = async (req, res) => {
  try {
    const userId = req.user.id;

    const rulesData = await Rules.findOne({ user_id: userId });

    return res.status(200).json({
      success: true,
      data: rulesData ? rulesData.rules : [],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { setRules, getRules };
