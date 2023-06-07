import forge from 'node-forge';

const encrypt = (data, masterPassword) => {
  const salt = forge.random.getBytesSync(128);
  const key = forge.pkcs5.pbkdf2(masterPassword, salt, 200000, 32);
  const iv = forge.random.getBytesSync(16);

  const cipher = forge.cipher.createCipher('AES-CTR', key);
  cipher.start({iv: iv});
  cipher.update(forge.util.createBuffer(data));
  cipher.finish();

  const encrypted = cipher.output;
  return {
    data: encrypted.toHex(),
    salt: forge.util.encode64(salt),
    iv: forge.util.encode64(iv)
  };
};
  
const decrypt = (encryption, masterPassword) => {
  const key = forge.pkcs5.pbkdf2(masterPassword, forge.util.decode64(encryption.salt), 200000, 32);
  const iv = forge.util.decode64(encryption.iv);

  const decipher = forge.cipher.createDecipher('AES-CTR', key);
  decipher.start({iv: iv});
  decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encryption.password)));
  decipher.finish();
  

  return decipher.output.toString();
};

export { encrypt, decrypt };
