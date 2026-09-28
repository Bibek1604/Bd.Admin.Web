import axios from 'axios';
import { BASE_URL } from './baseUrl';

/**
 * Exchange the httpOnly bd_rt cookie for a new access token.
 *
 * Single-flight: the backend rotates the refresh token and treats a second use
 * of the same one as replay (it revokes the whole family), so every caller —
 * the 401 interceptor and the startup restore — must share one request.
 */
let inFlight: Promise<string> | null = null;

export const requestNewAccessToken = (): Promise<string> => {
  if (!inFlight) {
    inFlight = axios
      .post(
        `${BASE_URL}api/auth/refresh`,
        {},
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      )
      .then(({ data }) => {
        const token: string = data?.accessToken ?? data?.token ?? '';
        if (!token) throw new Error('Empty access token from refresh endpoint');
        return token;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
};
