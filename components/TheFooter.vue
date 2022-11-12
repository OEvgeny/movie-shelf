<template>
  <footer p="y15 x15" flex="~ col gap4">
    <div flex="~ row gap2" items-center my2>
      <img src="/movies-sm.webp" width="25" height="25" alt="Logo">
      <div text-xl>
        Movie Shelf
      </div>
    </div>
    <div flex="~ row gap2" items-center>
      <p text-true-gray:90 text-sm>
        Data provided by&nbsp;
        <a op100 target="_blank" href="https://www.themoviedb.org/" title="The Movie Database" rel="noopener" n-link-text>
          <IconTMDB class="tmdb-icon" inline h4 />
        </a>
      </p>
    </div>
    <div flex="~ row gap2" items-center>
      <p text-true-gray:90 text-sm>
        This project uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </div>
    <div>
      <ExternalLinks
        :links="{
          github_id: 'OEvgeny/movie-shelf',
        }"
      />
    </div>
  </footer>
</template>

<style scoped>

.tmdb-icon {
  filter: saturate(0) brightness(0.75);
}

.tmdb-icon:hover {
  filter: sepia(1) hue-rotate(292deg) brightness(0.51) saturate(3.5) contrast(2);
}

</style>