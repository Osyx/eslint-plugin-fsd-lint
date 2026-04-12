// Custom segment example - validators
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  return username.length >= 3 && username.length <= 20;
};

export const validateAge = (age: number): boolean => {
  return age >= 0 && age <= 120;
};
