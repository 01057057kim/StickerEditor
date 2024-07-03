<script setup>
import { ref, onMounted, inject, watch, nextTick } from 'vue';
import * as markerjs2 from 'markerjs2';
import imagetest from '../../assets/Images/testimg.jpg'

let imgRef = ref(null);
let downloadButton = ref(null);
let originalImageSrc = null;
const selectedImage = inject('selectedImage');
const savedImages = inject('savedImages');
const images = inject('images');
const stickers = ref([]);

const addSticker = (stickerSrc) => {
    stickers.value.push({
        src: stickerSrc,
        style: {
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70%',
            cursor: 'move'
        }
    });
};

const mergeImages = () => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const mainImg = new Image();
        mainImg.src = imgRef.value.src;

        mainImg.onload = () => {
            canvas.width = mainImg.width;
            canvas.height = mainImg.height;
            ctx.drawImage(mainImg, 0, 0);

            let loadedStickers = 0;

            stickers.value.forEach(sticker => {
                const stickerImg = new Image();
                stickerImg.src = sticker.src;

                stickerImg.onload = () => {
                    const scaleX = mainImg.width / imgRef.value.clientWidth;
                    const scaleY = mainImg.height / imgRef.value.clientHeight;

                    const left = parseFloat(sticker.style.left) * scaleX;
                    const top = parseFloat(sticker.style.top) * scaleY;
                    const width = parseFloat(sticker.style.width) * scaleX;

                    ctx.drawImage(stickerImg, left, top, width, width);
                    loadedStickers++;
                    if (loadedStickers === stickers.value.length) {
                        const mergedImageSrc = canvas.toDataURL('image/png');
                        resolve(mergedImageSrc);
                    }
                };

                stickerImg.onerror = reject;
            });

            if (stickers.value.length === 0) {
                const mergedImageSrc = canvas.toDataURL('image/png');
                resolve(mergedImageSrc);
            }
        };

        mainImg.onerror = reject;
    });
};

const showMarkerArea = async () => {
    try {
        const mergedImageSrc = await mergeImages();
        console.log("Merge successful");

        const markerArea = new markerjs2.MarkerArea(imgRef.value);
        markerArea.availableMarkerTypes = markerArea.ALL_MARKER_TYPES;
        markerArea.uiStyleSettings.redoButtonVisible = true;
        markerArea.uiStyleSettings.zoomButtonVisible = true;
        markerArea.uiStyleSettings.zoomOutButtonVisible = true;
        markerArea.uiStyleSettings.clearButtonVisible = true;
        markerArea.settings.displayMode = 'popup';
        markerArea.settings.defaultColor = ['#000000']

        // Add custom fonts
        markerArea.settings.defaultFontFamilies = ['Poetsen One', 'Indie Flower', 'Dela Gothic One', 'DynaPuff', 'Pixelify Sans', 'Gluten', 'Teko'];

        markerArea.addRenderEventListener((dataUrl) => {
            savedImages.value.push(dataUrl);
            imgRef.value.src = dataUrl;
            downloadButton.value.href = dataUrl;
        });

        imgRef.value.src = mergedImageSrc;
        downloadButton.value.href = mergedImageSrc;
        markerArea.show();
    } catch (error) {
        console.error("Merge failed", error);
    }
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        originalImageSrc = reader.result;
        imgRef.value.src = originalImageSrc;
        downloadButton.value.href = originalImageSrc;
        images.value.push({ src: originalImageSrc, alt: file.name });
        emit('newImage', originalImageSrc);
    };

    if (file) {
        reader.readAsDataURL(file);
    }
};

onMounted(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imagetest;
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        originalImageSrc = canvas.toDataURL('image/png');
        downloadButton.value.href = originalImageSrc;
    };
});
watch(selectedImage, (newValue) => {
    if (newValue) {
        imgRef.value.src = newValue;
        downloadButton.value.href = newValue;
    }
});
defineExpose({ addSticker });
</script>

<template>
    <div class="flex flex-col">
        <div class="bg-Surface w-[52vw] h-auto flex items-center justify-center rounded-xl p-10 relative">
            <img class="w-auto max-w-[48vw] h-auto min-h-[60vh] max-h-[75vh] object-fill rounded-xl" ref="imgRef"
                :src="selectedImage || imagetest" alt="Test img" />
            <img v-for="(sticker, index) in stickers" :key="index" :src="sticker.src" :style="sticker.style"
                @mousedown="startDrag($event, index)" @touchstart="startDrag($event, index)" />
        </div>
        <div class="mt-5 flex items-center justify-center gap-5">
            <label for="file-upload"
                class="bg-Secondary rounded-2xl w-[6vw] h-[6vh] content-center text-center hover:cursor-pointer">Import</label>
            <input id="file-upload" type="file" @change="handleFileUpload" accept="image/*" class="hidden" />
            <button class="bg-Secondary rounded-2xl w-[6vw] h-[6vh]" @click="showMarkerArea">Edit</button>
            <a class="bg-Secondary rounded-2xl w-[6vw] h-[6vh] flex items-center justify-center" ref="downloadButton"
                :href="originalImageSrc" download="image.png">Download</a>
        </div>
    </div>
</template>


<style scoped>
.sticker {
    position: absolute;
    cursor: move;
}
</style>
