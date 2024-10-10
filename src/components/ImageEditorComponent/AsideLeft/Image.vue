<script setup>
import { ref, defineProps, defineEmits, inject } from 'vue';

const emit = defineEmits(['close'], ["selectImage"]);
const isClosing = ref(false);
const handleImageSelected = inject('handleImageSelected');
const images = inject('images')

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


const selectImage = (img) => {
    handleImageSelected(img);
    emit('close');
};

const onScroll = (event) => {
    event.preventDefault();
    const scrollContainer = event.currentTarget;
    scrollContainer.scrollLeft += event.deltaY;
};
</script>

<template>
    <div class="relative flex">
        <div :class="[
            'transition-all duration-300 ease-in-out',
            'mx-auto',
            isClosing ? 'w-0' : 'w-[20vw]',
            props.showCloseButton ?
                'bg-Secondary h-screen' :
                'bg-Background my-4 rounded-xl shadow-[0_-1px_40px_-15px] shadow-slate-800/50 h-[95vh]'
        ]">
            <div class="whitespace-nowrap overflow-hidden">
                <label for="name">Image</label>
            </div>
            <div class="min-h-[95vh] w-[full] overflow-x-hidden flex items-center justify-start rounded-xl"
                @wheel="onScroll">
                <div v-for="(img, index) in images" :key="index"
                    class="object-fill flex justify-center items-center cursor-pointer" @click="selectImage(img.src)">
                    <img class="min-w-[8vw]" :src="img.src" :alt="img.alt" />
                </div>
            </div>
        </div>
        <div v-if="props.showCloseButton" :class="[
            'absolute top-4 transition-all duration-300 ease-in-out',
            isClosing ? 'right-[calc(100%-3vw)]' : 'right-0'
        ]">
            <button class="cursor-pointer p-1 bg-Background rounded-l-xl hover:bg-Main" @click="clicked">
                <svg class="icon-svg" width="2vw" height="4vh" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 8L10 12L14 16" stroke="#200E32" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
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


// fix ui
// change the import button to here