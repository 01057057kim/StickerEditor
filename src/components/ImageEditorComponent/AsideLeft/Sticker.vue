<script setup>
import { ref, defineProps, defineEmits, inject, reactive, onMounted } from 'vue';

const handleStickerSelected = inject('handleStickerSelected');
const emit = defineEmits(['close']);
const isClosing = ref(false);
const customStickers = ref([]);
const errorMessage = ref('');
const showError = ref(false);

function getImageUrl(folder, name) {
    return new URL(`../../../assets/Images/sticker/${folder}/${name}.png`, import.meta.url).href;
}

const stickerCategories = {
    comic: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    frames: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    reactions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']
};

const images = ref({
    comic: stickerCategories.comic.map(name => ({
        src: getImageUrl('Comic Stickers', name),
        alt: `Comic Stickers ${name}`
    })),
    frames: stickerCategories.frames.map(name => ({
        src: getImageUrl('Sticker Frames', name),
        alt: `Sticker Frames ${name}`
    })),
    reactions: stickerCategories.reactions.map(name => ({
        src: getImageUrl('Reaction Stickers', name),
        alt: `Reaction Stickers ${name}`
    }))
});

const onStickerClick = (stickerSrc) => {
    handleStickerSelected(stickerSrc);
};

const onScroll = (event, category) => {
    if (expandedCategories[category]) {
        return;
    }
    event.preventDefault();
    const scrollContainer = event.currentTarget;
    scrollContainer.scrollLeft += event.deltaY;
};

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

const expandedCategories = reactive({
    comic: false,
    frames: false,
    reactions: false
});

function toggleExpand(category) {
    expandedCategories[category] = !expandedCategories[category];
}

const uploadSticker = (event) => {
    const file = event.target.files[0];
    const maxSize = 5 * 1024 * 1024;
    const reader = new FileReader();

    if (!file) return;

    if (file.type !== 'image/png') {
        showError.value = true;
        errorMessage.value = 'Please upload PNG images only';
        setTimeout(() => {
            showError.value = false;
            errorMessage.value = '';
        }, 3000);
        return;
    }

    if (file.size > maxSize) {
        showError.value = true;
        errorMessage.value = 'File size should be less than 5MB';
        setTimeout(() => {
            showError.value = false;
            errorMessage.value = '';
        }, 3000);
        return;
    }

    reader.onload = (e) => {
        const newSticker = {
            id: Date.now(),
            src: e.target.result,
            alt: file.name
        };
        customStickers.value.push(newSticker);
        save();
    };
    reader.readAsDataURL(file);
};

const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';
    input.style.display = 'none';

    input.addEventListener('change', (e) => {
        uploadSticker(e);
        document.body.removeChild(input);
    });

    document.body.appendChild(input);
    input.click();
};

const deleteSticker = (id) => {
    customStickers.value = customStickers.value.filter(sticker => sticker.id !== id);
    save();
};

const uploadClick = (stickerSrc) => {
    handleStickerSelected(stickerSrc);
};

const save = () => {
    localStorage.setItem('customStickers', JSON.stringify(customStickers.value));
};

onMounted(() => {
    const savedStickers = localStorage.getItem('customStickers');
    if (savedStickers) {
        try {
            customStickers.value = JSON.parse(savedStickers);
        } catch (e) {
            console.error('Error parsing saved stickers:', e);
            customStickers.value = [];
        }
    }
});
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
            <div v-for="(category, index) in Object.keys(images)" :key="index" class="p-[1.5vh] space-y-[1vh] relative">
                <div class="flex w-[10.5vw] justify-between">
                    <h2 class="text-[2.5vh] font-semibold text-gray-800">
                        {{ category.toUpperCase() }}
                    </h2>
                    <button @click="toggleExpand(category)"
                        class="bg-blue-500 text-white px-1 py-1 text-xs rounded-full shadow-md hover:bg-blue-600 transition-colors duration-300">
                        {{ expandedCategories[category] ? 'Collapse' : 'Expand' }}
                    </button>
                </div>
                <div :class="[
                    expandedCategories[category] ? 'grid grid-cols-2 gap-4' : 'flex items-center space-x-[1vw]',
                    'py-[1vh] transition-all duration-300',
                    expandedCategories[category] ? 'overflow-y-auto' : 'overflow-x-auto'
                ]" @wheel="(event) => onScroll(event, category)">
                    <div v-for="(img, imgIndex) in images[category]" :key="imgIndex"
                        class="flex justify-center items-center flex-shrink-0 transition-transform duration-300 ease-in-out hover:scale-110 hover:brightness-125 ">
                        <img :class="[
                            expandedCategories[category] ? 'w-full h-auto' : 'w-[5vw] h-[5vw] max-w-[72px] max-h-[72px]',
                            'rounded-md object-fill cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300'
                        ]" :src="img.src" :alt="img.alt" @click="onStickerClick(img.src)" loading="lazy" />
                    </div>
                </div>
            </div>
            <!-- Custom Sticker -->
            <div class="p-[1.5vh] space-y-[1vh]">
                <h2 class="text-[2.5vh] font-semibold text-gray-800">CUSTOM STICKERS</h2>
                <div v-if="showError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4"
                    role="alert">
                    <span class="block sm:inline">{{ errorMessage }}</span>
                </div>
                <div v-if="customStickers.length === 0"
                    class="h-[15vh] flex justify-center items-center border-Tertiary border-2 border-dashed rounded-xl p-2">
                    <button @click="handleUpload"
                        class="w-full h-full rounded transition flex justify-center items-center duration-300 space-x-2 hover:scale-110">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="black">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span class="text-black font-bold">Upload Sticker</span>
                    </button>
                </div>
                <div v-else class="min-h-[15vh] p-2 grid grid-cols-3 gap-2 border-white border-2 border-dashed rounded-xl">
                    <div v-for="sticker in customStickers" :key="sticker.id"
                        class="relative group flex items-center justify-center">
                        <img :src="sticker.src" :alt="sticker.alt" @click="uploadClick(sticker.src)"
                            class="w-full h-full object-contain cursor-pointer rounded shadow hover:shadow-md transition-shadow duration-300" />
                        <button @click="deleteSticker(sticker.id)"
                            class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="flex items-center justify-center">
                        <button @click="handleUpload"
                            class="border-Tertiary border-2 border-dashed rounded-xl text-white font-bold transition duration-300 flex items-center justify-center min-h-[12vh] w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24"
                                stroke="black">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span class="text-black font-bold">Add</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!------------------------------------------------------------------>
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
    height: 0.5vh;
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

// fix ui Expand and Collapse

// add more sticker
// user can upload own sticker ( V )
