const mockUser = {
  _id: '665ab5f3c58a3f18a0f1c7b1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'johndoe@example.com',
  password: 'hashedpassword123', // you can mock hashed one or plain
  phone: '9876543210',
  role: '665ab5f3c58a3f18a0f1c7a9',
  address: '123 Main Street, Mumbai',
  gender: 'male',
  profile_pic: 'https://example.com/profiles/john.jpg',
  country_code: '+91',
  status: 'online',
  last_activee_at: new Date('2024-06-01T10:00:00Z'),
  devicee_token: 'some-device-token',
  is_authorized_rider: true,
  driving_liscence_no: true,
  adhaar_card_no: '123412341234',
  adhaar_card_photo: 'https://example.com/docs/aadhar.jpg',
  pan_card_no: 'ABCDE1234F',
  pan_card_photo: 'https://example.com/docs/pan.jpg',
  vehicle_details: '665ab5f3c58a3f18a0f1c7c5',
  is_deleted: false,
  is_active: true,
  created_by: '665ab5f3c58a3f18a0f1c7aa',
  updated_by: '665ab5f3c58a3f18a0f1c7aa',
  created_at: new Date('2024-06-01T09:00:00Z'),
  updated_at: new Date('2024-06-01T10:30:00Z'),
};

const mock_user_signup = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'johndoe@example.com',
  password: 'hashedpassword123',
  phone: '9876543210',
  role: '665ab5f3c58a3f18a0f1c7a9',
  address: '123 Main Street, Mumbai',
  country_code: '+91',
  gender: 'male',
  is_authorized_rider: true,
};

const mock_user_login = {
  email: 'johndoe@example.com',
  password: 'hashedpassword123',
};

module.exports = mockUser;
