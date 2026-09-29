// Virtual lab network: one Kali attacker, one Metasploitable-style target.
// Everything runs in the browser — no VMs, no setup.

export interface SimService {
  port: number;
  name: string;
  version: string;
  banner?: string;
  scripts?: string[]; // -sC script output lines
}

export interface SimHost {
  ip: string;
  hostname: string;
  os: string;
  services: SimService[];
}

export const KALI_IP = "192.168.56.10";
export const TARGET_IP = "192.168.56.20";
export const SUBNET = "192.168.56.0/24";

const targetServices: SimService[] = [
  {
    port: 21, name: "ftp", version: "vsftpd 2.3.4",
    banner: "220 (vsFTPd 2.3.4)",
    scripts: ["|_ftp-anon: Anonymous FTP login allowed (FTP code 230)"],
  },
  { port: 22, name: "ssh", version: "OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)" },
  { port: 23, name: "telnet", version: "Linux telnetd" },
  { port: 25, name: "smtp", version: "Postfix smtpd" },
  { port: 53, name: "domain", version: "ISC BIND 9.4.2" },
  {
    port: 80, name: "http", version: "Apache httpd 2.2.8 (Ubuntu) DAV/2",
    banner: "HTTP/1.1 200 OK",
    scripts: ["|_http-title: Metasploitable2 - Linux"],
  },
  { port: 111, name: "rpcbind", version: "2 (RPC #100000)" },
  {
    port: 139, name: "netbios-ssn", version: "Samba smbd 3.X - 4.X (workgroup: WORKGROUP)",
    scripts: ["| smb-enum-shares:", "|_  tmp - READ/WRITE"],
  },
  {
    port: 445, name: "microsoft-ds", version: "Samba smbd 3.X - 4.X (workgroup: WORKGROUP)",
  },
  { port: 512, name: "exec", version: "netkit-rsh rexecd" },
  { port: 513, name: "login", version: "OpenBSD or Solaris rlogind" },
  { port: 514, name: "shell", version: "Netkit rshd" },
  { port: 1099, name: "rmiregistry", version: "GNU Classpath grmiregistry" },
  { port: 1524, name: "shell", version: "Metasploitable root shell" },
  { port: 2121, name: "ftp", version: "ProFTPD 1.3.1" },
  { port: 3306, name: "mysql", version: "MySQL 5.0.51a-3ubuntu5" },
  { port: 3632, name: "distccd", version: "distccd v1 ((GNU) 4.2.4 (Ubuntu 4.2.4-1ubuntu3))" },
  { port: 5432, name: "postgresql", version: "PostgreSQL DB 8.3.0 - 8.3.7" },
  { port: 5900, name: "vnc", version: "VNC (protocol 3.3)" },
  { port: 6000, name: "X11", version: "(access denied)" },
  { port: 6667, name: "irc", version: "UnrealIRCd 3.2.8.1" },
  { port: 8009, name: "ajp13", version: "Apache Jserv (Protocol v1.3)" },
  {
    port: 8180, name: "http", version: "Apache Tomcat/Coyote JSP engine 1.1",
    scripts: ["|_http-title: Apache Tomcat/5.5"],
  },
];

export const hosts: Record<string, SimHost> = {
  [KALI_IP]: {
    ip: KALI_IP,
    hostname: "kali",
    os: "Linux 6.x (Kali GNU/Linux)",
    services: [
      { port: 22, name: "ssh", version: "OpenSSH 9.x" },
    ],
  },
  [TARGET_IP]: {
    ip: TARGET_IP,
    hostname: "metasploitable",
    os: "Linux 2.6.24-16-server (Ubuntu 8.04)",
    services: targetServices,
  },
};

export function lookup(ip: string): SimHost | undefined {
  return hosts[ip];
}

export function isInLab(ip: string): boolean {
  return ip.startsWith("192.168.56.");
}
