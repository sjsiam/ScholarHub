import { Amplify } from 'aws-amplify'
import { fetchAuthSession } from 'aws-amplify/auth'
import { setTokenProvider } from '@/lib/api/client'

let configured = false

export function configureAmplify() {
  if (configured) return

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
        loginWith: { email: true },
        signUpVerificationMethod: 'code',
      },
    },
  })

  // Every authenticated API call gets the current Cognito access token
  setTokenProvider(async () => {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.accessToken?.toString() ?? null
    } catch {
      return null
    }
  })

  configured = true
}

configureAmplify()