import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'super_secret_key_123_estore_project',
    {
      expiresIn: '30d'
    }
  );
};

export default generateToken;
