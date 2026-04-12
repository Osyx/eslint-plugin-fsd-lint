// Feature API segment example
export const authApi = {
  async login(email: string, password: string) {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: "fake-jwt-token",
          user: { id: "1", email, name: "John Doe" },
        });
      }, 1000);
    });
  },

  async logout() {
    // Simulate logout
    return Promise.resolve();
  },

  async refreshToken(token: string) {
    // Simulate token refresh
    return Promise.resolve({ token: "new-fake-jwt-token" });
  },
};
