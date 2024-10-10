<script setup>
import { ref, provide } from 'vue';
import Editor from './ImageEditorComponent/Editor.vue';
import AsideNav from './ImageEditorComponent/AsideNav.vue';

function getImageUrl(name) {
    const images = import.meta.glob('../assets/Images/gallery/*.{png,jpg,jpeg}', { eager: true });
    return images[`../assets/Images/gallery/${name}`]?.default;
}

const imageNames = [
    '1.jpg', '2.png', '3.jpg', '4.png', '5.png',
    '6.png', '7.png', '8.png', '9.png', '10.png'
];

let images = ref(imageNames.map((name, index) => ({
    src: getImageUrl(name),
    alt: `Images ${index + 1}`
})));

let typeButton = ref(false);
let selectedImage = ref(null);
const savedImages = ref([]);
const editorRef = ref(null);
const isAsidePopupOpen = ref(false);
const asidePopupWidth = ref(0);



const handleImageSelected = (newImage) => {
    if (editorRef.value) {
        editorRef.value.clearStickers();
        selectedImage.value = newImage;
    }
};

const handleNewImage = (newImage) => {
    images.value.unshift({ src: newImage, alt: 'New Image' });
};

const handleStickerSelected = (stickerSrc) => {
    if (editorRef.value) {
        editorRef.value.addSticker(stickerSrc);
    }
};

const handleAsidePopupToggle = (isOpen, width) => {
    isAsidePopupOpen.value = isOpen;
    asidePopupWidth.value = width;
};

provide('handleImageSelected', handleImageSelected);
provide('handleAsidePopupToggle', handleAsidePopupToggle);
provide('handleStickerSelected', handleStickerSelected);
provide('images', images);
provide('selectedImage', selectedImage);
provide('typeButton', typeButton);
provide('savedImages', savedImages);
</script>

<template>
    <div class="flex bg-Background min-h-screen ">
        <aside class="w-[5vw] flex-shrink-0 z-10">
            <AsideNav @popup-toggled="handleAsidePopupToggle" />
        </aside>
        <main class="flex-grow flex justify-center items-center transition-all duration-300 ease-in-out"
            :style="{ marginLeft: isAsidePopupOpen ? `${asidePopupWidth}px` : '0' }">
            <section class="w-full max-w-4xl flex justify-center items-center">
                <Editor ref="editorRef" :selected-image="selectedImage" @newImage="handleNewImage" />
            </section>
        </main>
    </div>
</template>

<style>
/* Global css */
* {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

*:focus {
    outline: none !important;
}

img {
    -webkit-user-drag: none;
}
</style>

// improve ui the editor button and responsive (mobile 390x844 desktop 1440x900)
// color asideNav 
// info use driver.js