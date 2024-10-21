<script setup>
import { ref, defineProps, defineEmits, inject, computed } from 'vue';

const emit = defineEmits(['close', 'selectImage']);
const isClosing = ref(false);
const savedImages = inject('savedImages');

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
    emit("selectImage", img);
};

const hasSavedImages = computed(() => savedImages.value.length > 0);
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
            <div class="p-[1.5vh] space-y-[1vh] relative">
                <h2 class="text-[2.5vh] font-semibold text-gray-800">SAVED IMAGES</h2>
                <div v-if="hasSavedImages" class="grid grid-cols-2 gap-4 py-[1vh]">
                    <div v-for="(img, index) in savedImages" :key="index"
                        class="flex justify-center items-center transition-transform duration-300 ease-in-out hover:scale-110">
                        <img class="w-full h-auto rounded-md object-cover cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300"
                            :src="img" alt="Saved Image" @click="selectImage(img)" loading="lazy" />
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

// Local Storage 
// UIse;
