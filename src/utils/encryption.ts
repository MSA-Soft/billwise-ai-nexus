// Encryption utilities for HIPAA compliance

import CryptoJS from 'crypto-js';

// Encryption key management
const getEncryptionKey = (): string => {
  const key = import.meta.env.VITE_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Encryption key not configured');
  }
  return key;
};

// Encrypt sensitive data
export const encryptData = (data: string, key?: string): string => {
  try {
    const encryptionKey = key || getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(data, encryptionKey).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt sensitive data
export const decryptData = (encryptedData: string, key?: string): string => {
  try {
    const encryptionKey = key || getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedString) {
      throw new Error('Failed to decrypt data - invalid key or corrupted data');
    }
    
    return decryptedString;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Hash sensitive data (one-way)
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

// Generate secure random string
export const generateSecureId = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Encrypt PHI (Protected Health Information)
export const encryptPHI = (phi: Record<string, any>): Record<string, any> => {
  const encrypted: Record<string, any> = {};
  
  // Fields that contain PHI
  const phiFields = [
    'first_name', 'last_name', 'date_of_birth', 'ssn', 'phone', 'email',
    'address', 'insurance_id', 'medical_record_number'
  ];
  
  Object.keys(phi).forEach(key => {
    if (phiFields.includes(key) && phi[key]) {
      encrypted[key] = encryptData(String(phi[key]));
    } else {
      encrypted[key] = phi[key];
    }
  });
  
  return encrypted;
};

// Decrypt PHI
export const decryptPHI = (encryptedPHI: Record<string, any>): Record<string, any> => {
  const decrypted: Record<string, any> = {};
  
  const phiFields = [
    'first_name', 'last_name', 'date_of_birth', 'ssn', 'phone', 'email',
    'address', 'insurance_id', 'medical_record_number'
  ];
  
  Object.keys(encryptedPHI).forEach(key => {
    if (phiFields.includes(key) && encryptedPHI[key]) {
      try {
        decrypted[key] = decryptData(encryptedPHI[key]);
      } catch (error) {
        console.error(`Failed to decrypt ${key}:`, error);
        decrypted[key] = encryptedPHI[key]; // Return encrypted if decryption fails
      }
    } else {
      decrypted[key] = encryptedPHI[key];
    }
  });
  
  return decrypted;
};

// Mask sensitive data for display
export const maskSensitiveData = (data: string, type: 'ssn' | 'phone' | 'email' | 'name'): string => {
  switch (type) {
    case 'ssn':
      return data.replace(/(\d{3})-(\d{2})-(\d{4})/, '***-**-$3');
    case 'phone':
      return data.replace(/(\d{3})-(\d{3})-(\d{4})/, '($1) ***-$3');
    case 'email':
      const [local, domain] = data.split('@');
      return `${local.charAt(0)}***@${domain}`;
    case 'name':
      const parts = data.split(' ');
      return parts.map(part => part.charAt(0) + '*'.repeat(part.length - 1)).join(' ');
    default:
      return data;
  }
};

// Audit log encryption
export const encryptAuditLog = (logData: Record<string, any>): string => {
  const logString = JSON.stringify(logData);
  return encryptData(logString);
};

// Decrypt audit log
export const decryptAuditLog = (encryptedLog: string): Record<string, any> => {
  const decryptedString = decryptData(encryptedLog);
  return JSON.parse(decryptedString);
};
