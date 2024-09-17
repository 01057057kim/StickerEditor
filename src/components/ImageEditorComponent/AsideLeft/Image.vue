<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits();

function clicked() {
    emit('close');
}
</script>

<template>
    <div class="relative flex">
        <div class="bg-Secondary h-screen w-[20vw]">
            Image
        </div>
        <div class="absolute top-3 right-0 bg-Background rounded-l-md hover:bg-Main">
            <button class="cursor-pointer p-1" @click="clicked">
                <svg class="icon-svg" width="3vw" height="5vh" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5" stroke="#1C274C" stroke-width="1.5"
                        stroke-linecap="round" />
                    <path
                        d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
                        stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.icon-svg {
    transition: stroke 0.3s ease;
}

button:hover .icon-svg path {
    stroke: #f25042;
}
</style>