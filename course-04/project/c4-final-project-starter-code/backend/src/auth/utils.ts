import { decode } from 'jsonwebtoken'
import { getToken } from '../lambda/auth/auth0Authorizer'

import { JwtPayload } from './JwtPayload'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(authHeader: string): string {
  const jwtToken = getToken(authHeader)
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}


/**
 * Convert a jwt certificate into a PEM certificate
 * @param cert JWT certificate
 * @returns a pem certificate
 */
export function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}