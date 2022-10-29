<br><p align="center">
<img height="100px" src="./public/movies.webp" />
</p>

<h1 align="center">Movie Shelf</h1>
<p align="center">Personal movie management app</p>
<br>

> Forked from https://github.com/nuxt/movies  
> Movies app demo built using [Nuxt 3](https://github.com/nuxt/framework), [Vue 3](https://github.com/vuejs/core), [UnoCSS](https://github.com/unocss/unocss), [Image Module](https://v1.image.nuxtjs.org), [The Movie Database](https://www.themoviedb.org) [API](https://www.themoviedb.org/documentation/api) and [TypeScript](https://github.com/microsoft/TypeScript).

> All credits go to the folks originally developed the app (see [Credits](#Credits) bellow)  
> This is an adoption for personal use

## Added features
- <q>Watch</q> page containing Movies listed from a remote http folder
- Fetch movie details automatically based on file name 
- Prowlarr integration for searching content
- Docker image build script and saltbox-compatible docker-compose file

## Screenshots

<img width="1191" src="https://user-images.githubusercontent.com/11247099/171109597-ee4fb47c-48b5-4dba-94b3-a56e0083c142.png">
<img width="1191" src="https://user-images.githubusercontent.com/11247099/171109632-d9b480c4-e640-4812-8ea6-ccc6d17daa6a.png">
<img width="1191" src="https://user-images.githubusercontent.com/11247099/171109644-c586de96-04be-4ae7-8a7b-c0d615a2ecba.png">
<img width="764" src="https://user-images.githubusercontent.com/11247099/171109653-7137e2e5-ca06-4a30-9caa-bacdbc739121.png">

## Proxy Server

Check [proxy/README](./proxy)

## Worker Server

Check [worker/README](./worker)

## Setup

``` bash
# Enable pnpm
$ corepack enable

# Install dependencies
$ pnpm install

# Start dev server with hot reload at localhost:3000
$ pnpm dev
```

## Credits

Based on [nuxt/movies](https://github.com/nuxt/movies) which in turn is based on [jasonujmaalvis/vue-movies](https://github.com/jasonujmaalvis/vue-movies) and [tastejs/nuxt-movies](https://github.com/tastejs/nuxt-movies).

<img height="50px" src="./public/tmdb.svg">

Data provided by [The Movie Database](https://www.themoviedb.org).

This project uses the TMDB API but is not endorsed or certified by TMDB.
