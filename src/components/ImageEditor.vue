<script setup>
import { ref, provide, onMounted } from 'vue';
import Editor from './ImageEditorComponent/Editor.vue';
import AsideNav from './ImageEditorComponent/AsideNav.vue';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

function getImageUrl(name) {
    const images = import.meta.glob('../assets/Images/gallery/*.{png,png,jpeg}', { eager: true });
    return images[`../assets/Images/gallery/${name}`]?.default;
}

const imageNames = [
    '1.png', '2.png', '3.png', '4.png', '5.png',
    '6.png', '7.png', '8.png', '9.png', '10.png',
    '11.png','12.png'
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
const firstVisit = ref(false);



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

const handleDriverTour = () => {
    const driverObj = driver({
        showProgress: true,
        allowClose: false,
        showButtons: ['next', 'previous', 'close'],
        steps: [
            {
                popover: {
                    title: 'Welcome to the Image Editing!',
                    description: 'Welcome! This website is an image editor that lets you enhance your photos with a variety of creative tools. You can add stickers, insert text, draw on the image, and much more. Let’s take a quick tour to show you all the exciting features!'
                }
            },
            {
                element: '.image-editor',
                popover: {
                    title: 'Image Editing',
                    description: 'This is the main image editing area. You can edit and manipulate the selected image here.', side: "top", align: 'center'
                }
            },
            {
                element: '.aside-nav',
                popover: {
                    title: 'Navigation',
                    description: 'This is the aside navigation panel. You can access various features and tools from here.'
                }
            },
            {
                element: '.sticker-button',
                popover: {
                    title: 'Sticker Tool',
                    description: 'Click this button to open the sticker library and add stickers to your image.'
                }
            },
            {
                element: '.image-button',
                popover: {
                    title: 'Image Library',
                    description: 'Click this button to open the image library and select a new image to edit.'
                }
            },
            {
                element: '.saved-button',
                popover: {
                    title: 'Saved Images',
                    description: 'Click this button to view and manage your saved images.'
                }
            },
            {
                element: '.info-button',
                popover: {
                    title: 'Information',
                    description: 'Click this button to learn more about the app and its features.'
                }
            },
            {
                element: '.edit-button',
                popover: {
                    title: 'Edit Image',
                    description: 'Click this button to access advanced editing features like adding text, drawing, and more.'
                }
            },
            {
                element: '.Save-button',
                popover: {
                    title: 'Save Image',
                    description: 'Click this button to save the edited image from the canvas.'
                }
            },
            {
                element: '.download-button',
                popover: {
                    title: 'Download Image',
                    description: 'Click this button to download the edited image from the canvas.'
                }
            },

        ]
    });
    driverObj.drive();
};

onMounted(() => {
    if (!localStorage.getItem('visitedBefore')) {
        firstVisit.value = true;
        localStorage.setItem('visitedBefore', 'true');
        handleDriverTour();
    }
});

provide('handleImageSelected', handleImageSelected);
provide('handleAsidePopupToggle', handleAsidePopupToggle);
provide('handleStickerSelected', handleStickerSelected);
provide('images', images);
provide('selectedImage', selectedImage);
provide('typeButton', typeButton);
provide('savedImages', savedImages);
provide('handleDriverTour', handleDriverTour);
</script>

<template>
    <div class="flex bg-Background min-h-screen body">
        <aside class="w-[5vw] flex-shrink-0 z-10 aside-nav">
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

//responsive