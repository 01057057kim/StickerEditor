<script setup>
import { ref, defineProps, defineEmits, inject, computed } from 'vue';
import { deleteImageFromDB, getAllImages, clearDB } from '../../db';
import JSZip from 'jszip';

const emit = defineEmits(['close', 'selectImage', 'deleteImage']);
const isClosing = ref(false);
const savedImages = inject('savedImages');
const isDownloading = ref(false);
const selectedImages = ref(new Set());
const isSelectionMode = ref(false);
const errorMessage = ref('');
const showError = ref(false);

const hasSavedImages = computed(() => savedImages.value.length > 0);
const hasSelectedImages = computed(() => selectedImages.value.size > 0);

const props = defineProps({
    showCloseButton: {
        type: Boolean,
        default: true
    }
});

function clicked() {
    isClosing.value = true;
    setTimeout(() => {
        emit('close');
    }, 200);
}

const toggleSelectionMode = () => {
    isSelectionMode.value = !isSelectionMode.value;
    if (!isSelectionMode.value) {
        selectedImages.value.clear();
    }
};

const handleImageClick = (img) => {
    if (isSelectionMode.value) {
        toggleImageSelection(img);
    } else {
        emit('selectImage', img.src);
    }
};

const toggleImageSelection = (img) => {
    if (selectedImages.value.has(img.id)) {
        selectedImages.value.delete(img.id);
    } else {
        selectedImages.value.add(img.id);
    }
};

const showErrorMessage = (message) => {
    errorMessage.value = message;
    showError.value = true;
    setTimeout(() => {
        showError.value = false;
        errorMessage.value = '';
    }, 3000);
};

const deleteImage = async (id) => {
    try {
        await deleteImageFromDB(id);
        selectedImages.value.delete(id);
        const images = await getAllImages();
        savedImages.value = images;
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};

const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

const downloadImages = async () => {
    if (isDownloading.value) return;
    if (!hasSavedImages.value) {
        showErrorMessage('No images available to download');
        return;
    }
    if (isSelectionMode.value && !hasSelectedImages.value) {
        showErrorMessage('Please select at least one image before downloading');
        return;
    }

    try {
        isDownloading.value = true;
        const zip = new JSZip();

        const imagesToDownload = isSelectionMode.value
            ? savedImages.value.filter(img => selectedImages.value.has(img.id))
            : savedImages.value;

        imagesToDownload.forEach((img, index) => {
            const blob = dataURLtoBlob(img.src);
            const extension = blob.type.split('/')[1];
            zip.file(`image-${index + 1}.${extension}`, blob);
        });

        const content = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 9
            }
        });

        const downloadUrl = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${isSelectionMode.value ? 'selected' : 'all'}-images-${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Error creating zip file:', error);
        showErrorMessage('Failed to create zip file. Please try again.');
    } finally {
        isDownloading.value = false;
    }
};

const clearAllImages = async () => {
    await clearDB();
    savedImages.value = [];
};
</script>

<template>
    <div class="relative flex">
        <div :class="[
            'transition-all duration-300 ease-in-out',
            'mx-auto overflow-y-auto',
            isClosing ? 'w-0' : 'w-[20vw]',
            props.showCloseButton ?
                'bg-Secondary h-screen' :
                'bg-Background my-4 rounded-xl shadow-[0_-1px_40px_-15px] shadow-slate-800/50 h-[95vh]'
        ]">
            <div class="p-[1.5vh] space-y-[1vh] relative ">
                <div class="flex flex-col gap-2 mt-2">
                    <div class="flex items-center justify-between">
                        <h2 class="text-[2.5vh] font-semibold text-gray-800 font-SourGummy">SAVED IMAGES</h2>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-start">
                            <button @click="toggleSelectionMode"
                                class="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-300 text-sm"
                                :class="{ 'bg-blue-500 hover:bg-blue-600': isSelectionMode }">
                                {{ isSelectionMode ? 'Cancel Selection' : 'Select Multiple' }}
                            </button>
                            <button @click="downloadImages" :disabled="isDownloading"
                                class="px-3 py-1 text-white rounded-md transition-colors duration-300 flex items-center space-x-1 text-sm"
                                :class="{
                                    'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300': !isSelectionMode,
                                    'bg-green-500 hover:bg-green-600 disabled:bg-green-300': isSelectionMode
                                }">
                                <span v-if="isDownloading">
                                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4">
                                        </circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                </span>
                                <span v-else>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                        stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </span>
                                <span>{{ isDownloading ? 'Creating Zip...' :
                                    isSelectionMode ?
                                        `Download Selected (${selectedImages.size})` :
                                        'Download All'
                                }}</span>
                            </button>
                            <button
                                class="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-300 text-sm"
                                @click="clearAllImages">Clear All</button>
                        </div>
                        <!-- Error message -->
                        <transition enter-active-class="transition ease-out duration-300"
                            enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-200"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95">
                            <div v-if="showError" class="text-red-500 text-sm mt-1">
                                {{ errorMessage }}
                            </div>
                        </transition>
                    </div>
                </div>
                <div v-if="hasSavedImages" class="grid grid-cols-2 gap-4 py-[1vh]">
                    <div v-for="img in savedImages" :key="img.id"
                        class="group relative flex justify-center items-center transition-transform duration-300 ease-in-out hover:scale-105">
                        <div class="relative w-full">
                            <img class="w-full h-auto rounded-md object-cover shadow-sm hover:shadow-md transition-shadow duration-300"
                                :class="{ 'ring-2 ring-blue-500 opacity-75': selectedImages.has(img.id) }" :src="img.src"
                                alt="Saved Image" @click="handleImageClick(img)" loading="lazy" />
                            <div class="absolute top-2 left-2">
                                <div v-if="selectedImages.has(img.id)"
                                    class="bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20"
                                        fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <button @click.stop="deleteImage(img.id)"
                                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else class="flex items-center justify-center h-[50vh]">
                    <p class="text-gray-500 text-center">There are no saved images yet.</p>
                </div>
            </div>
        </div>

        <transition enter-active-class="transition ease-out duration-300" enter-from-class="opacity-0 translate-x-4"
            enter-to-class="opacity-100 translate-x-0" leave-active-class="transition ease-in duration-300"
            leave-from-class="opacity-100 translate-x-0" leave-to-class="opacity-0 translate-x-14">
            <button v-if="props.showCloseButton"
                class="absolute top-[2vh] right-0 p-[1vh] bg-white rounded-l-md shadow-md hover:bg-gray-100 transition-colors duration-300"
                @click="clicked">
                <svg class="w-[2.5vh] h-[2.5vh] text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>
        </transition>
    </div>
</template>

<style scoped>
.bg-Secondary {
    background-color: #eaddcf;
}

div::-webkit-scrollbar {
    width: 0.5vh;
}

div::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 1vh;
}

div::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 1vh;
}

div::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>