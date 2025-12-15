const mongoose = require("mongoose");

const rulesSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    rules: {
        type: Array,
        default: []
    }
})

const Rules = mongoose.model("Rules", rulesSchema);

module.exports = Rules;