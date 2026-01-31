const estimateTokens = (text) => {
  return Math.ceil(text.length / 4);
};

module.exports = { estimateTokens };
