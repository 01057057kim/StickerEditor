<script setup>
import { ref, inject } from "vue"

const images = inject('images')
const savedImages = inject('savedImages');
const emit = defineEmits(["selectImage"]);

const selectImage = (img) => {
    emit("selectImage", img);
};

</script>

<template>
    <div class="flex flex-col gap-5">
        <div class="bg-Surface h-[50vh] w-[22vw] relative rounded-bl-xl" ref="parentContainer">
            <label Class="text-Primary font-semibold flex justify-center mb-2 mt-2 text-xl">Gallery</label>
            <div class="max-h-[42vh] w-[22vw] overflow-y-auto grid grid-cols-2 gap-2 items-center justify-center p-5">
                <div v-for="(img, index) in images" :key="index" class="object-fill flex justify-center items-center"
                    @click="selectImage(img.src)">
                    <img class="min-w-[8vw]" :src="img.src" :alt="img.alt" />
                </div>
            </div>
        </div>
        <div class="bg-Surface h-[50vh] w-[22vw] relative rounded-tl-xl" ref="parentContainer">
            <label Class="text-Primary font-semibold flex justify-center mb-2 mt-2 text-xl">Saved image</label>
            <div class="max-h-[42vh] w-[22vw] overflow-y-auto grid grid-cols-2 gap-2 items-center justify-center p-5">
                <div v-for="(img, index) in savedImages" :key="index" class="object-fill flex justify-center items-center"
                    @click="selectImage(img)">
                    <img class="max-w-[8vw]" :src="img" alt="Saved Image" />
                </div>
            </div>
        </div>
    </div>
</template>