<template>
  <div class="loader"></div>
</template>

<style scoped>

.loader {
  --at-apply: color-primary;
  width: 80px;
  aspect-ratio: 1;
  background: radial-gradient(50.8% 50.8% at 50% 54%, transparent 100%, currentColor);
  border-radius: 50%;
  animation: rotate .7s linear infinite;
  transform-origin: 50% 52%;
}

@keyframes rotate {
  to {
    transform: rotate(1turn);
  }
}

</style>