import packageJson from '../../package.json';
import themes from '../../themes.json';
import { history } from '../stores/history';
import { theme } from '../stores/theme';
import events from './content/events.json';
import { get } from 'svelte/store';
import { currentPath } from './content/fileSystemStore';

const hostname = window.location.hostname;

const fileSystem = {
  events: events.events 
};

export const commands: Record<string, (args: string[]) => Promise<string> | string> = {
  help: () => {
    return `
Available commands:
1. help
   - Usage: help
   - Description: Displays this help message with a list of available commands.   
3. whoami
   - Usage: whoami
   - Description: Returns the current user identity (default is 'guest').
4. echo
   - Usage: echo [args]
   - Description: Echoes back the provided arguments as a string.
6. repo
   - Usage: repo
   - Description: Opens the repository URL in a new tab.
7. clear
    - Usage: clear
    - Description: Clears the command history.
8. email
    - Usage: email
    - Description: Opens the default email client to send an email to the author.
9. exit
    - Usage: exit
    - Description: Instructs the user to close the tab to exit.
10. banner
    - Usage: banner
    - Description: Displays a banner with application information and version.
11. events [event_id]
    - Usage:
      events         : Displays all events.
      events [id]    : Displays details of the event with the specified ID.
    - Description: Lists events or shows details of a specific event.
`;
  },
  hostname: () => hostname,
  whoami: () => 'guest',
  echo: (args: string[]) => args.join(' '),
  repo: () => {
    window.open(packageJson.repository.url, '_blank');

    return 'Opening repository...';
  },
  clear: () => {
    history.set([]);

    return '';
  },
  email: () => {
    window.open(`mailto:${packageJson.author.email}`);

    return `Opening mailto:${packageJson.author.email}...`;
  },
  exit: () => {
    return 'Please close the tab to exit.';
  },
  banner: () => `
  ██████╗ ██╗████████╗███████╗    ██╗     ██╗   ██╗ ██████╗ 
  ██╔══██╗██║╚══██╔══╝██╔════╝    ██║     ██║   ██║██╔════╝ 
  ██████╔╝██║   ██║   ███████╗    ██║     ██║   ██║██║  ███╗
  ██╔══██╗██║   ██║   ╚════██║    ██║     ██║   ██║██║   ██║
  ██████╔╝██║   ██║   ███████║    ███████╗╚██████╔╝╚██████╔╝
  ╚═════╝ ╚═╝   ╚═╝   ╚══════╝    ╚══════╝ ╚═════╝  ╚═════╝ 

Type 'help' to see list of available commands.
`,
ls: (args: string[]) => {
  let current: any = fileSystem;
  for (const segment of get(currentPath).slice(1)) {
    current = current[segment];
    if (!current) break;
  }

  if (get(currentPath).length === 1) {
    return 'events';
  } else if (Array.isArray(current)) {
    return current.map(event => `${event.title.replace(/\s+/g, '_')}.txt`).join('\n');
  } else if (current) {
    return Object.keys(current).join('\n');
  } else {
    return 'No such directory';
  }
},

cd: (args: string[]) => {
  if (args.length === 0 || args[0] === '~') {
    currentPath.set(['~']);
    return '';
  }

  const dir = args[0];
  const path = get(currentPath);
  if (dir === '..') {
    if (path.length > 1) {
      currentPath.update(p => p.slice(0, -1));
    }
  } else {
    let current: any = fileSystem;
    for (const segment of path.slice(1)) {
      current = current[segment];
      if (!current) break;
    }
    if (current && (current[dir] || (dir === 'events' && path.length === 1))) {
      currentPath.update(p => [...p, dir]);
    } else {
      return `cd: ${dir}: No such file or directory`;
    }
  }

  return '';
},

pwd: () => {
  return get(currentPath).join('/');
},

cat: (args: string[]) => {
  if (args.length === 0) return 'Usage: cat <filename>';

  const filename = args[0];
  let current: any = fileSystem;
  for (const segment of get(currentPath).slice(1)) {
    current = current[segment];
    if (!current) break;
  }

  if (Array.isArray(current)) {
    const event = current.find(e => `${e.title.replace(/\s+/g, '_')}.txt` === filename);
    if (event) {
      return `ID: ${event.id}\nTitle: ${event.title}\nDate: ${event.date}\nDescription: ${event.description}`;
    }
  }

  return `cat: ${filename}: No such file or directory`;
}
};