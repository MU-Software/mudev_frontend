export type User = {
  uuid: string
  username: string
  nickname: string
  email: string
  email_verified_at: string | null
  created_at: string
  modified_at: string
  deleted_at: string | null
  locked_at: string | null
  last_signin_at: string | null
  private: boolean
  description: string | null
  profile_image: string | null
  website: string | null
  location: string | null
}

export type SignUpRequest = {
  username: string
  nickname: string
  email: string
  password: string
  password_confirm: string
  private?: boolean
  description?: string | null
  profile_image?: string | null
  website?: string | null
  location?: string | null
  birth?: string | null
}

export type SignInRequest = {
  username: string
  password: string
}

export type TokenResponse = {
  access_token: string
  token_type: 'bearer'
}

export type PasswordChangeRequest = {
  original_password: string
  new_password: string
  new_password_confirm: string
}

export type SignInHistory = {
  ip: string
  user_agent: string
  created_at: string
  modified_at: string
  deleted_at: string | null
  expires_at: string
}
