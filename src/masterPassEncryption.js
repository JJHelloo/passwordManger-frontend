import forge from 'node-forge';

// Client-side encryption using the encryption key
const encryptMasterPassword = (masterPassword, encryptionKey) => {
  const salt = forge.random.getBytesSync(128);
  const key = forge.pkcs5.pbkdf2(encryptionKey, salt, 100000, 32);
  const iv = forge.random.getBytesSync(16);

  const cipher = forge.cipher.createCipher('AES-CTR', key);
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(masterPassword));
  cipher.finish();

  const encrypted = cipher.output;
  return {
    encryptedMasterPassword: encrypted.toHex(),
    salt: forge.util.encode64(salt),
    iv: forge.util.encode64(iv),
  };
};

// Client-side decryption using the encryption key
const decryptMasterPassword = (encryptedMasterPassword, encryptionKey, salt, iv) => {
  const key = forge.pkcs5.pbkdf2(encryptionKey, forge.util.decode64(salt), 100000, 32);
  const decipher = forge.cipher.createDecipher('AES-CTR', key);
  decipher.start({ iv: forge.util.decode64(iv) });
  decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encryptedMasterPassword)));
  decipher.finish();

  return decipher.output.toString();
};

export{encryptMasterPassword, decryptMasterPassword};
