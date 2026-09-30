/**
 * Session layer: rotating egress IPs (when a proxy pool is configured),
 * sticky cookies, and realistic browser headers for *authorized* crawls.
 *
 * This is not a Cloudflare / CAPTCHA bypass. Challenge pages should be
 * handled with official vendor APIs or human review — never exploit kits.
 */

export type ProxyClass = "residential" | "datacenter";

export type SessionProfile = {
  userAgent: string;
  acceptLanguage: string;
  proxyClass: ProxyClass;
  egressIp: string;
  cookieJar: Record<string, string>;
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
];

export function createSession(proxyClass: ProxyClass = "datacenter"): SessionProfile {
  return {
    userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    acceptLanguage: "en-US,en;q=0.9",
    proxyClass,
    egressIp: `${octet(20, 200)}.${octet(0, 255)}.${octet(0, 255)}.${octet(1, 254)}`,
    cookieJar: { session: `sm_${Math.random().toString(36).slice(2, 12)}` },
  };
}

export function rotateSession(current: SessionProfile): SessionProfile {
  return {
    ...createSession(current.proxyClass === "residential" ? "datacenter" : "residential"),
    cookieJar: current.cookieJar,
  };
}

function octet(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
