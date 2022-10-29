# Movie Shelf Worker

Worker hosts a lightweight server for interracting with Apache http folder server:

- Scraps movie information based on the files located in the folder
- Monitors changes when clients connected and updates movie list

## Setup

1. Take a copy of `.env.example` and re-name to `.env`
2. Fill-in the <q>Movie Shelf Proxy</q> URL and the remote file storage URL
3. Enter the details into the `.env` file
4. Start the dev server with the following scripts

``` bash
# Enable pnpm
$ corepack enable

# Install dependencies
$ pnpm install

# Start dev server with hot reload at localhost:3002
$ pnpm dev
```
