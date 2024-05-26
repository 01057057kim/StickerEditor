<script setup>
import ImageEditor from './components/ImageEditor.vue';
import Generate from './components/Generate.vue';
</script>

<template>
  <main class="m-0 p-0 box-border min-w-[1440px] min-h-screen overflow-hidden mx-auto ">
    <ImageEditor />
  </main>
  <Generate class="hidden" />
</template>

