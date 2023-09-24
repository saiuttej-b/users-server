import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';
import { v4 } from 'uuid';

export function generateTimestampId() {
  return `${Date.now()}-${v4()}`;
}

export function generateId() {
  return v4();
}

export function generateFileName(originalFileName: string, addOriginalName = true) {
  const nameParts = originalFileName.split('.');
  if (nameParts.length < 2) {
    throw new BadRequestException('Invalid file');
  }
  const suffix = nameParts.at(-1);

  const timestamp = Date.now();
  const uuid = v4();
  let name = `${timestamp}-${uuid}`;

  if (addOriginalName) {
    const nameWithOutExtension = nameParts.slice(0, nameParts.length - 1).join('.');
    const sanitizedFileName = nameWithOutExtension.replaceAll(/[^a-zA-Z0-9]+/g, '-');
    name = `${name}-${sanitizedFileName}`;
  }

  return `${name}.${suffix}`;
}

export function getSetDefaultFn(defaultValue: any) {
  return (value: any) => {
    if (value === undefined) return defaultValue;
    if (value === null) return defaultValue;
    return value;
  };
}

export function hashValue(value: string) {
  return bcrypt.hash(value, 10);
}

export function compareHash(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}

export function validateUsername(username: string) {
  // Check if username is null or empty
  if (!username) return false;

  // Check if username is an email
  if (isEmail(username)) return false;

  // Check if username contains spaces
  if (username.includes(' ')) return false;

  // Check if username starts with a number or special character
  // Username should start with a letter
  if (!username.match(/^[a-zA-Z]/)) return false;

  // Check if username contains special characters
  // Username should contain only letters, numbers, dashes and underscores
  if (!username.match(/^[a-zA-Z0-9-_]+$/)) return false;

  // Check if username is less than 3 characters
  if (username.length < 3) return false;

  return true;
}
