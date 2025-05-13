// lib/createSlug.ts

import { GENERATE_SLUG_FROM_TITLE } from '../config'

export default function (title: string, staticSlug: string) {
  return (
    !GENERATE_SLUG_FROM_TITLE ? staticSlug : title
      // Remove leading & trailing whitespace
      .trim()
      // Convert to lowercase
      .toLowerCase()
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Remove special characters
      .replace(/[^\w-]/g, '')
      // Remove leading & trailing separators
      .replace(/^-+|-+$/g, '')
  )
}
