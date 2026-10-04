import { Mission } from './types';

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: "1. Hello Docker",
    category: "Basics",
    description: "Download the official 'hello-world' image and execute your first container.",
    initialFiles: [],
    goals: [
      {
        id: "m1-g1",
        text: "Pull image: docker pull hello-world",
        hint: "docker pull hello-world",
        isCompleted: false,
        validate: (state) => state.images.some(img => img.repository === 'hello-world')
      },
      {
        id: "m1-g2",
        text: "Run container: docker run hello-world",
        hint: "docker run hello-world",
        isCompleted: false,
        validate: (state) => state.containers.some(c => c.imageName.includes('hello-world'))
      }
    ],
    solutionCommands: ["docker pull hello-world", "docker run hello-world"],
    badgeName: "Docker Beginner"
  },
  {
    id: 2,
    title: "2. Deploy Web Server",
    category: "Networking",
    description: "Launch an Nginx web server container on port 8080 and view it in Web View.",
    initialFiles: [],
    goals: [
      {
        id: "m2-g1",
        text: "Run Nginx on port 8080: docker run -d -p 8080:80 --name web-server nginx",
        hint: "docker run -d -p 8080:80 --name web-server nginx",
        isCompleted: false,
        validate: (state) => state.containers.some(c => 
          c.imageName.includes('nginx') && 
          c.status === 'running' && 
          c.ports.some(p => p.hostPort === '8080')
        )
      },
      {
        id: "m2-g2",
        text: "Check running containers: docker ps",
        hint: "docker ps",
        isCompleted: false,
        validate: (state, lastCmd) => lastCmd.trim().startsWith('docker ps')
      }
    ],
    solutionCommands: ["docker run -d -p 8080:80 --name web-server nginx", "docker ps"],
    badgeName: "Web Deployer"
  },
  {
    id: 3,
    title: "3. Stop & Clean Containers",
    category: "Lifecycle",
    description: "Manage container states: stop running background tasks and clean up resources.",
    initialFiles: [],
    goals: [
      {
        id: "m3-g1",
        text: "Stop container: docker stop web-server",
        hint: "docker stop web-server",
        isCompleted: false,
        validate: (state) => {
          const c = state.containers.find(item => item.name === 'web-server');
          return c ? c.status === 'exited' : true;
        }
      },
      {
        id: "m3-g2",
        text: "Remove container: docker rm web-server",
        hint: "docker rm web-server",
        isCompleted: false,
        validate: (state) => !state.containers.some(c => c.name === 'web-server')
      }
    ],
    solutionCommands: ["docker stop web-server", "docker rm web-server"],
    badgeName: "Lifecycle Manager"
  },
  {
    id: 4,
    title: "4. Build Custom App (IDE + Web View)",
    category: "Builds",
    description: "Use the IDE editor to inspect Dockerfile and index.html, build your image, and run it.",
    initialFiles: [
      {
        name: "Dockerfile",
        content: `FROM nginx:latest\nCOPY index.html /usr/share/nginx/html/index.html\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]`
      },
      {
        name: "index.html",
        content: `<div style="text-align:center; padding:50px; font-family:sans-serif; background:#111; color:#0ea5e9;">\n  <h1>🚀 Welcome to My Custom Docker Web App!</h1>\n  <p>Deployed successfully inside a custom Docker container.</p>\n</div>`
      }
    ],
    goals: [
      {
        id: "m4-g1",
        text: "Build image: docker build -t my-app:1.0 .",
        hint: "docker build -t my-app:1.0 .",
        isCompleted: false,
        validate: (state) => state.images.some(img => img.repository === 'my-app')
      },
      {
        id: "m4-g2",
        text: "Run container: docker run -d -p 3000:80 --name custom-web my-app:1.0",
        hint: "docker run -d -p 3000:80 --name custom-web my-app:1.0",
        isCompleted: false,
        validate: (state) => state.containers.some(c => c.name === 'custom-web' && c.status === 'running')
      }
    ],
    solutionCommands: [
      "docker build -t my-app:1.0 .",
      "docker run -d -p 3000:80 --name custom-web my-app:1.0"
    ],
    badgeName: "Dockerfile Architect"
  },
  {
    id: 5,
    title: "5. Environment Variables & DB",
    category: "Configuration",
    description: "Configure a secure PostgreSQL database container using environment variables (-e).",
    initialFiles: [],
    goals: [
      {
        id: "m5-g1",
        text: "Run Postgres: docker run -d --name db-server -e POSTGRES_PASSWORD=secret123 postgres",
        hint: "docker run -d --name db-server -e POSTGRES_PASSWORD=secret123 postgres",
        isCompleted: false,
        validate: (state) => state.containers.some(c => c.imageName.includes('postgres') && c.env['POSTGRES_PASSWORD'] === 'secret123')
      },
      {
        id: "m5-g2",
        text: "Inspect logs: docker logs db-server",
        hint: "docker logs db-server",
        isCompleted: false,
        validate: (state, lastCmd) => lastCmd.trim().startsWith('docker logs')
      }
    ],
    solutionCommands: [
      "docker run -d --name db-server -e POSTGRES_PASSWORD=secret123 postgres",
      "docker logs db-server"
    ],
    badgeName: "Database Ops"
  },
  {
    id: 6,
    title: "6. Multi-Container Orchestration",
    category: "Compose",
    description: "Orchestrate multi-service applications using Docker Compose up.",
    initialFiles: [
      {
        name: "docker-compose.yml",
        content: `version: '3.8'\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "8080:80"\n  db:\n    image: postgres:latest\n    environment:\n      POSTGRES_PASSWORD: secret`
      }
    ],
    goals: [
      {
        id: "m6-g1",
        text: "Launch stack: docker compose up -d",
        hint: "docker compose up -d",
        isCompleted: false,
        validate: (state) => state.containers.some(c => c.name.startsWith('compose-'))
      }
    ],
    solutionCommands: ["docker compose up -d"],
    badgeName: "Compose Master"
  }
];
