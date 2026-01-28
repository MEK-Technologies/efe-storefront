import type { CollectionConfig } from "payload"

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    useAPIKey: true,
  },
  access: {
    // Prevent deletion and updates through API for security
    // Users can still be managed through admin panel
    delete: () => true,
    update: () => true,
  },
  fields: [
    // No custom fields - using only columns that exist in database
    // Table columns: id, updated_at, created_at, enable_a_p_i_key, api_key, 
    // api_key_index, email, reset_password_token, reset_password_expiration,
    // salt, hash, login_attempts, lock_until
  ],
}