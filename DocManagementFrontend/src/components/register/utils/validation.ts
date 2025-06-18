export const validatePersonalUserInfo = (formData: {
  firstName: string;
  lastName: string;
  cin?: string;
  personalPhone?: string;
}) => {
  const errors: Record<string, string> = {};
  
  // Personal user validation
  if (!formData.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }
  
  if (!formData.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (formData.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }
  
  // CIN and phone are now optional
  // Only validate if they are provided
  if (formData.cin && formData.cin.trim().length === 0) {
    errors.cin = 'CIN cannot be empty if provided';
  }
  
  if (formData.personalPhone && formData.personalPhone.trim().length === 0) {
    errors.personalPhone = 'Phone number cannot be empty if provided';
  }
  
  return errors;
};

export const validateCompanyInfo = (formData: {
  companyName?: string;
  companyRC?: string;
  companyPhone?: string;
  companyWebsite?: string;
}) => {
  const errors: Record<string, string> = {};
  
  // Company validation
  if (!formData.companyName?.trim()) {
    errors.companyName = 'Company name is required';
  }
  
  if (!formData.companyRC?.trim()) {
    errors.companyRC = 'Company RC is required';
  }
  
  if (!formData.companyPhone?.trim()) {
    errors.companyPhone = 'Company phone is required';
  }
  
  if (formData.companyWebsite && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}$/i.test(formData.companyWebsite)) {
    errors.companyWebsite = 'Please enter a valid website URL';
  }
  
  return errors;
};

// Split the original validateEmailPasswordStep into two separate functions
export const validateUsernameEmailStep = (formData: {
  username: string;
  email: string;
}) => {
  const errors: Record<string, string> = {};
  
  if (!formData.username.trim()) {
    errors.username = 'Username is required';
  } else if (formData.username.trim().length < 4) {
    errors.username = 'Username must be at least 4 characters';
  }
  
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  return errors;
};

export const validatePasswordStep = (formData: {
  password: string;
  confirmPassword: string;
}) => {
  const errors: Record<string, string> = {};
  
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])/.test(formData.password)) {
    errors.password = 'Password must contain at least one lowercase letter';
  } else if (!/(?=.*[A-Z])/.test(formData.password)) {
    errors.password = 'Password must contain at least one uppercase letter';
  } else if (!/(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain at least one number';
  } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
    errors.password = 'Password must contain at least one special character';
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
};

// Keep the original function for backward compatibility
export const validateEmailPasswordStep = (formData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const errors: Record<string, string> = {};
  
  if (!formData.username.trim()) {
    errors.username = 'Username is required';
  } else if (formData.username.trim().length < 4) {
    errors.username = 'Username must be at least 4 characters';
  }
  
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/(?=.*[a-z])/.test(formData.password)) {
    errors.password = 'Password must contain at least one lowercase letter';
  } else if (!/(?=.*[A-Z])/.test(formData.password)) {
    errors.password = 'Password must contain at least one uppercase letter';
  } else if (!/(?=.*\d)/.test(formData.password)) {
    errors.password = 'Password must contain at least one number';
  } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
    errors.password = 'Password must contain at least one special character';
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return errors;
};
