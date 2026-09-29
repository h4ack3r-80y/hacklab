// SimEngine: a faithful-enough simulation of a Kali shell against the virtual lab.
// Parses commands, keeps sessions (ftp/telnet/ssh/nc shells), tracks listeners
// and mission flags. All state lives in the browser.

import { hosts, isInLab, KALI_IP, TARGET_IP, SUBNET, lookup } from "./network";

export type LineColor = "white" | "green" | "red" | "yellow" | "cyan" | "dim";
export interface OutLine {
  text: string;
  color?: LineColor;
  clear?: boolean;
}

type Session =
  | { kind: "ftp"; step: "user" | "pass"; user: string | null }
  | { kind: "login"; service: string; step: "user" | "pass"; user: string | null }
  | { kind: "shell"; prompt: string; root: boolean }
  | { kind: "irc" };

const W = (text: string, color?: LineColor): OutLine => ({ text, color });

function splitArgs(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === q) q = null;
      else cur += c;
    } else if (c === '"' || c === "'") {
      q = c;
    } else if (c === " " || c === "\t") {
      if (cur) { out.push(cur); cur = ""; }
    } else {
      cur += c;
    }
  }
  if (cur) out.push(cur);
  return out;
}

export class SimEngine {
  listeners = new Map<number, boolean>();
  flags = new Set<string>();
  session: Session | null = null;

  prompt(): string {
    if (this.session?.kind === "shell") return this.session.prompt;
    return "┌──(kali㉿kali)-[~]\n└─$ ";
  }

  exec(raw: string): OutLine[] {
    const line = raw.trim();
    if (this.session) return this.handleSession(line);
    if (!line) return [];
    const parts = splitArgs(line);
    const cmd = parts[0];
    const args = parts.slice(1);
    switch (cmd) {
      case "help": return this.cmdHelp();
      case "clear": return [{ text: "", clear: true }];
      case "echo": return [W(args.join(" "))];
      case "whoami": return [W("kali")];
      case "id": return [W("uid=1000(kali) gid=1000(kali) groups=1000(kali)")];
      case "hostname": return [W("kali")];
      case "pwd": return [W("/home/kali")];
      case "ls": return [W("Desktop  Documents  Downloads  recon.txt  scripts")];
      case "cat": return this.cmdCat(args);
      case "ping": return this.cmdPing(args);
      case "nmap": return this.cmdNmap(args);
      case "telnet": return this.cmdTelnet(args);
      case "nc":
      case "ncat": return this.cmdNc(args);
      case "curl": return this.cmdCurl(args, line);
      case "wget": return [W("use curl in this lab — wget is on a coffee break.", "dim")];
      case "ssh": return this.cmdSsh(args);
      case "smbclient": return this.cmdSmb(args, line);
      case "msfconsole": return [
        W("[!] No autopilot in this lab — every exploit here is done by hand.", "yellow"),
        W("    That's the point. Type 'help' to see your tools.", "dim"),
      ];
      case "sudo": return [W("nice try — you already own this simulation.", "dim")];
      case "exit": return [W("there is no escape. the lab needs you.", "dim")];
      default:
        return [W(`command not found: ${cmd}  (type 'help')`, "red")];
    }
  }

  // ---------- session input ----------
  private handleSession(line: string): OutLine[] {
    const s = this.session!;
    if (s.kind === "ftp") return this.ftpInput(s, line);
    if (s.kind === "login") return this.loginInput(s, line);
    if (s.kind === "shell") return this.shellInput(s, line);
    if (s.kind === "irc") return this.ircInput(line);
    return [];
  }

  private endSession(msg?: string): OutLine[] {
    this.session = null;
    return msg ? [W(msg, "dim")] : [];
  }

  // ---------- FTP (vsftpd backdoor) ----------
  private ftpInput(s: Extract<Session, { kind: "ftp" }>, line: string): OutLine[] {
    const up = line.toUpperCase();
    if (up.startsWith("USER")) {
      const user = line.slice(4).trim();
      s.user = user;
      s.step = "pass";
      return [W("331 Please specify the password.")];
    }
    if (up.startsWith("PASS")) {
      const out: OutLine[] = [W("230 Login successful.")];
      if (s.user && s.user.endsWith(":)")) {
        this.flags.add("backdoor_armed");
        out.push(W("[!] Backdoor triggered: root shell now listening on TCP 6200", "yellow"));
        out.push(W("    Hint: connect to it with  nc " + TARGET_IP + " 6200", "dim"));
      }
      out.push(W("Connection closed by foreign host.", "dim"));
      this.session = null;
      return out;
    }
    if (up === "QUIT" || up === "BYE" || up === "EXIT") {
      return this.endSession("Connection closed.");
    }
    if (up === "HELP") return [W("Commands: USER, PASS, QUIT")];
    return [W("500 Unknown command.")];
  }

  // ---------- telnet/ssh login ----------
  private loginInput(s: Extract<Session, { kind: "login" }>, line: string): OutLine[] {
    if (s.step === "user") {
      s.user = line;
      s.step = "pass";
      return [W("Password: ")];
    }
    if (s.user === "msfadmin" && line === "msfadmin") {
      this.flags.add("weak_creds");
      this.session = { kind: "shell", prompt: "msfadmin@metasploitable:~$ ", root: false };
      return [
        W("Last login: ... from 192.168.56.10", "dim"),
        W("Welcome — you are logged in as msfadmin (low-privilege shell).", "green"),
      ];
    }
    s.step = "user";
    return [W("Login incorrect"), W("metasploitable login: ")];
  }

  // ---------- obtained shells ----------
  private shellInput(s: Extract<Session, { kind: "shell" }>, line: string): OutLine[] {
    const [cmd, ...args] = splitArgs(line);
    switch (cmd) {
      case "": return [];
      case "whoami": return [W(s.root ? "root" : "msfadmin", "green")];
      case "id": return [W(s.root
        ? "uid=0(root) gid=0(root) groups=0(root)"
        : "uid=1001(msfadmin) gid=1001(msfadmin) groups=1001(msfadmin)")];
      case "hostname": return [W("metasploitable")];
      case "uname": return [W("Linux metasploitable 2.6.24-16-server")];
      case "pwd": return [W(s.root ? "/root" : "/home/msfadmin")];
      case "ls": return [W(s.root ? "vulnerable.txt  loot" : "vulnerable.txt")];
      case "cat":
        if (args[0]?.includes("shadow") && !s.root)
          return [W("cat: /etc/shadow: Permission denied", "red")];
        if (args[0]?.includes("shadow"))
          return [W("root:$1$abc...:18745:0:99999:7:::", "dim")];
        return [W("If you can read this, the box is yours. Now document it.", "dim")];
      case "exit": return this.endSession("Connection closed.");
      case "clear": return [{ text: "", clear: true }];
      default: return [W(s.root ? `${cmd}: done. (root can do anything)` : `${cmd}: command not found`, "dim")];
    }
  }

  // ---------- IRC (UnrealIRCd backdoor) ----------
  private ircInput(line: string): OutLine[] {
    const up = line.toUpperCase();
    if (up === "QUIT" || up === "EXIT") return this.endSession("Connection closed.");
    if (line.startsWith("AB;")) {
      const injected = line.slice(3).trim();
      this.flags.add("irc_rce");
      const out: OutLine[] = [
        W(`:irc.metasploitable NOTICE * :*** Executing: ${injected}`, "yellow"),
      ];
      if (/nc(\.exe)?\s+.*-e/.test(injected) || (injected.includes("nc ") && injected.includes("/bin/sh"))) {
        const m = injected.match(/(\d{1,3}(?:\.\d{1,3}){3})\s+(\d{2,5})/);
        const port = m ? parseInt(m[2], 10) : 4444;
        if (this.listeners.get(port)) {
          this.session = { kind: "shell", prompt: "daemon@metasploitable:/$ ", root: false };
          out.push(W(`[+] Reverse shell caught on port ${port}!`, "green"));
          out.push(W("daemon@metasploitable:/$ ", "green"));
          return out;
        }
        out.push(W("[!] No listener on your Kali for that port. Run: nc -lvnp <port>", "red"));
        return out;
      }
      out.push(W("uid=0(root) gid=0(root) groups=0(root)  ← your command ran as root", "green"));
      return out;
    }
    return [W(":irc.metasploitable 421 * :Unknown command", "dim")];
  }

  // ---------- basic commands ----------
  private cmdHelp(): OutLine[] {
    return [
      W("HackLab shell — your tools:", "cyan"),
      W("  nmap [opts] <target>      scan hosts & services"),
      W("  ping <ip>                 check host is alive"),
      W("  telnet <ip> <port>        talk to a service by hand"),
      W("  nc [-lvnp <port>] [ip] [port]  netcat: connect or listen"),
      W("  curl [opts] <url>         fetch URLs / deploy WARs"),
      W("  ssh <user>@<ip>           try your luck with credentials"),
      W("  smbclient //<ip>/<share> -U '<user>'   talk SMB"),
      W("  clear, whoami, id, exit, help"),
      W("Lab network: kali=" + KALI_IP + "  target=" + TARGET_IP, "dim"),
    ];
  }

  private cmdCat(args: string[]): OutLine[] {
    if (args[0]?.includes("recon")) {
      return [W("Recon notes go here. Real pentesters write everything down.", "dim")];
    }
    return [W(`cat: ${args[0] || ""}: No such file`, "red")];
  }

  private cmdPing(args: string[]): OutLine[] {
    const ip = args.find((a) => /^\d+\.\d+\.\d+\.\d+$/.test(a));
    if (!ip) return [W("usage: ping <ip>", "red")];
    if (!isInLab(ip) && ip !== "8.8.8.8") return [W(`ping: ${ip}: no route (lab is isolated)`, "red")];
    if (!lookup(ip)) return [W(`PING ${ip}: 3 packets transmitted, 0 received, 100% loss`, "red")];
    return [
      W(`PING ${ip} (${ip}) 56(84) bytes of data.`),
      W(`64 bytes from ${ip}: icmp_seq=1 ttl=64 time=0.42 ms`),
      W(`64 bytes from ${ip}: icmp_seq=2 ttl=64 time=0.38 ms`),
      W(`64 bytes from ${ip}: icmp_seq=3 ttl=64 time=0.41 ms`),
      W(`--- ${ip} ping statistics ---`, "dim"),
      W(`3 packets transmitted, 3 received, 0% packet loss`, "green"),
    ];
  }

  // ---------- nmap ----------
  private cmdNmap(args: string[]): OutLine[] {
    const has = (f: string) => args.includes(f);
    const target = args.find((a) => !a.startsWith("-") && a !== "nmap");
    if (!target) return [W("usage: nmap [options] <target>", "red")];
    const out: OutLine[] = [W(`Starting Nmap 7.94 ( https://nmap.org )`, "dim")];

    if (target.includes("/")) {
      // host discovery
      out.push(W(`Nmap scan report for ${KALI_IP}`, "cyan"), W("Host is up."));
      out.push(W(`Nmap scan report for ${TARGET_IP}`, "cyan"), W("Host is up."));
      out.push(W(`Nmap done: 256 IP addresses (2 hosts up) scanned`, "dim"));
      return out;
    }
    const host = lookup(target);
    if (!host) {
      if (isInLab(target)) {
        out.push(W(`Nmap scan report for ${target}`), W("Host is up."));
        out.push(W("All 1000 scanned ports are closed.", "dim"));
        return out;
      }
      return [W(`Failed to resolve "${target}".`, "red")];
    }
    const full = has("-p-");
    const withVer = has("-sV");
    const withScripts = has("-sC");
    const scriptArg = args[args.indexOf("--script") + 1];

    out.push(W(`Nmap scan report for ${target} (${host.hostname})`, "cyan"));
    out.push(W("Host is up (0.00042s latency).", "dim"));
    if (has("-O")) out.push(W("OS details: Linux 2.6.24 (Ubuntu 8.04)", "dim"));
    if (scriptArg) return [...out, ...this.nmapScript(scriptArg, host)];

    out.push(W(full ? "Not shown: 65512 closed tcp ports" : "Not shown: 977 closed tcp ports", "dim"));
    out.push(W("PORT     STATE SERVICE     VERSION", "cyan"));
    for (const s of host.services) {
      const ver = withVer ? `         ${s.version}` : "";
      out.push(W(`${String(s.port).padEnd(8)} open  ${s.name.padEnd(11)}${ver}`));
      if (withScripts && s.scripts) s.scripts.forEach((l) => out.push(W(l, "dim")));
    }
    if (withVer) this.flags.add("recon_done");
    out.push(W("Nmap done: 1 IP address (1 host up) scanned", "dim"));
    return out;
  }

  private nmapScript(name: string, host: (typeof hosts)[string]): OutLine[] {
    const out: OutLine[] = [W(`Nmap scan report for ${host.ip}`, "cyan")];
    if (name.includes("distcc")) {
      const svc = host.services.find((s) => s.port === 3632);
      if (svc) {
        this.flags.add("distcc_found");
        out.push(W("PORT     STATE SERVICE", "cyan"));
        out.push(W("3632/tcp open  distccd"));
        out.push(W('|_distcc-cve2004-2687: VULNERABLE: distccd allows arbitrary command execution (CVE-2004-2687)', "red"));
      } else out.push(W("nothing found.", "dim"));
    } else if (name.includes("smb-vuln") || name === "vuln") {
      out.push(W("| smb-vuln-ms08-067: NOT VULNERABLE", "dim"));
      out.push(W("|_smb-vuln-ms10-054: NOT VULNERABLE", "dim"));
      out.push(W("Note: script kiddie scans miss logic bugs — enumerate by hand too.", "yellow"));
    } else if (name.includes("ftp")) {
      out.push(W("|_ftp-anon: Anonymous FTP login allowed", "yellow"));
    } else {
      out.push(W(`script '${name}': no results on this host.`, "dim"));
    }
    return out;
  }

  // ---------- telnet ----------
  private cmdTelnet(args: string[]): OutLine[] {
    const ip = args[0];
    const port = parseInt(args[1] || "23", 10);
    if (!ip) return [W("usage: telnet <ip> <port>", "red")];
    if (!isInLab(ip) || !lookup(ip)) return [W(`telnet: Unable to connect to remote host`, "red")];
    if (port === 21) {
      this.session = { kind: "ftp", step: "user", user: null };
      return [
        W(`Trying ${ip}...`),
        W(`Connected to ${ip}.`),
        W("Escape character is '^]'."),
        W("220 (vsFTPd 2.3.4)"),
      ];
    }
    if (port === 23) {
      this.session = { kind: "login", service: "telnet", step: "user", user: null };
      return [W(`Trying ${ip}...`), W(`Connected to ${ip}.`), W("metasploitable login: ")];
    }
    return [W(`Connected to ${ip}:${port} — (no interactive simulation for this port)`, "dim")];
  }

  // ---------- netcat ----------
  private cmdNc(args: string[]): OutLine[] {
    if (args.includes("-lvnp") || (args.includes("-l"))) {
      const port = parseInt(args[args.length - 1], 10);
      if (!port) return [W("usage: nc -lvnp <port>", "red")];
      this.listeners.set(port, true);
      return [
        W(`listening on [any] ${port} ...`, "dim"),
        W("(listener running in background — now trigger the reverse shell)", "dim"),
      ];
    }
    const ip = args.find((a) => /^\d+\.\d+\.\d+\.\d+$/.test(a));
    const portStr = args.filter((a) => /^\d+$/.test(a)).pop();
    const port = portStr ? parseInt(portStr, 10) : 0;
    if (!ip || !port) return [W("usage: nc <ip> <port>  |  nc -lvnp <port>", "red")];
    if (!isInLab(ip) || !lookup(ip)) return [W(`nc: connect to ${ip} port ${port}: No route to host`, "red")];

    if (port === 6200 && ip === TARGET_IP) {
      if (this.flags.has("backdoor_armed")) {
        this.flags.add("vsftpd_root");
        this.session = { kind: "shell", prompt: "root@metasploitable:/# ", root: true };
        return [W(`Connection to ${ip} ${port} port [tcp/*] succeeded!`, "green")];
      }
      return [W(`nc: connect to ${ip} port 6200: Connection refused`, "red"),
              W("hint: nothing is listening there... yet. Talk to the FTP service first.", "dim")];
    }
    if (port === 6667 && ip === TARGET_IP) {
      this.session = { kind: "irc" };
      return [
        W(`Connection to ${ip} ${port} port [tcp/irc] succeeded!`),
        W(":irc.metasploitable NOTICE AUTH :*** Looking up your hostname...", "dim"),
        W(":irc.metasploitable NOTICE AUTH :*** Found your hostname", "dim"),
        W("Type IRC commands. (This UnrealIRCd 3.2.8.1 has a known backdoor...)", "dim"),
      ];
    }
    const svc = lookup(ip)?.services.find((s) => s.port === port);
    if (svc?.banner) return [W(svc.banner)];
    if (svc) return [W(`connected to ${ip}:${port} (${svc.name}) — no interactive mode here`, "dim")];
    return [W(`nc: connect to ${ip} port ${port}: Connection refused`, "red")];
  }

  // ---------- curl ----------
  private cmdCurl(args: string[], raw: string): OutLine[] {
    const url = args.find((a) => a.startsWith("http"));
    if (!url) return [W("usage: curl [options] <url>", "red")];
    const m = url.match(/^https?:\/\/([\d.]+)(?::(\d+))?(\/.*)?$/);
    if (!m) return [W("curl: malformed URL", "red")];
    const [, ip, portStr, path = "/"] = m;
    const port = portStr ? parseInt(portStr, 10) : 80;
    if (!isInLab(ip) || !lookup(ip)) return [W("curl: (7) Failed to connect: No route to host", "red")];
    const svc = lookup(ip)!.services.find((s) => s.port === port && s.name === "http");
    if (!svc) return [W(`curl: (7) Failed to connect to ${ip} port ${port}: Connection refused`, "red")];

    const authed = raw.includes("tomcat:tomcat");
    if (path.startsWith("/manager")) {
      if (!authed) return [W("401 Unauthorized — the manager wants credentials.", "yellow")];
      if (raw.includes("--upload-file") && raw.includes("deploy?path=/shell")) {
        this.flags.add("tomcat_deployed");
        return [W("OK - Deployed application at context path /shell", "green")];
      }
      return [W("<html><title>Tomcat Manager</title>... applications: /docs /examples /manager ...</html>", "dim")];
    }
    if (path.startsWith("/shell/shell.jsp")) {
      if (!this.flags.has("tomcat_deployed"))
        return [W("404 — /shell not found. Deploy the WAR first.", "red")];
      const cmdM = url.match(/cmd=([^&]*)/);
      const cmd = decodeURIComponent(cmdM?.[1] || "id").replace(/\+/g, " ");
      this.flags.add("tomcat_rce");
      return [
        W(`[+] Executed on target: ${cmd}`, "green"),
        W(cmd.startsWith("whoami") ? "root" : "uid=0(root) gid=0(root) groups=0(root)", "green"),
      ];
    }
    return [W("<html><head><title>Metasploitable2 - Linux</title></head>...", "dim")];
  }

  // ---------- ssh ----------
  private cmdSsh(args: string[]): OutLine[] {
    const dest = args.find((a) => a.includes("@"));
    if (!dest) return [W("usage: ssh <user>@<ip>", "red")];
    const [user, ip] = dest.split("@");
    if (!isInLab(ip) || !lookup(ip)) return [W(`ssh: connect to host ${ip}: No route to host`, "red")];
    this.session = { kind: "login", service: "ssh", step: "pass", user };
    return [W(`${user}@${ip}'s password: `)];
  }

  // ---------- smbclient ----------
  private cmdSmb(args: string[], raw: string): OutLine[] {
    const share = args.find((a) => a.startsWith("//"));
    if (!share) return [W("usage: smbclient //<ip>/<share> -U '<user>'", "red")];
    const ip = share.split("/")[2];
    if (!isInLab(ip) || !lookup(ip)) return [W("Connection to: No route to host", "red")];
    const uIdx = args.indexOf("-U");
    const username = uIdx >= 0 ? args[uIdx + 1] : "";
    const evil = /[`$]/.test(username) || username.includes("nohup");
    if (evil) {
      const m = raw.match(/(\d{1,3}(?:\.\d{1,3}){3})\s+(\d{2,5})/);
      const port = m ? parseInt(m[2], 10) : 4445;
      if (this.listeners.get(port)) {
        this.flags.add("samba_root");
        this.session = { kind: "shell", prompt: "root@metasploitable:/# ", root: true };
        return [
          W("session setup ok — username passed through the map script...", "dim"),
          W(`[+] Shell caught on port ${port} — you are root!`, "green"),
        ];
      }
      return [
        W("session setup failed: NT_STATUS_LOGON_FAILURE", "red"),
        W("hint: your payload needs somewhere to call home — start a listener: nc -lvnp 4445", "dim"),
      ];
    }
    return [W("Enter WORKGROUP\\msfadmin's password:"), W("session setup failed: NT_STATUS_LOGON_FAILURE", "red")];
  }
}
