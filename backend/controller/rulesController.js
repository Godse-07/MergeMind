const Rules = require("../model/Rules");
const redis = require("../cache/redis");

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
    const cacheKey = `user:${userId}:rules`;

    const cachedRules = await redis.get(cacheKey);
    if (cachedRules) {
      console.log(`⚡ Serving custom rules for user ${userId} from cache`);
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedRules),
        fromCache: true,
      });
    }

    const rulesData = await Rules.findOne({ user_id: userId });

    const rules = rulesData ? rulesData.rules : [];

    await redis.setex(cacheKey, 300, JSON.stringify(rules));

    return res.status(200).json({
      success: true,
      data: rules,
      fromCache: false,
    });
  } catch (error) {
    console.error("Error fetching rules:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { setRules, getRules };
