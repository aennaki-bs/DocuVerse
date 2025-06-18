export const calculatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  
  // Length check - 8 characters minimum
  if (password.length >= 8) strength += 1;
  
  // Uppercase letter check
  if (/[A-Z]/.test(password)) strength += 1;
  
  // Lowercase letter check
  if (/[a-z]/.test(password)) strength += 1;
  
  // Number check
  if (/[0-9]/.test(password)) strength += 1;
  
  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  return strength;
}; 