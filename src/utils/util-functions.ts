import { BadRequestException } from '@nestjs/common';
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
