const formatResponse = (success, data, message = "") => {
  return {
    success,
    message,
    data,
  };
};

module.exports = {
  formatResponse,
};