import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
import { verify, decode } from 'jsonwebtoken'
import { Jwt } from '../../auth/Jwt'
import Axios from 'axios'
import { certToPEM } from '../../auth/utils'


const logger = createLogger('auth')

// Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://udagramapp.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', {
    authHeader: event.authorizationToken
  })
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', {
      jwtToken
    })

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}


async function getSigningKeys(jwt_header_kid) {
  try {
    logger.info('Getting the certificate for kid from url', {
      jwt_header_kid,
      jwksUrl
    })

    const cert = await Axios.get(jwksUrl)
    logger.info('Get certificate from the jwksUrl', {
      cert
    })

    const keys = cert.data.keys
    logger.info('Get Keys from the certificate', {
      keys
    })
  
    const signingKeys = keys
        .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signature verification
                    && key.kty === 'RSA' // We are only supporting RSA (RS256)
                    && key.kid           // The `kid` must be present to be useful for later
                    && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
        ).map(key => {
          return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
        });
  
    const signingKey = signingKeys.find(key => key.kid === jwt_header_kid)
    if (!signingKey) {
      throw new Error('Key not found');
    }
  
      // Returns all of the available signing keys.
    return signingKey

  } catch (e) {
    logger.error('Error getting the certificate', { error: e.message })

    return undefined
  }

}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  logger.info('Token', {
    token
  })
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  logger.info('Decoded JWT', {
    jwt
  })

  const signingKeys = await getSigningKeys(jwt.header.kid)
  logger.info('Signing Keys', {
    signingKeys
  })
  return verify(token, signingKeys.publicKey, { algorithms: ['RS256'] }) as JwtPayload

}


export function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  logger.info('GetToken from authHeader', {
    authHeader
  })

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
