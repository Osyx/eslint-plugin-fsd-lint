// Custom segment example - services
export class UserService {
  async fetchUser(id: string) {
    // API call logic
    return { id, name: 'John Doe' };
  }

  async updateUser(id: string, data: any) {
    // Update logic
    return { id, ...data };
  }
}

export const userService = new UserService();