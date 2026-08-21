import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    service = new CryptoService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt and decrypt plaintext accurately using master password', () => {
    const masterPassword = 'MySecretMasterPassword123!';
    const salt = service.generateSalt();
    const secretText = 'BankPassword_987654';

    const encrypted = service.encrypt(secretText, masterPassword, salt);
    expect(encrypted.encryptedData).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();

    const decrypted = service.decrypt(
      encrypted.encryptedData,
      encrypted.iv,
      encrypted.authTag,
      masterPassword,
      salt,
    );

    expect(decrypted).toEqual(secretText);
  });

  it('should throw error when decrypting with wrong master password', () => {
    const masterPassword = 'CorrectPassword123!';
    const wrongPassword = 'WrongPassword456!';
    const salt = service.generateSalt();
    const secretText = 'SuperSecretKey';

    const encrypted = service.encrypt(secretText, masterPassword, salt);

    expect(() => {
      service.decrypt(
        encrypted.encryptedData,
        encrypted.iv,
        encrypted.authTag,
        wrongPassword,
        salt,
      );
    }).toThrow();
  });
});
