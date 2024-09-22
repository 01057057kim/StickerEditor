<script setup>
import { ref, provide } from 'vue';
import AsideLeft from './ImageEditorComponent/AsideLeft.vue';
import AsideRight from './ImageEditorComponent/AsideRight.vue';
import Editor from './ImageEditorComponent/Editor.vue';
import AsideNav from './ImageEditorComponent/AsideNav.vue';

import addon1 from "../assets/Images/gallery/out12.jpg"
import addon2 from "../assets/Images/gallery/out3.png"
import addon4 from "../assets/Images/gallery/out4.png"
import addon3 from "../assets/Images/gallery/out5.png"
import addon5 from "../assets/Images/gallery/out6.png"
import addon6 from "../assets/Images/gallery/out7.png"
import addon7 from "../assets/Images/gallery/out8.png"
import addon8 from "../assets/Images/gallery/out9.png"
import addon9 from "../assets/Images/gallery/out10.png"
import addon10 from "../assets/Images/gallery/out11.jpg"

let images = ref([
    { src: addon1, alt: 'add on 1' },
    { src: addon2, alt: 'add on 2' },
    { src: addon3, alt: 'add on 3' },
    { src: addon4, alt: 'add on 4' },
    { src: addon5, alt: 'add on 5' },
    { src: addon6, alt: 'add on 6' },
    { src: addon7, alt: 'add on 7' },
    { src: addon8, alt: 'add on 8' },
    { src: addon9, alt: 'add on 9' },
    { src: addon10, alt: 'add on 10' },

])
let typeButton = ref(false);
let selectedImage = ref(null);
const savedImages = ref([]);
const editorRef = ref(null);

const handleNewImage = (newImage) => {
    images.value.unshift({ src: newImage, alt: 'New Image' });
};

const handleStickerSelected = (stickerSrc) => {
    if (editorRef.value) {
        editorRef.value.addSticker(stickerSrc);
    }
};

provide('handleStickerSelected', handleStickerSelected);

provide('images', images)
provide('selectedImage', selectedImage);
provide('typeButton', typeButton);
provide('savedImages', savedImages);
</script>

<template>
    <section class="bg-Background h-screen ">
        <aside class="">
            <AsideNav />
            <!--<AsideLeft />-->
        </aside>
        <main class="row-span-1 flex items-center justify-center min-h-screen absolute left-1/4 right-1/4">
            <Editor ref="editorRef" :selected-image="selectedImage" @newImage="handleNewImage" />
        </main>
        <aside class="row-span-1 h-screen flex justify-end absolute right-0 ">
            <AsideRight @select-image="selectedImage = $event" />
        </aside>
    </section>
</template>