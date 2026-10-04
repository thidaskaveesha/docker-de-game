import { DockerEngineState, DockerContainer, DockerImage, VirtualFile } from './types';

export const INITIAL_DOCKER_STATE: DockerEngineState = {
  files: [
    {
      name: "Dockerfile",
      content: `FROM nginx:latest\nCOPY index.html /usr/share/nginx/html/index.html\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]`
    },
    {
      name: "index.html",
      content: `<div style="text-align:center; padding:50px; font-family:sans-serif; background:#111; color:#0ea5e9;">\n  <h1>🚀 Welcome to My Custom Docker Web App!</h1>\n  <p>Deployed successfully inside a custom Docker container.</p>\n</div>`
    }
  ],
  images: [
    {
      id: 'sha256:d157338c3a77',
      repository: 'alpine',
      tag: 'latest',
      size: '7.33MB',
      created: '2 days ago'
    }
  ],
  containers: [],
  history: []
};

export function generateShortId(length = 12): string {
  const chars = 'abcdef0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function parseCommand(rawCmd: string): { command: string; args: string[]; flags: Record<string, any> } {
  const trimmed = rawCmd.trim();
  const parts: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if ((char === '"' || char === "'")) {
      if (inQuote && char === quoteChar) {
        inQuote = false;
        quoteChar = '';
      } else if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else {
        current += char;
      }
    } else if (char === ' ' && !inQuote) {
      if (current.length > 0) {
        parts.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  if (current.length > 0) parts.push(current);

  const flags: Record<string, any> = {};
  const cleanArgs: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith('--')) {
      const kv = part.slice(2).split('=');
      const key = kv[0];
      let val: any = kv[1] !== undefined ? kv[1] : true;
      if (val === true && i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
        val = parts[i + 1];
        i++;
      }
      flags[key] = val;
    } else if (part.startsWith('-') && part.length > 1) {
      const flagChars = part.slice(1);
      for (let j = 0; j < flagChars.length; j++) {
        const flagChar = flagChars[j];
        if (flagChar === 'p' || flagChar === 'e' || flagChar === 'v' || flagChar === 'name') {
          if (j === flagChars.length - 1 && i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
            flags[flagChar] = parts[i + 1];
            i++;
          } else {
            flags[flagChar] = true;
          }
        } else {
          flags[flagChar] = true;
        }
      }
    } else {
      cleanArgs.push(part);
    }
  }

  return { command: parts[0] || '', args: cleanArgs, flags };
}

export interface CommandResult {
  output: string;
  error?: boolean;
  newState: DockerEngineState;
}

export function executeDockerCommand(
  rawCmd: string,
  currentState: DockerEngineState
): CommandResult {
  const trimmed = rawCmd.trim();
  if (!trimmed) {
    return { output: '', newState: currentState };
  }

  const state = JSON.parse(JSON.stringify(currentState)) as DockerEngineState;
  state.history.push(trimmed);

  const { args, flags } = parseCommand(trimmed);

  if (args[0] === 'clear') {
    return { output: 'CLEAR_CLI', newState: state };
  }

  if (args[0] === 'ls') {
    const fileList = state.files.map(f => f.name).join('   ');
    return { output: fileList || '(empty workspace directory)', newState: state };
  }

  if (args[0] === 'cat') {
    const filename = args[1];
    if (!filename) return { output: 'cat: missing filename', error: true, newState: state };
    const target = state.files.find(f => f.name === filename);
    if (!target) return { output: `cat: ${filename}: No such file or directory`, error: true, newState: state };
    return { output: target.content, newState: state };
  }

  if (args[0] !== 'docker') {
    return {
      output: `bash: ${args[0]}: command not found. Type 'docker --help' or see guidelines.`,
      error: true,
      newState: state
    };
  }

  const dockerSubcmd = args[1];

  switch (dockerSubcmd) {
    case '--help':
    case 'help':
      return {
        output: `Usage:  docker COMMAND

Common Commands:
  pull        Pull an image from a registry
  run         Run a command in a new container
  ps          List containers
  stop        Stop one or more running containers
  rm          Remove one or more containers
  images      List images
  logs        Fetch logs of a container
  build       Build an image from a Dockerfile
  compose     Docker Compose management`,
        newState: state
      };

    case 'pull': {
      const imageName = args[2];
      if (!imageName) return { output: 'Error: "docker pull" requires image argument.', error: true, newState: state };
      const [repo, tag = 'latest'] = imageName.split(':');

      if (state.images.some(i => i.repository === repo)) {
        return { output: `Image ${repo}:${tag} is already up to date.`, newState: state };
      }

      state.images.push({
        id: `sha256:${generateShortId(12)}`,
        repository: repo,
        tag: tag,
        size: '142MB',
        created: 'Just now'
      });

      return {
        output: `Using default tag: ${tag}\nPulling from library/${repo}\nDigest: sha256:${generateShortId(32)}\nStatus: Downloaded newer image for ${repo}:${tag}`,
        newState: state
      };
    }

    case 'images': {
      if (state.images.length === 0) return { output: 'REPOSITORY   TAG       IMAGE ID       SIZE', newState: state };
      const header = 'REPOSITORY'.padEnd(14) + 'TAG'.padEnd(10) + 'IMAGE ID'.padEnd(15) + 'SIZE';
      const rows = state.images.map(i => i.repository.padEnd(14) + i.tag.padEnd(10) + i.id.slice(7, 19).padEnd(15) + i.size);
      return { output: [header, ...rows].join('\n'), newState: state };
    }

    case 'run': {
      if (args.length < 3) return { output: 'Error: "docker run" requires an image name argument.', error: true, newState: state };

      const isDetached = flags.d || flags['detach'];
      const customName = flags.name || flags['name'];
      const portFlag = flags.p || flags['publish'];
      const envFlag = flags.e || flags['env'];

      const imageName = args[args.length - 1];
      const [repo, tag = 'latest'] = imageName.split(':');

      // Auto add image if needed
      if (!state.images.some(i => i.repository === repo)) {
        state.images.push({
          id: `sha256:${generateShortId(12)}`,
          repository: repo,
          tag: tag,
          size: '142MB',
          created: 'Just now'
        });
      }

      const ports: { hostPort: string; containerPort: string }[] = [];
      if (portFlag) {
        const [hp, cp] = String(portFlag).split(':');
        ports.push({ hostPort: hp, containerPort: cp || hp });
      }

      const envVars: Record<string, string> = {};
      if (envFlag) {
        const [k, v] = String(envFlag).split('=');
        if (k) envVars[k] = v || '';
      }

      const containerId = generateShortId(12);
      const name = customName || `${repo}-${generateShortId(4)}`;

      // Check if there is an index.html file in virtual files to show in Web View
      const htmlFile = state.files.find(f => f.name === 'index.html');
      const webContent = (repo === 'my-app' && htmlFile) ? htmlFile.content : undefined;

      const newContainer: DockerContainer = {
        id: containerId,
        name: name,
        imageId: `sha256:${generateShortId(12)}`,
        imageName: `${repo}:${tag}`,
        status: repo === 'hello-world' ? 'exited' : 'running',
        command: repo === 'nginx' ? 'nginx -g "daemon off;"' : 'app-entrypoint',
        ports: ports,
        env: envVars,
        webContent: webContent,
        created: 'Just now',
        logs: repo === 'hello-world' ? ['Hello from Docker!'] : ['Server initialized and listening for HTTP connections']
      };

      state.containers.unshift(newContainer);

      if (isDetached) {
        return { output: containerId + generateShortId(52), newState: state };
      } else {
        return { output: newContainer.logs.join('\n'), newState: state };
      }
    }

    case 'ps': {
      const showAll = flags.a;
      let targets = state.containers;
      if (!showAll) targets = targets.filter(c => c.status === 'running');

      if (targets.length === 0) return { output: 'CONTAINER ID   IMAGE     COMMAND   STATUS    PORTS     NAMES', newState: state };

      const header = 'CONTAINER ID'.padEnd(15) + 'IMAGE'.padEnd(16) + 'COMMAND'.padEnd(18) + 'STATUS'.padEnd(14) + 'PORTS'.padEnd(20) + 'NAMES';
      const rows = targets.map(c => {
        const pStr = c.ports.map(p => `0.0.0.0:${p.hostPort}->${p.containerPort}`).join(',') || '-';
        return c.id.slice(0, 12).padEnd(15) + c.imageName.slice(0, 15).padEnd(16) + `"${c.command.slice(0, 15)}"`.padEnd(18) + c.status.padEnd(14) + pStr.padEnd(20) + c.name;
      });

      return { output: [header, ...rows].join('\n'), newState: state };
    }

    case 'stop': {
      const target = args[2];
      if (!target) return { output: 'Error: "docker stop" requires container name or id.', error: true, newState: state };
      const c = state.containers.find(item => item.name === target || item.id.startsWith(target));
      if (!c) return { output: `No such container: ${target}`, error: true, newState: state };
      c.status = 'exited';
      return { output: target, newState: state };
    }

    case 'rm': {
      const target = args[2];
      if (!target) return { output: 'Error: "docker rm" requires container name or id.', error: true, newState: state };
      const idx = state.containers.findIndex(item => item.name === target || item.id.startsWith(target));
      if (idx === -1) return { output: `No such container: ${target}`, error: true, newState: state };
      state.containers.splice(idx, 1);
      return { output: target, newState: state };
    }

    case 'logs': {
      const target = args[2];
      if (!target) return { output: 'Error: "docker logs" requires container identifier.', error: true, newState: state };
      const c = state.containers.find(item => item.name === target || item.id.startsWith(target));
      if (!c) return { output: `No such container: ${target}`, error: true, newState: state };
      return { output: c.logs.join('\n'), newState: state };
    }

    case 'build': {
      const tagIdx = args.indexOf('-t');
      let customTag = 'my-app:1.0';
      if (tagIdx !== -1 && args[tagIdx + 1]) customTag = args[tagIdx + 1];
      const [repo, tag = 'latest'] = customTag.split(':');

      const buildId = generateShortId(12);
      state.images.unshift({
        id: `sha256:${buildId}`,
        repository: repo,
        tag: tag,
        size: '155MB',
        created: 'Just now'
      });

      const buildOutput = [
        `[+] Building 3.1s (4/4) FINISHED`,
        ` => [1/2] FROM nginx:latest`,
        ` => [2/2] COPY index.html /usr/share/nginx/html/index.html`,
        `Successfully built ${buildId.slice(0, 12)}`,
        `Successfully tagged ${repo}:${tag}`
      ].join('\n');

      return { output: buildOutput, newState: state };
    }

    case 'compose': {
      if (args[2] === 'up') {
        state.containers.unshift(
          {
            id: generateShortId(12),
            name: 'compose-web-1',
            imageId: 'sha256:web',
            imageName: 'nginx:latest',
            status: 'running',
            command: 'nginx',
            ports: [{ hostPort: '8080', containerPort: '80' }],
            env: {},
            created: 'Just now',
            logs: ['Stack web server initialized']
          },
          {
            id: generateShortId(12),
            name: 'compose-db-1',
            imageId: 'sha256:db',
            imageName: 'postgres:latest',
            status: 'running',
            command: 'postgres',
            ports: [{ hostPort: '5432', containerPort: '5432' }],
            env: { POSTGRES_PASSWORD: 'secret' },
            created: 'Just now',
            logs: ['Stack database server ready']
          }
        );
        return { output: '[+] Creating 2/2\n ✔ Container compose-web-1 Started\n ✔ Container compose-db-1 Started', newState: state };
      }
      return { output: 'Usage: docker compose up -d', newState: state };
    }

    default:
      return { output: `docker: '${dockerSubcmd}' is not a valid docker command.`, error: true, newState: state };
  }
}
