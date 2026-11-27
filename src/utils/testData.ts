import path from 'path';
import fs from 'fs';

export interface UserProfile {
  title: string;
  name: string;
  password: string;
  day: string;
  month: string;
  year: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobile: string;
}

export interface FakePayment {
  nameOnCard: string;
  cardNumber: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface ProductSearch {
  keyword: string;
  expectedPartialName?: string;
  expectedMessage?: string;
}

interface UsersData {
  validUser: UserProfile;
  invalidCredentials: { email: string; password: string };
  duplicateEmailHint: string;
  fakePayment: FakePayment;
}

interface ProductsData {
  validSearch: ProductSearch;
  alternateSearch: ProductSearch;
  invalidSearch: ProductSearch;
  cartQuantity: { increaseTo: number };
}

const dataDir = path.resolve(__dirname, '../../test-data');

function loadJson<T>(fileName: string): T {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

export const usersData = loadJson<UsersData>('users.json');
export const productsData = loadJson<ProductsData>('products.json');

export function generateUniqueEmail(prefix = 'auto.user'): string {
  const stamp = Date.now();
  const rand = Math.floor(Math.random() * 10_000);
  return `${prefix}.${stamp}.${rand}@testmail.example`;
}

export function buildSignupUser(overrides: Partial<UserProfile> = {}): UserProfile & { email: string } {
  return {
    ...usersData.validUser,
    ...overrides,
    email: generateUniqueEmail(),
  };
}
