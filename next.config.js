module.exports = {
  async rewrites() {
    return [
      {
        source: "/pages/api/socket",
        destination: "/pages/api/socket", // Ensure this matches the API route
      },
    ]
  },
}
