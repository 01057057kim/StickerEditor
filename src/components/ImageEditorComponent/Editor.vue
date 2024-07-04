<script setup>
import { ref, onMounted, inject, watch, nextTick } from 'vue';
import * as markerjs2 from 'markerjs2';
import Moveable from "vue3-moveable";
import imagetest from '../../assets/Images/testimg.jpg'

let imgRef = ref(null);
let downloadButton = ref(null);
let originalImageSrc = null;
const selectedImage = inject('selectedImage');
const savedImages = inject('savedImages');
const images = inject('images');
const stickers = ref([]);
const selectedSticker = ref(null);
const MIN_SIZE = 40;
const SCALE_FACTOR = 0.7;

const addSticker = (stickerSrc) => {
    const newSticker = {
        id: Date.now(),
        src: stickerSrc,
        style: {
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotate(0deg)',
            width: '70px',
            height: '70px',
        }
    };
    stickers.value.push(newSticker);
    nextTick(() => {
        selectedSticker.value = newSticker.id;
    });
};

const onDrag = ({ target, clientX, clientY }) => {
    const sticker = stickers.value.find(s => s.id === parseInt(target.dataset.id));
    if (sticker && imgRef.value) {
        const imgRect = imgRef.value.getBoundingClientRect();
        const stickerRect = target.getBoundingClientRect();

        // Calculate the sticker's center position
        let x = clientX - imgRect.left;
        let y = clientY - imgRect.top;

        // Calculate the sticker's half width and height
        const stickerHalfWidth = stickerRect.width / 2;
        const stickerHalfHeight = stickerRect.height / 2;

        // Constrain the position within the image boundaries
        x = Math.max(stickerHalfWidth, Math.min(x, imgRect.width - stickerHalfWidth));
        y = Math.max(stickerHalfHeight, Math.min(y, imgRect.height - stickerHalfHeight));

        // Convert to percentage relative to the image size
        const xPercent = (x / imgRect.width) * 100;
        const yPercent = (y / imgRect.height) * 100;

        sticker.style.left = `${xPercent}%`;
        sticker.style.top = `${yPercent}%`;
        sticker.style.transform = `translate(-50%, -50%) ${sticker.style.transform.split(') ')[1] || ''}`;
    }
};

const calculateNewSize = (currentSize, newSize) => {
    const sizeDiff = newSize - currentSize;
    const scaledDiff = sizeDiff * SCALE_FACTOR;
    return Math.max(currentSize + scaledDiff, MIN_SIZE);
};

const onResize = ({ target, width, height }) => {
    const sticker = stickers.value.find(s => s.id === parseInt(target.dataset.id));
    if (sticker) {
        const currentWidth = parseFloat(sticker.style.width);
        const currentHeight = parseFloat(sticker.style.height);

        const newWidth = calculateNewSize(currentWidth, width);
        const newHeight = calculateNewSize(currentHeight, height);

        sticker.style.width = `${newWidth}px`;
        sticker.style.height = `${newHeight}px`;
    }
};

const onRotate = ({ target, rotate }) => {
    const sticker = stickers.value.find(s => s.id === parseInt(target.dataset.id));
    if (sticker) {
        const currentTransform = sticker.style.transform;
        const translatePart = currentTransform.split(') ')[0] + ')';
        sticker.style.transform = `${translatePart} rotate(${rotate}deg)`;
    }
};
const deleteSticker = (id) => {
    stickers.value = stickers.value.filter(sticker => sticker.id !== id);
    if (selectedSticker.value === id) {
        selectedSticker.value = null;
    }
};

const clearStickers = () => {
    stickers.value = [];
    selectedSticker.value = null;
};

const selectSticker = (id) => {
    selectedSticker.value = id;
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

            if (stickers.value.length === 0) {
                const mergedImageSrc = canvas.toDataURL('image/png');
                clearStickers();
                resolve(mergedImageSrc);
            } else {
                const imgRect = imgRef.value.getBoundingClientRect();
                const scaleX = mainImg.width / imgRect.width;
                const scaleY = mainImg.height / imgRect.height;

                stickers.value.forEach(sticker => {
                    const stickerImg = new Image();
                    stickerImg.src = sticker.src;

                    stickerImg.onload = () => {
                        const left = parseFloat(sticker.style.left) / 100 * imgRect.width;
                        const top = parseFloat(sticker.style.top) / 100 * imgRect.height;
                        const width = parseFloat(sticker.style.width);
                        const height = parseFloat(sticker.style.height);

                        // Scale positions and dimensions to match the original image size
                        const scaledLeft = left * scaleX;
                        const scaledTop = top * scaleY;
                        const scaledWidth = width * scaleX;
                        const scaledHeight = height * scaleY;

                        // Extract rotation angle
                        const rotation = parseFloat(sticker.style.transform.match(/rotate\(([-\d.]+)deg\)/)?.[1] || 0);

                        ctx.save();
                        ctx.translate(scaledLeft, scaledTop);
                        ctx.rotate(rotation * Math.PI / 180);
                        ctx.drawImage(stickerImg, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);
                        ctx.restore();

                        loadedStickers++;
                        if (loadedStickers === stickers.value.length) {
                            const mergedImageSrc = canvas.toDataURL('image/png');
                            clearStickers();
                            resolve(mergedImageSrc);
                        }
                    };

                    stickerImg.onerror = reject;
                });
            }
        };

        mainImg.onerror = reject;
    });
};

const showMarkerArea = async () => {
    try {
        const mergedImageSrc = await mergeImages();
        console.log("Merge successful");
        clearStickers();
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
            <div v-for="sticker in stickers" :key="sticker.id" :style="{
                position: 'absolute',
                left: sticker.style.left,
                top: sticker.style.top,
                transform: sticker.style.transform,
                width: sticker.style.width,
                height: sticker.style.height
            }" :data-id="sticker.id" class="sticker" @mousedown="selectSticker(sticker.id)">
                <img :src="sticker.src" style="width: 100%; height: 100%; object-fit: contain;" />
                <button @click="deleteSticker(sticker.id)" class="delete-btn">X</button>
            </div>
            <Moveable v-if="selectedSticker" class="moveable" :target="`.sticker[data-id='${selectedSticker}']`"
                :draggable="true" :resizable="true" :rotatable="true" :origin="false" :keepRatio="false" @drag="onDrag"
                @resize="onResize" @rotate="onRotate" />
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

.delete-btn {
    position: absolute;
    top: -30px;
    right: -20px;
    background: red;
    color: white;
    border: none;
    border-radius: 50%;
    width: 25px;
    height: 25px;
    font-size: 12px;
    cursor: pointer;
}
</style>