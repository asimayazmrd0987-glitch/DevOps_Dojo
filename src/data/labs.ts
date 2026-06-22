import { Lab } from '../types';

export const LABS: Lab[] = [
  {
    id: 'linux-basics',
    title: 'Linux Command Line Foundations',
    description: 'Master the core command-line operations: navigation, viewing streams, directory design, and file manipulation. Essential for high-performance terminal operations.',
    category: 'linux',
    difficulty: 'Beginner',
    timeMinutes: 15,
    points: 100,
    startingFiles: {
      'README.md': {
        name: 'README.md',
        isDir: false,
        content: '# Linux Lab Workspace\nFollow the instuctions on the left panel to complete your tasks. Use commands like "ls", "cat", "mkdir", "cd", and "echo".'
      },
      '.welcome.txt': {
        name: '.welcome.txt',
        isDir: false,
        content: 'Congratulations! You found the hidden welcome file! Use: echo "SECRET-1337" > token.txt'
      },
      'system_logs': {
        name: 'system_logs',
        isDir: true,
        children: {
          'server.log': {
            name: 'server.log',
            isDir: false,
            content: 'INFO 2026-06-22 Server initialized.\nERROR 2026-06-22 Port 8080 busy.\nWARN 2026-06-22 Memory limit high.'
          }
        }
      }
    },
    steps: [
      {
        id: 'linux-1',
        number: 1,
        title: 'Discover the Workspace',
        instructions: 'List the contents of the current folder to inspect what files are present. Use `ls` to view files and `cat README.md` to read the README description.',
        objective: 'Execute `ls` and `cat README.md`.',
        hint: 'Type "ls" to list files, and "cat README.md" to see the file contents in your terminal window.'
      },
      {
        id: 'linux-2',
        number: 2,
        title: 'Create an App folder',
        instructions: 'Design your directory layout. Create a new directory named `express-app` using the `mkdir` command, then change your directory to it (`cd express-app`).',
        objective: 'Create a directory named `express-app` and navigate into it.',
        hint: 'Run "mkdir express-app" followed by "cd express-app". Check your prompt to see the updated path.'
      },
      {
        id: 'linux-3',
        number: 3,
        title: 'Write Environment Config',
        instructions: 'Now, create a custom environment config setup. Write a configuration file named `config.env` inside the `express-app` folder containing the content `PORT=3000`.',
        objective: 'Create the file `config.env` containing "PORT=3000".',
        hint: 'Use the command: echo "PORT=3000" > config.env'
      }
    ]
  },
  {
    id: 'docker-basics',
    title: 'Containerization with Dockerfile',
    description: 'Learn to write, compile, and run container images. Package a static application, run it in detached mode, and verify container run states using Docker CLI commands.',
    category: 'docker',
    difficulty: 'Beginner',
    timeMinutes: 20,
    points: 150,
    startingFiles: {
      'package.json': {
        name: 'package.json',
        isDir: false,
        content: `{\n  "name": "micro-service",\n  "version": "1.0.0",\n  "main": "server.js",\n  "scripts": {\n    "start": "node server.js"\n  },\n  "dependencies": {}\n}`
      },
      'server.js': {
        name: 'server.js',
        isDir: false,
        content: `const http = require('http');\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, {'Content-Type': 'text/plain'});\n  res.end('Dockerised Applet Live\\n');\n});\nserver.listen(3000, '0.0.0.0', () => console.log('Listening on port 3000'));`
      }
    },
    steps: [
      {
        id: 'docker-1',
        number: 1,
        title: 'Draft a Dockerfile',
        instructions: 'Create a `Dockerfile` in the root of the workspace. Its content should start with `FROM node:18-alpine`, set `WORKDIR /app`, copy everything (`COPY . .`), and load using `CMD ["node", "server.js"]`.',
        objective: 'Create a `Dockerfile` specifying FROM node:18-alpine, WORKDIR /app, COPY . ., and CMD ["node", "server.js"].',
        hint: 'You can write files using "echo" with redirection or using the terminal editor: echo "FROM node:18-alpine\\nWORKDIR /app\\nCOPY . .\\nCMD [\\"node\\", \\"server.js\\"]" > Dockerfile'
      },
      {
        id: 'docker-2',
        number: 2,
        title: 'Compile the Docker Image',
        instructions: 'Build your Docker image locally under the repository tag `node-service:v1.0`. Verify the build successfully updates the image cache.',
        objective: 'Run the command "docker build -t node-service:v1.0 .".',
        hint: 'Build the container metadata using: "docker build -t node-service:v1.0 ."'
      },
      {
        id: 'docker-3',
        number: 3,
        title: 'Launch detached container',
        instructions: 'Spawn an active instance of the container inside the Docker subsystem. Execute the run command, binding host port `8080` to backend container port `3000`, named as `webapp`.',
        objective: 'Run your container detached with name "webapp" mapped to port 8080:3000.',
        hint: 'Launch with: docker run -d -p 8080:3000 --name webapp node-service:v1.0'
      }
    ]
  },
  {
    id: 'kubernetes-deploy',
    title: 'Deployments in Kubernetes Clusters',
    description: 'Familiarise yourself with container orchestration. Declare Pod definitions using YAML format, launch workload configurations, and monitor pods in real-time.',
    category: 'kubernetes',
    difficulty: 'Intermediate',
    timeMinutes: 25,
    points: 200,
    startingFiles: {},
    steps: [
      {
        id: 'k8s-1',
        number: 1,
        title: 'Write a Pod Manifest',
        instructions: 'Create a Kubernetes configuration file named `nginx-pod.yaml`. It must describe a Pod with `apiVersion: v1`, `kind: Pod`, metadata name `web-server`, and container spec containing name `nginx` and image `nginx:alpine`.',
        objective: 'Write an active "nginx-pod.yaml" configuration containing apiVersion v1, web-server name and nginx:alpine image.',
        hint: 'Write to the file: echo "apiVersion: v1\\nkind: Pod\\nmetadata:\\n  name: web-server\\nspec:\\n  containers:\\n  - name: nginx\\n    image: nginx:alpine" > nginx-pod.yaml'
      },
      {
        id: 'k8s-2',
        number: 2,
        title: 'Apply the resources to k8s Cluster',
        instructions: 'Deploy the pod configuration using the Kubernetes manifest cli `kubectl`. Send the descriptor file upstream to compile container states.',
        objective: 'Run "kubectl apply -f nginx-pod.yaml".',
        hint: 'Use the standard instruction command: "kubectl apply -f nginx-pod.yaml".'
      },
      {
        id: 'k8s-3',
        number: 3,
        title: 'Verify Cluster Pods',
        instructions: 'Check the microenvironment to make sure the web-server pod is created and running. Print the namespaces and resources to satisfy cluster policies.',
        objective: 'Execute the command "kubectl get pods".',
        hint: 'Run "kubectl get pods" to list the active pods in the namespace.'
      }
    ]
  },
  {
    id: 'cicd-pipelines',
    title: 'CI/CD Pipelines with GitHub Actions',
    description: 'Deploy workloads automatically with declaration-based task plans. Author build checks, declare trigger operations (push events), and trigger remote pipelines.',
    category: 'cicd',
    difficulty: 'Advanced',
    timeMinutes: 30,
    points: 250,
    startingFiles: {
      'src': {
        name: 'src',
        isDir: true,
        children: {
          'index.js': {
            name: 'index.js',
            isDir: false,
            content: 'console.log("App running smoothly!");'
          }
        }
      }
    },
    steps: [
      {
        id: 'cicd-1',
        number: 1,
        title: 'Structure the Repository Configuration',
        instructions: 'Create the directory hierarchical pipeline folder `.github/workflows` to register action behaviors.',
        objective: 'Create the folder nested structure ".github/workflows".',
        hint: 'Run "mkdir -p .github/workflows" to establish the repository directory config.'
      },
      {
        id: 'cicd-2',
        number: 2,
        title: 'Create GitHub Workflow Spec',
        instructions: 'Create the automation manifest file `.github/workflows/deploy.yml`. Configure a name of `DevOps CI`, triggering on `on: [push]`, with a job `build` running on `ubuntu-latest` featuring a step to test the code.',
        objective: 'Create ".github/workflows/deploy.yml" specifying name DevOps CI with step configuration.',
        hint: 'Write to the file using echo redirection: echo "name: DevOps CI\\non: [push]\\njobs:\\n  build:\\n    runs-on: ubuntu-latest\\n    steps:\\n    - uses: actions/checkout@v3" > .github/workflows/deploy.yml'
      },
      {
        id: 'cicd-3',
        number: 3,
        title: 'Commit and Push to Launch Pipeline',
        instructions: 'Initialize or simulate the version control. Run the command `git commit -am "Pipeline added" && git push` to trigger the CI engine.',
        objective: 'Execute git simulation trigger command.',
        hint: 'Enter "git add .", then "git commit -m \"Pipeline update\"", and finally "git push origin main".'
      }
    ]
  }
];
